(function() {
    'use strict'

    module.exports = {
        getCoins: getCoins,
        generateReceiveAddress: generateReceiveAddress
    }
    
    const bitgojs = require('bitgo')
    const fs = require('fs')
    const Promise = require('bluebird')
    
    var bitgo

    var coins = []
    var wallets = {}
    
    
    start()
    function start() {
        // Load the environment (test or prod) and access token, and authenticate with BitGo
        const bitgoEnv = process.env.bitgoEnvironment
        const accessToken = process.env.bitgoAccessToken
        console.log(`Connecting to BitGo ****${bitgoEnv.toUpperCase()}**** network with access token ${accessToken.slice(0,4)}****${accessToken.slice(-4)}`)
        
        bitgo = new bitgojs.BitGo({env: bitgoEnv})
        bitgo.authenticateWithAccessToken({accessToken: accessToken})
        
        // Load supported coins from coins.json
        coins = JSON.parse(fs.readFileSync('./bitgo/coins.json'))
        
        // If using test network, use testnet coins by appending 't' before each ticker
        if (bitgoEnv.toLowerCase() !== 'prod') {
            for (let i = 0; i < coins.length; i++) {
                coins[i].ticker = 't' + coins[i].ticker
            }
        }

        // Find wallets for each supported currency, store in wallets object
        for (let i = 0; i < coins.length; i++) {
            let ticker = coins[i].ticker

            bitgo.coin(ticker).wallets().list({}).then( function (response) {
                let wallet = response.wallets.find( wallet => wallet._wallet.label === "web_store_receive_wallet")

                if (wallet) {
                    console.log(`Found ${ticker.toUpperCase()} wallet: ${wallet._wallet.id}`)
                    wallets[ticker] = wallet._wallet.id
                } else {
                    console.log(`Unable to find ${ticker.toUpperCase()} wallet.`)
                }
            })
        }

        // Retrieve market prices in USD every minute
        refreshMarketData()
        setInterval(refreshMarketData, 60 * 1000)
    }

    /**
     * Gets the list of supported currencies, including exchange rates
     */
    function getCoins() {
        return coins
    }

    /**
     * Generates and returns a BIP38 deterministic address for the web store receive wallet. Addresses should be unique to each order
     * @param {String} coin Ticker of the coin to generate an address for
     */
    function generateReceiveAddress(coin) {
        return bitgo.coin(coin).wallets().get({ id: wallets[coin] }).then( function (wallet) {
            return wallet.createAddress({ label: 'BitGo web store receive address'}).then(function (response) {
                console.log(`Generated ${coin.toUpperCase()} receive address ${response.address}`)
                return response.address
            })
        })
    }
    
    function refreshMarketData() {
        Promise.map(coins, function (coin) {
            return bitgo.coin(coin.ticker).markets().latest({}, function (err, marketData) {
                if (err) {
                    console.error(`Error occurred fetching market data for ${coin.ticker.toUpperCase}`)
                    return
                }

                coin.exchangeRate = marketData.latest.currencies.USD.last
            })
        })
    }
})()
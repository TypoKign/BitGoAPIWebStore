/**
 * api.js
 * 
 * Provides an API to the client to request simple data from the server. Also handles requests to the BitGo network
 * 
 * BitGo access token to be provided via the bitgoAccessToken environment variable
 */

const express = require("express")
const bitgoModule = require("bitgo")
const Promise = require("bluebird")

const dbDriver = require("./db.js")

const router = express.Router()

// Supported currencies, minus data from the BitGo API (will be fetched upon request)
const currencies = [
    {
        name: "bitcoin",
        ticker: "btc",
        icon: "/svg/btc.svg"
    },
    {
        name: "ether",
        ticker: "eth",
        icon: "/svg/eth.svg"
    },
    {
        name: "ripple",
        ticker: "xrp",
        icon: "/svg/xrp.svg"
    },
    {
        name: "bitcoincash",
        ticker: "bch",
        icon: "/svg/bch.svg"
    },
    {
        name: "litecoin",
        ticker: "ltc",
        icon: "/svg/ltc.svg"
    }
]

const bitgoEnv = 'test'
const accessToken = process.env.bitgoAccessToken
console.log(`Connecting to BitGo *${bitgoEnv.toUpperCase()}* network with access token ${accessToken.slice(0, 4)}***${accessToken.slice(-4)}`)

var bitgo = new bitgoModule.BitGo({env: bitgoEnv})
bitgo.authenticateWithAccessToken({accessToken})

// If we are on testnet, fix the tickers on the currencies
if (bitgoEnv === 'test') {
    for (let i = 0; i < currencies.length; i++) {
        // append a 't' to the beginning of each ticker
        currencies[i].ticker = 't' + currencies[i].ticker; 
    }
}

// Log all API requests
router.use((req, res, next) => {
    console.log(`API call from ${req.ip} - ${req.url}`)
    next()
})

router.get('/', (req, res) => {
    res.json({message: "API Router Root"})
})

// For each currency, fetch the exchange rate data from the BitGo market API
router.get('/currencies', (req, res) => {
    Promise.map(currencies, (currency) => {
        return bitgo.coin(currency.ticker).markets().latest({}, (err, marketData) => {
            if (err) {
                res.json({message: "Error occurred fetching market data", error: err})
                return
            }

            currency.exchangeRate = marketData.latest.currencies.USD.last
        })
    }).then(() => {
        res.json(currencies)
    })
})

// Allow users to request a list of products from MongoDB
router.get('/products', (req, res) => {
    res.json(dbDriver.products)
})

router.post('/checkout', (req, res) => {
    // Convert the product information into a reference to a product in MongoDB. Only the ID and the quantity are needed
    var cart = req.body.cart.map(element => ({
        product: element._id,
        quantity: element.quantity
    }))

    // Accumulate the prices of the objects in the cart. Does NOT trust the client's values, re-calculates from the database driver
    var totalPriceUsd = req.body.cart.reduce( (price, product) => {
        return price + product.quantity * dbDriver.getProductPrice(product._id) 
    }, 0)

    dbDriver.addOrder(req.body.checkoutInfo.name,
                      req.body.checkoutInfo.email,
                      cart,
                      totalPriceUsd,
                      req.body.currency
    )

    
})

// Pass the router to our main router
exports.router = router
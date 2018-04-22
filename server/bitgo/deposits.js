(function() {
    'use strict'

    const dbDriver = require('../database/db.js')
    const bgDriver = require('./bitgo.js')
    const config = require('../config.js')

    const BigNumber = require('bignumber.js')
    const Promise = require('bluebird')

    const TEN = new BigNumber(10)

    module.exports = DepositService

    var pendingDeposits = []
    
    function PendingDeposit(transferId, address, amount, coin) {
        this.transferId = transferId
        this.address = address
        this.amount = amount
        this.coin = coin

        dbDriver.markAsPending(address)
    }

    function DepositService(bitgo, walletIds) {
        this.bitgo = bitgo
        this.wallets = []

        var getWalletQueries = []
        for (const coin in walletIds) {
            if (walletIds.hasOwnProperty(coin)) {
                const id = walletIds[coin];
                
                getWalletQueries.push(this.bitgo.coin(coin).wallets().get({ id: id }))
            }
        }

        // this.wallets stores wallet objects, which can be used to query balances
        Promise.all(getWalletQueries).then((wallets) => {
            this.wallets = wallets
        })
    }

    DepositService.prototype.update = function() {
        findNewDeposits.call(this)

        checkPendingDepositConfirmations.call(this)
    }

    function findNewDeposits() {
        if (this.wallets.length == 0) return // wallets havent been instantiated yet
        // Get every transfer of every wallet
        var getAllTransfersQueries = this.wallets.map( wallet => wallet.transfers())

        Promise.all(getAllTransfersQueries).then(function(transfers) {
            for (let transfersPerCoin of transfers) {
                for (let transfer of transfersPerCoin.transfers) {
                    // Discard transfers that don't have outputs
                    if (transfer.outputs == null) return

                    Promise.filter(transfer.outputs, function (output) {
                        return dbDriver.isUnpaidReceiveAddress(output.address).then(function (isValid) {
                            return isValid
                        })
                    }).each(function (validOutput) {
                        addPendingDeposit(transfer.id, validOutput.address, validOutput.valueString, transfer.coin)
                    })
                }
            }
        })
    }

    function checkPendingDepositConfirmations() {
        for (let pendingDeposit of pendingDeposits) {
            var wallet = this.wallets.find( wallet => wallet.baseCoin.type === pendingDeposit.coin)
            
            var coinDecimals = bgDriver.getCoins().find(coinObj => coinObj.ticker === pendingDeposit.coin).decimals
            var amountPretty = new BigNumber(pendingDeposit.amount).div(TEN.pow(coinDecimals))

            wallet.getTransfer( {id: pendingDeposit.transferId} ).then(function (transfer) {
                if (transfer.confirmations >= config.minConfirmations[pendingDeposit.coin]) {
                    console.log(`Deposit CONFIRMED at ${pendingDeposit.address} - ${amountPretty} ${pendingDeposit.coin.toUpperCase()}`)
                    dbDriver.markAsPaid(pendingDeposit.address)

                    pendingDeposits.splice(pendingDeposits.indexOf(pendingDeposit), 1)
                }
            })
        }
    }

    function addPendingDeposit(transferId, address, amount, coin) {
        var identicalDeposit = pendingDeposits.find(function (deposit) {
            return deposit.transferId === transferId
        })
        var existingDeposit = pendingDeposits.find(function (deposit) {
            return deposit.address === address && deposit.transferId != transferId
        })

        var coinDecimals = bgDriver.getCoins().find(coinObj => coinObj.ticker === coin).decimals
        var amountPretty = new BigNumber(amount).div(TEN.pow(coinDecimals))

        if (identicalDeposit != null) {
            // If we've already accounted for the exact transaction, disregard
            return
        } else if (existingDeposit != null) {
            // If we've accounted for a transaction by the same buyer, modify the existing transaction
            console.log(`Received PENDING deposit CORRECTION at ${address} - ${amountPretty} ${coin.toUpperCase()}`)
            existingDeposit.amount += amount
        } else {
            // Otherwise push a new deposit onto the array
            console.log(`Received new PENDING deposit at ${address} - ${amountPretty} ${coin.toUpperCase()}`)
            pendingDeposits.push(new PendingDeposit(transferId, address, amount, coin))
        }
    }
})()
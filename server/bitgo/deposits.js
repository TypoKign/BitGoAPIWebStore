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
    
    /**
     * Represents a deposit that has been seen on the network but does not have enough confirmations to be considered secure
     * @param {String} transferId The ID of the transaction from BitGo
     * @param {String} address The receive address receiving funds from this transaction
     * @param {String} amount The amount in Satoshi/Wei/Drop/etc
     * @param {String} coin The ticker of the coin being used
     */
    function PendingDeposit(transferId, address, amount, coin) {
        this.transferId = transferId
        this.address = address
        this.amount = amount
        this.coin = coin

        // Instruct the database to mark the order as PENDING
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

        // walletIds are only string IDs, convert them to wallet objects
        // this.wallets stores wallet objects, which can be used to query balances
        Promise.all(getWalletQueries).then((wallets) => {
            this.wallets = wallets
        })
    }

    DepositService.prototype.update = function() {
        // Scan the network for new deposits and place them in the pending pool
        findNewDeposits.call(this)

        // Check each pending deposit in the pool for confirmations
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

                    // Filter out outputs that are not tied to an order (e.g. change addresses)
                    Promise.filter(transfer.outputs, function (output) {
                        return dbDriver.isUnpaidReceiveAddress(output.address).then(function (isValid) {
                            return isValid
                        })
                    }).each(function (validOutput) {
                        // For each output tied to an order, add an entry to the pending deposit pool
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

            // Query BitGo for information about each transfer in the pool
            wallet.getTransfer( {id: pendingDeposit.transferId} ).then(function (transfer) {
                // Confirm deposits that have enough confirmations (specified in config.js)
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
            // If we've accounted for a transaction for the same order, modify the existing transaction
            console.log(`Received PENDING deposit CORRECTION at ${address} - ${amountPretty} ${coin.toUpperCase()}`)
            existingDeposit.amount += amount
        } else {
            // Otherwise push a new deposit onto the array
            console.log(`Received new PENDING deposit at ${address} - ${amountPretty} ${coin.toUpperCase()}`)
            pendingDeposits.push(new PendingDeposit(transferId, address, amount, coin))
        }
    }
})()
(function() {
    'use strict'

    const dbDriver = require('../database/db.js')
    const config = require('../config.js')

    const Promise = require('bluebird')

    /**
     * Instantiates a service to track incoming deposits to a list of wallets
     * @param {BitGo} bitgo Authenticated connection to the BitGo network
     * @param {} walletIds Object of coin tickers mapped to wallet IDs
     */
    function DepositService(bitgo, walletIds) {
        this.bitgo = bitgo
        this.wallets = []

        // Get a reference to each wallet specified in walletIds
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

    /**
     * Queries the BitGo network for new transactions
     */
    DepositService.prototype.update = function() {
        // Get transfers of each wallet (one wallet per coin)
        var transactionQueries = this.wallets.map(wallet => wallet.transfers())

        Promise.all(transactionQueries).then(function (transactions) {
            // Iterate over the array of all transactions for a single coin
            transactions.forEach( coinTransactions => {
                // Iterate over each transaction for that coin
                coinTransactions.transfers.forEach( transaction => {
                    // Try to handle each transaction
                    processTransaction(transaction)
                })
            })
        })
    }

    function processTransaction(transaction) {
        // If the transaction doesn't have any outputs, we're not interested (probably a Ripple wallet opening)
        if (!transaction.outputs) {
            return
        }

        // If the transaction doesn't have enough confirmations, exit
        if (!transaction.confirmations || transaction.confirmations < config.minConfirmations[transaction.coin]) {
            return
        }

        // If the transaction appears to be a normal transaction, let the database driver try to match it to an order
        transaction.outputs.forEach( output => {
            dbDriver.processDeposit(output.address, output.valueString)
        })
    }

    module.exports = DepositService
})()
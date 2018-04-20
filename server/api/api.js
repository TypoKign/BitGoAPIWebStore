/**
* api.js
* 
* Provides an API to the client to request simple data from the server. Also handles requests to the BitGo network
* 
* BitGo access token to be provided via the bitgoAccessToken environment variable
*/

(function() {
    'use strict'
    
    const express = require("express")
    
    const bgDriver = require('../bitgo/bitgo.js')
    const dbDriver = require("../database/db.js")
    
    const router = express.Router()
    
    // Log all API requests
    router.use(function (req, res, next)  {
        console.log(`API call from ${req.ip} - ${req.url}`)
        next()
    })
    
    router.get('/', function (req, res) {
        res.json({message: "API Router Root"})
    })
    
    // Retrieve currencies and exchange rates from BitGo driver
    router.get('/currencies', function (req, res) {
        res.json(bgDriver.getCoins())
    })
    
    // Retrieve products from the Mongo database
    router.get('/products', function (req, res) {
        res.json(dbDriver.getProducts())
    })
    
    // Allow user to query list of available categories
    router.get('/categories', function (req, res) {
        res.json(["Category 1", "Category 2", "Category 3", "Category 4"])
    })
    
    // Prepares an order in the database and supplies an address to deposit to
    router.post('/checkout', function (req, res) {
        // Accumulate the prices of the objects in the cart. Does NOT trust the client's values, re-calculates from the database driver
        dbDriver.priceMany(req.body.cart).then(function (totalPriceUsd) {
            var coin = req.body.currencyTicker

            var price = totalPriceUsd / bgDriver.getCoins().find( coinObj => coinObj.ticker === coin).exchangeRate

            bgDriver.generateReceiveAddress(req.body.currencyTicker).then(function (addr) {
                dbDriver.addOrder(req.body.buyerName,
                                  req.body.buyerEmail,
                                  req.body.cart,
                                  price,
                                  coin,
                                  addr,
                                  false
                )
                res.json({
                    price: totalPriceUsd,
                    address: addr,
                    qrCode: `https://chart.googleapis.com/chart?cht=qr&chs=384x384&chl=${addr}&chld=m`
                })
            })            
        })
    })
    
    // Pass the router to our main router
    exports.router = router
})()

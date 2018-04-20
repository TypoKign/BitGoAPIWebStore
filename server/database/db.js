/**
* db.js
* 
* Provides a driver to accessing products and orders from a MongoDB database.
* 
* Database URI(s) is to be provided via the productsMongoUri environment variable
* Username is to be provided via the productsMongoUsername environment variable
* Password is to be provided via the productsMongoPassword environment variable
* Additional options (if needed) is to be provided via the productsMongoOptions variable (beginning with a ?)
* 
* This driver specifies schemas for products and orders, as well as functions for managing products and orders
*/

(function() {
    'use strict'

    module.exports = {
        getProducts: getProducts,
        addOrder: addOrder,
        priceOne: priceOne,
        priceMany: priceMany,
        getUnpaidOrders: getUnpaidOrders,
        processDeposit: processDeposit
    }
    
    var mongoose = require('mongoose')
    var Promise = require('bluebird')
    
    // Product schema and model definition
    var productSchema = new mongoose.Schema({
        name: String,
        description: String,
        category: String,
        price: Number,
        image: String
    })
    var Product = mongoose.model('Product', productSchema)
    
    // Order schema and model definition
    var productReferenceSchema = new mongoose.Schema({
        product: String, // The product's _id field, casted to string
        quantity: Number
    }, {_id: false}) // By default, sub-documents contain the _id field. Not necessary for my use case
    
    var orderSchema = new mongoose.Schema({
        name: String,
        email: String,
        date: Date,
        cart: [productReferenceSchema],
        totalPriceUsd: Number,
        coin: String,
        address: String,
        paid: Boolean
    })
    var Order = mongoose.model('Order', orderSchema)

    var products = []
    
    start()
    function start() {
        // Database connection
        const username = process.env.productsMongoUsername
        const password = process.env.productsMongoPassword
        const uri = process.env.productsMongoUri
        const options = process.env.productsMongoOptions
        mongoose.connect(`mongodb://${username}:${password}@${uri}/bitgoApiStore${options}`)
        var db = mongoose.connection
        db.on('error', console.error.bind(console, 'MongoDB connection error:'))
        
        db.once('open', function () {
            console.log(`Connected to MongoDB cluster with primary server ${uri.split(',')[0]}`)
            
            // Query the database for all products, and export them
            Product.find(function (err, result) {
                products = result
            })
        })

        // Refesh products from database every 5 minutes
        refreshProducts()
        setInterval(refreshProducts, 5 * 60 * 1000)
    }

    /**
     * Returns a list of products from the database
     */
    function getProducts() {
        return products
    }

    /**
     * Adds an order to the database
     * @param {String} buyerName The name of the buyer
     * @param {String} buyerEmail The buyer's email address
     * @param {{product: String, quantity: Number}[]} cart Array of product references with values product (id) and quantity
     * @param {Number} totalPriceUsd Price of the order
     * @param {String} coinTicker Ticker of the cryptocurrency for this order
     */
    function addOrder(buyerName, buyerEmail, cart,  totalPriceUsd, coinTicker, address) {
        var order = new Order({
            name: buyerName,
            email: buyerEmail,
            date: Date.now(),
            cart: cart,
            totalPriceUsd: totalPriceUsd,
            coin: coinTicker,
            address: address,
            paid: false
        })

        order.save()
    }

    /**
     * Queries the database for the price in USD of a product
     * @param {String} productId The product's ID from the database
     * @param {?Number} quantity Quantity of products to price (defaults to 1)
     */
    function priceOne(productId, quantity) {
        quantity = quantity || 1

        return Product.findById(productId).exec().then(function (product) {
            return product.price * quantity
        })
    }
    /**
     * Totals the price for an array of product references, such as the cart array sent from the client
     * @param {{product: String, quantity: Number}[]} productReferences Array of product references
     */
    function priceMany(productReferences) {
        return Promise.reduce(productReferences, function (acc, product) {
            return priceOne(product.product, product.quantity).then(function (price) {
                return acc + price
            })
        }, 0).then(function (total) {
            return total
        })
    }

    /**
     * Queries the database for all orders within the past month that are unpaid
     */
    function getUnpaidOrders() {
        var oneMonthAgo = new Date()
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
        return Order.find({ paid: false, date: { $gte: oneMonthAgo } }).exec().then(function (orders) {
            return orders
        })
    }

    function refreshProducts() {
        Product.find( function (err, products) {
            if (err) {
                console.error('Failed to retrieve products from database')
                return
            }

            products = products
        })
    }

    /**
     * Find the order associated with the receive address and mark it as paid if the value received is at least the price of the order
     * @param {String} address The address that was deposited to
     * @param {String} valueString The value of the deposit in the currency 
     */
    function processDeposit(address, valueString) {
        Order.findOne({
            address: address,
            paid: false
        }).exec()
        .then(function (order) {
            if (order == null) return

            if (valueString >= order.totalPriceUsd) {
                console.log(`Received ${valueString} ${order.coin.toUpperCase()} deposit! Marking order #${order._id} as paid.`)
                markAsPaid(order._id)
            }
        })
    }

    function markAsPaid(orderId) {
        Order.update( {
            _id: orderId
        }, {
            paid: true
        }).exec()
    }
})()
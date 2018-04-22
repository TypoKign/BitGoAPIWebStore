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
        getOrderStatus: getOrderStatus,
        priceOne: priceOne,
        priceMany: priceMany,
        isUnpaidReceiveAddress: isUnpaidReceiveAddress,
        markAsPaid: markAsPaid,
        markAsPending: markAsPending
    }
    
    const bgDriver = require('../bitgo/bitgo.js')
    const config = require('../config.js')

    const mongoose =    require('mongoose')
    const Promise =     require('bluebird')
    const BigNumber =   require('bignumber.js')

    const TEN = new BigNumber(10) // useful for scientific notation
    
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
        price: String,
        coin: String,
        status: String,
        address: String
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
     * @param {String} price Price of the order in the cryptocurrency associated with the order
     * @param {String} coinTicker Ticker of the cryptocurrency for this order
     */
    function addOrder(buyerName, buyerEmail, cart,  price, coinTicker, address) {
        var order = new Order({
            name: buyerName,
            email: buyerEmail,
            date: Date.now(),
            cart: cart,
            price: price,
            coin: coinTicker,
            status: "UNPAID",
            address: address
        })

        return order.save().then(function (savedOrder) {
            return savedOrder._id
        })

        console.log(`[New Order] From ${buyerName} - ${price.toFixed(6)} ${coinTicker.toUpperCase()}`)
    }

    function getOrderStatus(orderId) {
        return Order.findById(orderId, 'status').exec().then(function (order) {
            if (order != null)
                return order.status
        })
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

    function refreshProducts() {
        Product.find( function (err, products) {
            if (err) {
                console.error('Failed to retrieve products from database')
                return
            }

            products = products
        })
    }
    function isUnpaidReceiveAddress(address) {
        return Order
            .find({address: address})
            .where('status').in(["UNPAID", "PENDING", null])
            .exec()
        .then(function (order) {
            return order.length > 0
        })
    }

    function markAsPaid(address) {
        Order.update( {
            address: address
        }, {
            status: "PAID"
        }).exec()
    }

    function markAsPending(address) {
        Order.update( {
            address: address
        }, {
            status: "PENDING"
        }).exec()
    }
})()
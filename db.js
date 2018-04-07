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
var mongoose = require("mongoose")

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
    currency: String,
    paid: Boolean
})
var Order = mongoose.model('Order', orderSchema)

// Database connection
var username = process.env.productsMongoUsername
var password = process.env.productsMongoPassword
var uri = process.env.productsMongoUri
var options = process.env.productsMongoOptions
mongoose.connect(`mongodb://${username}:${password}@${uri}/bitgoApiStore${options}`)
var db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

db.once('open', () => {
    console.log(`Connected to MongoDB cluster with primary server ${uri.split(',')[0]}`)

    // Query the database for all products, and export them
    Product.find((err, products) => {
        exports.products = products
    })
})

/**
 * Returns the price of a product in USD from the cached products list
 * @param {String} productId 
 */
exports.getProductPrice = function(productId) {
    var product = exports.products.find( (product) => {
        return product._id == productId
    })

    if (product) {
        return product.price
    }

    return 0
}

/**
 * Adds an order to the orders collection
 * @param {String} buyerName Name provided by the user via the checkout form
 * @param {String} buyerEmail Email address provided by the user via the checkout form
 * @param {[{product: String, quantity: Number}]} cart Array of product references in the user's cart. 
 * @param {Number} totalPriceUsd Total price (USD) of the user's cart
 * @param {String} currencyTicker Ticker of the currency selected by the user
 */
exports.addOrder = function(buyerName, buyerEmail, cart, totalPriceUsd, currencyTicker) {
    var order = new Order({
        name: buyerName,
        email: buyerEmail,
        date: Date.now(),
        cart: cart,
        totalPriceUsd: totalPriceUsd,
        currency: currencyTicker,
        paid: false
    })

    order.save((err) => {
        if (err) console.error("Unable to add order to database\n" + err)
    })
}
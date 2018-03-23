/**
 * products.js
 * 
 * Provides a driver to accessing products from a MongoDB database.
 * 
 * Database URI(s) is to be provided via the productsMongoUri environment variable
 * Username is to be provided via the productsMongoUsername environment variable
 * Password is to be provided via the productsMongoPassword environment variable
 * Additional options (if needed) is to be provided via the productsMongoOptions variable (beginning with a ?)
 * 
 * This driver specifies the schema of products and provides functions for managing products within the database
 */
var mongoose = require("mongoose")

// Product schema and model definition
var productSchema = mongoose.Schema({
    name: String,
    description: String,
    category: String,
    price: Number,
    image: String
})
var Product = mongoose.model('Product', productSchema)

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

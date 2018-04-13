/**
 * server.js
 * 
 * Launches a Node.js Express HTTP server
 * Serves static files in the /public/ directory
 * Uses the api.js router for all /api/ requests
 */

const express = require("express");
const path = require("path")
const api = require("./api.js")

var bodyParser = require("body-parser")

// Initialize Express HTTP server
const port = 80;
const app = express();

// Sanitize POST requests in json and x-www-form-urlencoded
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Serve static files in the /public/ directory
app.use('/res', express.static(__dirname + '/res'))
app.use('/webstore', express.static(__dirname + '/webstore'))
app.use('/dependencies', express.static(__dirname + '/dependencies'))

// Pass control of all /api requests to api.js
app.use('/api', api.router)

app.all('/*', function (req, res, next) {
    res.sendFile('index.html', {root: __dirname + "/webstore"})
})

// Start Express server
app.listen(port, (err) => {
    if (err) {
        console.log("Failed to bind to port", err)
        process.exit(-1)
    }

    console.log(`Server listening on port ${port}`)
})
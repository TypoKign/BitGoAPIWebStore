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

// Initialize Express HTTP server
const port = 80;
const app = express();

// Serve static files in the /public/ directory
app.use(express.static('public'))

// Pass control of all /api requests to api.js
app.use('/api', api.router)

// Start Express server
app.listen(port, (err) => {
    if (err) {
        console.log("Failed to bind to port", err)
        process.exit(-1)
    }

    console.log(`Server listening on port ${port}`)
})
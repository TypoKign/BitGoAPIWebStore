/**
* server.js
* 
* Launches a Node.js Express HTTP server
* Serves static files in the /public/ directory
* Uses the api.js router for all /api/ requests
*/

(function() {
    'use strict'
    
    const express = require("express");
    const path = require("path")
    const bodyParser = require("body-parser")

    const api = require("./api/api.js")
    
    // Initialize Express HTTP server
    const port = 80;
    const app = express();
    
    // Sanitize POST requests in json and x-www-form-urlencoded
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    
    // Serve static files
    app.use('/res', express.static('../res'))
    app.use('/webstore', express.static('../webstore'))
    app.use('/dependencies', express.static('../dependencies'))
    
    // Pass control of all /api requests to api.js
    app.use('/api', api.router)
    
    // For all other requests, pass control to the angularjs routed app
    app.all('/*', function (req, res, next) {
        res.sendFile('index.html', {root: "../webstore"})
    })
    
    // Start Express server
    app.listen(port, (err) => {
        if (err) {
            console.log("Failed to bind to port", err)
            process.exit(-1)
        }
        
        console.log(`Server listening on port ${port}`)
    })
})()

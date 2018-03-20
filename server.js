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

// Serve index.html
app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, '/index.html'))
})

// Start Express server
app.listen(port, (err) => {
    if (err) {
        console.log("Failed to bind to port", err)
        process.exit(-1)
    }

    console.log(`Server listening on port ${port}`)
})
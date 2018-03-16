const express = require("express");
const port = 80;

const path = require("path")

const app = express();

app.set('views', path.join(__dirname, 'views'))

app.use(express.static('public'))

app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, '/index.html'))
})

app.listen(port, (err) => {
    if (err) {
        console.log("Failed to bind to port", err)
        process.exit(-1)
    }

    console.log(`Server listening on port ${port}`)
})
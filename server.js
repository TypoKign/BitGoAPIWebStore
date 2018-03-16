const express = require("express");
const app = express();
const port = 80;

app.get('/', (request, response) => {
    response.send("Hello World!")
})

app.listen(port, (err) => {
    if (err) {
        console.log("Failed to bind to port", err)
        process.exit(-1)
    }

    console.log(`Server listening on port ${port}`)
})
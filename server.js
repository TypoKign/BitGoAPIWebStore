const express = require("express");
const port = 80;

const path = require("path")
const handlebars = require("express-handlebars")

const app = express();

app.engine('.hbs', handlebars({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views/layouts')
}))

app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.static('public'))

app.get('/', (request, response) => {
    response.render('home')
})

app.listen(port, (err) => {
    if (err) {
        console.log("Failed to bind to port", err)
        process.exit(-1)
    }

    console.log(`Server listening on port ${port}`)
})
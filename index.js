const express = require("express")
const app = express();
const path = require("path")
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))


app.get('/', (req, res) => {
    res.render('tweets/home')
})

app.listen(3000, (req, res) => {
    console.log(`Listening to port ${port}`)
})
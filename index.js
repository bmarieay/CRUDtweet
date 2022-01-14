const express = require("express")
const app = express();
const path = require("path")
const { v4: uuid } = require('uuid');
uuid();
const port = 3000;


//configure ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

//array of tweets to mimic a database
const tweetsData = [
    {
        id: uuid(),
        username: 'IamMarie',
        tweet:  'just woke up!'
    },
    {
        id: uuid(),
        username: 'bob',
        tweet:  'Cant wait!'
    },
    {
        id: uuid(),
        username: 'Dan123',
        tweet:  'I passed!'
    },
    {
        id: uuid(),
        username: 'mynameis',
        tweet:  'It is so cold'
    }
]



//routes
app.get('/', (req, res) => { //homepage
    res.render('tweets/home')
})

app.get('/tweets', (req, res) => {
    //pass the array of objects
    res.render('tweets/index', {tweets : tweetsData})

})




//=====
app.listen(3000, (req, res) => {
    console.log(`Listening to port ${port}`)
})
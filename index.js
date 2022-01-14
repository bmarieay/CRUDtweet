const express = require("express")
const app = express();
const path = require("path")
const { v4: uuid } = require('uuid');
uuid();
const port = 3000;

// app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

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



//routes//
app.get('/', (req, res) => { //homepage
    res.render('tweets/home')
})

//DISPLAY ALL TWEETS
app.get('/tweets', (req, res) => {
    //pass the array of objects
    res.render('tweets/index', {tweets : tweetsData})
})

//DISPLAY A FORM TO CREATE A NEW TWEET
app.get('/tweets/new', (req, res) => {
    res.render('tweets/create');
})
//ADD A NEW TWEET TO THE SERVER
app.post('/tweets', (req, res) => {
    //destructure the payload
    const {username, tweet} = req.body;
    //push to the data with a new id
    tweetsData.push({id : uuid(), username, tweet});
    //redirect to /tweets
    res.redirect('/tweets');
})

app.get('/tweets/:id', (req, res) => {
    const {id} = req.params;
    const matchingTweet = tweetsData.find(tweet => tweet.id === id);
    res.render('tweets/show', {tweet : matchingTweet});
})




//=====
app.listen(3000, (req, res) => {
    console.log(`Listening to port ${port}`)
})
const express = require("express")
const app = express();
const path = require("path")
const { v4: uuid } = require("uuid");
const methodOverride = require("method-override");
uuid();
const port = 3000;
const Tweet = require('./models/tweet')
const mongoose = require("mongoose");
//initial connection
mongoose.connect('mongodb://localhost:27017/CrudTweet')
    .then(() => {
        console.log("Connection open!")
    })
    .catch((error) => {
        console.log("Oh no error");
        console.log(error);
    })


//after initial connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

//serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));


//method overide using query value
app.use(methodOverride('_method'));

// app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

//configure ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

//routes//
app.get('/', (req, res) => { //homepage
    res.render('tweets/home', {title: "DEFAULT"})
})

//DISPLAY ALL TWEETS
app.get('/tweets', async (req, res) => {
    //pass the array of objects
    const tweets = await Tweet.find({});
    res.render('tweets/index', {tweets, title: "All Tweets"})
})

//DISPLAY A FORM TO CREATE A NEW TWEET
app.get('/tweets/new', (req, res) => {
    res.render('tweets/create', {title: "New Tweet"});
})

//ADD A NEW TWEET TO THE SERVER
app.post('/tweets', async (req, res) => {
    //destructure the payload
    // const {username, tweetText} = req.body;
    //push to the data with a new id
    const newTweet = new Tweet(req.body);
    await newTweet.save();
    
    console.log(req.body);

    // tweetsData.push({id : uuid(), username, tweetText});
    //redirect to /tweets
    res.redirect('/tweets');
})

//VIEW A SINGLE TWEET
app.get('/tweets/:id', (req, res) => {
    //get the tweet of the matching id from the param
    const {id} = req.params;
    const matchingTweet = tweetsData.find(tweet => tweet.id === id);
    res.render('tweets/show', {tweet : matchingTweet, title: `${matchingTweet.username}'s tweet`});
})

//EDIT A TWEET
app.get('/tweets/:id/edit', (req, res) => {
    const {id} = req.params;
    const matchingTweet = tweetsData.find(tweet => tweet.id === id);
    res.render('tweets/edit', {tweet : matchingTweet,  title: `Edit ${matchingTweet.username}'s tweet`});
})

//UPDATE THE SINGLE TWEET IN SERVER
app.patch('/tweets/:id', (req, res) => {
    const {id} = req.params;
    const matchingTweet = tweetsData.find(tweet => tweet.id === id);
    //replace the tweet with the tweet payload
    matchingTweet.tweet = req.body.tweet;
    //redirect the user to all tweets
    res.redirect('/tweets')
})

//DELETE THE TWEET FROM THE SERVER
app.delete('/tweets/:id', (req, res) => {
    const {id} = req.params;
    tweetsData = tweetsData.filter(tweet => tweet.id !== id);
    res.redirect('/tweets');
})

//=====
app.listen(3000, (req, res) => {
    console.log(`Listening to port ${port}`)
})
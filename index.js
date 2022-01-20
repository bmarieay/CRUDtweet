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
app.get('/tweets/:id', async (req, res) => {
    //get the tweet of the matching id from the param
    const {id} = req.params;
    const tweet = await Tweet.findById(id);
    res.render('tweets/show', {tweet, title: `${tweet.username}'s tweet`});
})

//EDIT A TWEET
app.get('/tweets/:id/edit', async (req, res) => {
    const {id} = req.params;
    const tweet = await Tweet.findById(id);
    res.render('tweets/edit', {tweet,  title: `Edit ${tweet.username}'s tweet`});
})

//UPDATE THE SINGLE TWEET IN SERVER
app.patch('/tweets/:id', async (req, res) => {
    const {id} = req.params;
    // console.log(req.body)
    const tweet = await Tweet.findByIdAndUpdate(id, req.body, {runValidators: true});
    res.redirect('/tweets')
})

//DELETE THE TWEET FROM THE SERVER
app.delete('/tweets/:id', async (req, res) => {
    const {id} = req.params;
    const tweet = await Tweet.findByIdAndDelete(id);
    res.redirect('/tweets');
})

//=====
app.listen(3000, (req, res) => {
    console.log(`Listening to port ${port}`)
})
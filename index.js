const express = require("express")
const app = express();
const path = require("path")
// const { v4: uuid } = require("uuid");
const methodOverride = require("method-override");
// uuid();
const AppError = require("./AppError/AppError")
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
app.get('/tweets', async (req, res, next) => {
    try {
        const tweets = await Tweet.find({});
        if(!tweets){
            throw new AppError('Something went wrong displaying the tweets', 404)
        }
        res.render('tweets/index', {tweets, title: "All Tweets"})
    } catch (error) {
        next(e)
    }
})

//DISPLAY A FORM TO CREATE A NEW TWEET
app.get('/tweets/new', (req, res) => {
    res.render('tweets/create', {title: "New Tweet"});
})

//ADD A NEW TWEET TO THE SERVER
app.post('/tweets', async (req, res, next) => {
    //destructure the payload
    try{
        const newTweet = new Tweet(req.body);
        await newTweet.save();
        res.redirect('/tweets');
    } catch (error){
        next(error)
    }
})

//VIEW A SINGLE TWEET
app.get('/tweets/:id', async (req, res, next) => {
    try {
        const {id} = req.params;
        const tweet = await Tweet.findById(id);
        if(!tweet){
            throw new AppError('Tweet not found', 404)
        }
        res.render('tweets/show', {tweet, title: `${tweet.username}'s tweet`});
    } catch (error) {
        next(error)
    }
})

//EDIT A TWEET
app.get('/tweets/:id/edit', async (req, res) => {
    try {
        const {id} = req.params;
        const tweet = await Tweet.findById(id);
        if(!tweet){//ejs error
            throw new AppError('Tweet not found', 404)
        }
        res.render('tweets/edit', {tweet,  title: `Edit ${tweet.username}'s tweet`});
    } catch (error) {
        next(error)
    }
})

//UPDATE THE SINGLE TWEET IN SERVER
app.patch('/tweets/:id', async (req, res) => {
    try {
        const {id} = req.params;
        // console.log(req.body)
        const tweet = await Tweet.findByIdAndUpdate(id, req.body, {runValidators: true});
        res.redirect('/tweets')
        
    } catch (error) {
        next(error)
    }
})

//DELETE THE TWEET FROM THE SERVER
app.delete('/tweets/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const tweet = await Tweet.findByIdAndDelete(id);
        res.redirect('/tweets');
        
    } catch (error) {
        next(error)
    }
})

//tailored message for validation error from mongoose
const handleValidationError = err => {
    console.dir(err);
    return new AppError(`Validation Failed.....${err.message}', 400`)
}

app.use((err, req, res, next) => {
    console.log(err.name)
    if(err.name === 'ValidationError') {
        err = handleValidationError(err);//new error
    }
    next(err)//call the next error handler
})

//error handler middleware
app.use((err, req, res, next) => {//this will catch either custom error or not
    console.log('ERRRRORRRRR')
    //set a default status and message
    const {message = 'Something went wrong :(', status = 500} = err;
    res.status(status).send(`Sorry you got an error message: ${err.message} with a status ${status}`);
})

//=====
app.listen(3000, (req, res) => {
    console.log(`Listening to port ${port}`)
})
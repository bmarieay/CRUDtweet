const express = require("express")
const app = express();
const path = require("path")
// const { v4: uuid } = require("uuid");
const methodOverride = require("method-override");
// uuid();
const AppError = require("./utils/AppError")
const {tweetSchema, userSchema} = require("./schemas")
const wrapAsync = require("./utils/wrapAsync")
const port = 3000;
const Joi = require('joi')
const Tweet = require('./models/tweet')
const User = require('./models/user')
const mongoose = require("mongoose");
const e = require("express");
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

//server validation middleware
const validateTweet  = (req, res, next) => {
    const {error} = tweetSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next();
    }
}
const validateUser  = (req, res, next) => {
    const {error} = userSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next();
    }
}

//configure ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

//routes//
app.get('/', (req, res) => { //homepage
    res.render('tweets/home', {title: "DEFAULT"})
})

//USER ROUTES

//create a new user
app.get('/user', async (req, res) => {
    const users = await User.find({});
    res.render('users/index', {users, title: 'All Users'})
})

//form to create a user
app.get('/user/new', (req, res) => {
    res.render('users/create', {title: 'Create new User'})
})

//add user to the server
app.post('/user', validateUser, wrapAsync(async(req, res) => {
    const user = await new User(req.body.user);
    await user.save();
    res.redirect(`/user/${user._id}`)
}))

//show single user
app.get('/user/:id', wrapAsync(async(req, res) => {
    const {id} = req.params;
    //populate to show corresponding reviews of user
    const user = await User.findById(id)
    .populate('tweets')
    if(!user) throw new AppError('Cannot find profile', 404);
    res.render('users/show', {user, title: `${user.username}'s Profile` })
}))

//edit a user profile
app.get('/user/:id/edit', wrapAsync(async(req, res) => {
    const {id} = req.params;
    const user = await User.findById(id)
    if(!user) throw new AppError('Cannot find profile', 404);
    res.render('users/edit', {user, title: `Edit ${user.username}'s Profile`})
}))

//update user profile
app.patch('/user/:id', validateUser, wrapAsync(async(req, res) => {
    const {id} = req.params;
    const user = await User.findByIdAndUpdate(id, {...req.body.user})
    if(!user) throw new AppError('Cannot find profile', 404);
    res.redirect(`/user/${user._id}`)
}))

//form to create a new tweet from user profile
app.get('/user/:id/tweets/new', wrapAsync(async(req, res) => {
    const {id} = req.params;
    const user = await User.findById(id);
    if(!user){
        throw new AppError('Associated user not found', 404)
    } 
    res.render('users/newTweet', {user, title: `Create comment from ${user.username}`})
}))

//add tweet from user to the server
app.post('/user/:id/tweets', wrapAsync(async(req, res) => {
    const {id} = req.params;
    const {username} = req.body.tweet;
    const user = await User.findById(id);
    if((!user) || (username !== user.username) ){
        throw new AppError('Associated user not found', 404)
    } 
    const newTweet = new Tweet(req.body.tweet);
    user.tweets.push(newTweet)
    newTweet.user = user;
    await newTweet.save();
    await user.save();
    res.redirect(`/user/${user._id}`);
}))

//TWEET ROUTES

//DISPLAY ALL TWEETS
app.get('/tweets', wrapAsync(async (req, res, next) => {
    const tweets = await Tweet.find({})
        .populate('user')
    if(!tweets){
        throw new AppError('Something went wrong displaying the tweets', 404)
    }
    res.render('tweets/index', {tweets, title: "All Tweets"})
}))

//form to create a new tweet from tweet home
app.get('/tweets/new', async(req, res) => {
    res.render('tweets/create', {title: 'Create a New Tweet'});
})

//add a new tweet to the server
app.post('/tweets', validateTweet, wrapAsync(async (req, res, next) => {
    //check if there is a matching user in the database
    const {username} = req.body.tweet;
    const user = await User.findOne({username})
    if(!user){
        throw new AppError('No profile found, please create a user first', 401)
    } 
    // const confirmedUser = await User.findById(user._id);
    const newTweet = new Tweet(req.body.tweet);
    //bind the user and tweet together
    user.tweets.push(newTweet)
    newTweet.user = user;
    await newTweet.save();
    await user.save();
    res.redirect('/tweets');
}))

//VIEW A SINGLE TWEET
app.get('/tweets/:id', wrapAsync(async (req, res, next) => {
    const {id} = req.params;
    const tweet = await Tweet.findById(id)
        .populate('user')
    if(!tweet){
        throw new AppError('Tweet not found', 404)
    }
    res.render('tweets/show', {tweet, title: `${tweet.user.username}'s tweet`});
}))

//EDIT A TWEET
app.get('/tweets/:id/edit', wrapAsync(async (req, res) => {
    const {id} = req.params;
    const tweet = await Tweet.findById(id);
    if(!tweet){//ejs error
        throw new AppError('Tweet not found', 404)
    }
    res.render('tweets/edit',  {tweet, title: `Editing ${tweet.username}'s tweet`} )
}))

//UPDATE THE SINGLE TWEET IN SERVER
app.patch('/tweets/:id', validateTweet, wrapAsync(async (req, res) => {
    const {id} = req.params;
    const tweet = await Tweet.findByIdAndUpdate(id, req.body.tweet, {runValidators: true});
    res.redirect('/tweets')
}))

//DELETE THE TWEET FROM THE SERVER
app.delete('/tweets/:id', wrapAsync(async (req, res) => {
    const {id} = req.params;
    const tweet = await Tweet.findByIdAndDelete(id);
    const user = await User.findOneAndUpdate({id: tweet.user}, { $pull: { tweets: tweet._id } } )
    res.redirect('/tweets');
}))


//404 route
app.all('*', (req, res, next) => {
    next(new AppError('Page Not Found', 404));
})
// User.updateOne({}, {pull: {tweets: {_id: '61edcfa42afd11f874596dc8'}}}).then(m => console.log(m)) 
//tailored message for validation error from mongoose
const handleValidationError = err => {
    // console.dir(err);
    return new AppError(`Validation Failed.....${err.message}`, 400)
}

app.use((err, req, res, next) => {
    if(err.name === 'ValidationError') {
        err = handleValidationError(err);//new error
    }
    next(err)//call the next error handler
})

//error handler middleware
app.use((err, req, res, next) => {//this will catch either custom error or not
    console.log('ERRRRORRRRR')
    //set a default status and message
    const {status = 500} = err;
    if(!err.message) err.message = 'Something went wrong :('
    res.status(status).render('error', {err})
})

//=====
app.listen(3000, (req, res) => {
    console.log(`Listening to port ${port}`)
})


//post /user/:userid/tweets -add tweet to the server
//get /user/:userid/tweets/new -create new tweet dont need
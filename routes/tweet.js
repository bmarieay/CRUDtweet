const express = require("express");
const router = express.Router();
const AppError = require("../utils/AppError")
const {tweetSchema} = require("../schemas")
const wrapAsync = require("../utils/wrapAsync")
const Tweet = require('../models/tweet')
const User = require('../models/user')

const validateTweet  = (req, res, next) => {
    const {error} = tweetSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next();
    }
}

//DISPLAY ALL TWEETS
router.get('/', wrapAsync(async (req, res, next) => {
    const tweets = await Tweet.find({})
        .populate('user')
    if(!tweets){
        throw new AppError('Something went wrong displaying the tweets', 404)
    }
    res.render('tweets/index', {tweets, title: "All Tweets"})
}))

//form to create a new tweet from tweet home
router.get('/new', async(req, res) => {
    res.render('tweets/create', {title: 'Create a New Tweet'});
})

//add a new tweet to the server
router.post('/', validateTweet, wrapAsync(async (req, res, next) => {
    //check if there is a matching user in the database
    const {username} = req.body.tweet;
    const user = await User.findOne({username})
    if(!user){
        throw new AppError('No profile found, please create a user first', 401)
    } 
    const newTweet = new Tweet(req.body.tweet);
    //bind the user and tweet together
    user.tweets.push(newTweet)
    newTweet.user = user;
    await newTweet.save();
    await user.save();
    res.redirect('/tweets');
}))

//VIEW A SINGLE TWEET
router.get('/:id', wrapAsync(async (req, res, next) => {
    const {id} = req.params;
    const tweet = await Tweet.findById(id)
        .populate('user')
    if(!tweet){
        throw new AppError('Tweet not found', 404)
    }
    res.render('tweets/show', {tweet, title: `${tweet.user.username}'s tweet`});
}))

//EDIT A TWEET
router.get('/:id/edit', wrapAsync(async (req, res) => {
    const {id} = req.params;
    const tweet = await Tweet.findById(id);
    if(!tweet){//ejs error
        throw new AppError('Tweet not found', 404)
    }
    res.render('tweets/edit',  {tweet, title: `Editing ${tweet.username}'s tweet`} )
}))

//UPDATE THE SINGLE TWEET IN SERVER
router.patch('/:id', validateTweet, wrapAsync(async (req, res) => {
    const {id} = req.params;
    const tweet = await Tweet.findByIdAndUpdate(id, req.body.tweet, {runValidators: true});
    res.redirect('/tweets')
}))

//DELETE THE TWEET FROM THE SERVER
router.delete('/:id', wrapAsync(async (req, res) => {
    const {id} = req.params;
    const tweet = await Tweet.findByIdAndDelete(id);
    const user = await User.findOneAndUpdate({id: tweet.user}, { $pull: { tweets: tweet._id } } )
    res.redirect('/tweets');
}))

module.exports = router;
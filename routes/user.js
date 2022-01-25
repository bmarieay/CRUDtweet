const express = require("express");
const router = express.Router();
const {userSchema} = require("../schemas")
const wrapAsync = require("../utils/wrapAsync")
const AppError = require("../utils/AppError")
const User = require('../models/user')
const Tweet = require('../models/tweet')

const validateUser  = (req, res, next) => {
    const {error} = userSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next();
    }
}

router.get('/', async (req, res) => {
    const users = await User.find({});
    res.render('users/index', {users, title: 'All Users'})
})

//form to create a user
router.get('/new', (req, res) => {
    res.render('users/create', {title: 'Create new User'})
})

//add user to the server
router.post('/', validateUser, wrapAsync(async(req, res) => {
    console.log(req.body)
    const user = await new User(req.body.user);
    await user.save();
    res.redirect(`/user/${user._id}`)
}))

//show single user
router.get('/:id', wrapAsync(async(req, res) => {
    const {id} = req.params;
    //populate to show corresponding reviews of user
    const user = await User.findById(id)
    .populate('tweets')
    if(!user) throw new AppError('Cannot find profile', 404);
    res.render('users/show', {user, title: `${user.username}'s Profile` })
}))

//edit a user profile
router.get('/:id/edit', wrapAsync(async(req, res) => {
    const {id} = req.params;
    const user = await User.findById(id)
    if(!user) throw new AppError('Cannot find profile', 404);
    res.render('users/edit', {user, title: `Edit ${user.username}'s Profile`})
}))

//update user profile
router.patch('/:id', validateUser, wrapAsync(async(req, res) => {
    const {id} = req.params;
    const user = await User.findByIdAndUpdate(id, {...req.body.user})
    if(!user) throw new AppError('Cannot find profile', 404);
    res.redirect(`/user/${user._id}`)
}))

//form to create a new tweet from user profile
router.get('/:id/tweets/new', wrapAsync(async(req, res) => {
    const {id} = req.params;
    const user = await User.findById(id);
    if(!user){
        throw new AppError('Associated user not found', 404)
    } 
    res.render('users/newTweet', {user, title: `Create comment from ${user.username}`})
}))

//add tweet from user to the server
router.post('/:id/tweets', wrapAsync(async(req, res) => {
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

router.delete('/:id', wrapAsync(async(req, res) => {
    const {id} = req.params;
    await User.findByIdAndDelete(id);
    res.redirect('/user');
}))

module.exports = router;

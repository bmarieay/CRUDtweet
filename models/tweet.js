const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TweetSchema = new Schema({
    username: String,
    tweetText: String
})

const Tweet = mongoose.model('Tweet', TweetSchema);

module.exports = Tweet;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TweetSchema = new Schema({
    username: String,
    tweetText: String
})

module.exports = mongoose.model('Tweet', TweetSchema);
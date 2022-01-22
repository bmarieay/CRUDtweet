const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TweetSchema = new Schema({
    text: String,
    username: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

const Tweet = mongoose.model('Tweet', TweetSchema);

module.exports = Tweet;
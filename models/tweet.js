const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TweetSchema = new Schema({
    text: String,
    username: {
        type: String,
        ref: 'User'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
    //add time later (modified data)
})

const Tweet = mongoose.model('Tweet', TweetSchema);

module.exports = Tweet;
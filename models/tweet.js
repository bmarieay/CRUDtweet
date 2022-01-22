const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TweetSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Username is required' ]
    },
    text: {
        type: String,
        required: [true, 'Cannot submit a blank tweet']
    }
})

const Tweet = mongoose.model('Tweet', TweetSchema);

module.exports = Tweet;
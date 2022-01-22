const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Tweet = require('./tweet');
const UserSchema = new Schema({
    username: String,
    age: Number,
    city: String,
    tweets: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Tweet'
        }
    ]
})

module.exports = mongoose.model('User', UserSchema);
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userName: String,
    age: Number,
    city: String
})

module.exports = mongoose.model('User', UserSchema);
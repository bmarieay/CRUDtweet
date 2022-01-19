const mongoose = require("mongoose");
const Tweet = require('../models/tweet')

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

//seed data
Tweet.insertMany([
    {
        username: 'IamMarie',
        tweetText:  'just woke up!'
    },
    {
        username: 'bob',
        tweetText:  'Cant wait!'
    },
    {
        username: 'Dan123',
        tweetText:  'I passed!'
    },
    {
        username: 'mynameis',
        tweetText:  'It is so cold'
    }
])
    .then(() => {
        console.log('SEED SUCCESS');
        mongoose.connection.close();
    })


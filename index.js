const express = require("express")
const app = express();
const path = require("path")
const methodOverride = require("method-override");
const AppError = require("./utils/AppError")
const port = 3000;
const mongoose = require("mongoose");
const users = require("./routes/user")
const tweets = require("./routes/tweet")

//initial connection
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

//serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

//method overide using query value
app.use(methodOverride('_method'));

// app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

//routes
app.use('/user', users)
app.use('/tweets', tweets)

//configure ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

//routes//
app.get('/', (req, res) => { //homepage
    res.render('tweets/home', {title: "DEFAULT"})
})


app.all('*', (req, res, next) => {
    next(new AppError('Page Not Found', 404));
})
// User.updateOne({}, {pull: {tweets: {_id: '61edcfa42afd11f874596dc8'}}}).then(m => console.log(m)) 
//tailored message for validation error from mongoose
const handleValidationError = err => {
    // console.dir(err);
    return new AppError(`Validation Failed.....${err.message}`, 400)
}

app.use((err, req, res, next) => {
    if(err.name === 'ValidationError') {
        err = handleValidationError(err);//new error
    }
    next(err)//call the next error handler
})

//error handler middleware
app.use((err, req, res, next) => {//this will catch either custom error or not
    console.log('ERRRRORRRRR')
    //set a default status and message
    const {status = 500} = err;
    if(!err.message) err.message = 'Something went wrong :('
    res.status(status).render('error', {err})
})

//=====
app.listen(3000, (req, res) => {
    console.log(`Listening to port ${port}`)
})

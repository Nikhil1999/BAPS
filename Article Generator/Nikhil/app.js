//Express Server Config
var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var session = require('express-session');
var flash = require('connect-flash');
var passport = require('passport');

var app = express();

//Passport Config
require('./config/passport')(passport);

//MongoDB Config
const mongoose = require('mongoose');

//EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

//Bodyparser
app.use(express.urlencoded({extended: true}));

//Session
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
}));

//Passport
app.use(passport.initialize());
app.use(passport.session());

//Flash
app.use(flash());

//Global Variables
app.use(function(request, response, next) {
    response.locals.error_msg = request.flash('error_msg');
    response.locals.error = request.flash('error');
    next();
});

//Routes
app.use('/', require('./routes/routes'));
app.use('/login', require('./routes/routes'));
app.use('/register', require('./routes/routes'));

//Express Server Connection
app.listen(3000, function(){
    console.log("Server is now running");
    console.log("Listening to port no : 3000");

    //MongoDB Connection
    mongoose.connect('mongodb://localhost/baps', {useNewUrlParser: true});
    var mongoDB = mongoose.connection;

    mongoDB.on('error', function(){
        console.log("MongoDB connection failed");
    });

    mongoDB.once('open', function(){
        console.log("MongoDB connected successfully");
    });
});
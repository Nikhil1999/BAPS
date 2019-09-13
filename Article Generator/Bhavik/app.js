// Start of variable declaration
// express variables declaration

var express = require('express');
var app = express();
var portNumber = 4900;

// mongo variables declaration
const MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017";

const assert = require('assert');

var dbName = null;
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

// End of variable declaration
// Start of function definition

// express connection definition
const expressListner = function (port) {
    app.listen(port, function (err, start) {
        if (!err) {
            console.log("Express Server is running on port 4900");
        }
    });
}
// Mongodb connection definition
const dbConnection = function (db) {
    client.connect(function (err) {
        assert.equal(null, err);
        console.log("Mongo Connected to Server Successfully !");
        dbName = client.db(db);
        client.close();
    });
}
// Authentication page definition
const goAuthenticate = function (subFolder) {
    app.get('/', function (req, res) {
        res.redirect('/login');
    });
    app.get('/login', function (req, res) {
        res.sendFile(__dirname + '/login/index.html');
    });
    app.get('/register', function (req, res) {
        res.sendFile(__dirname + '/register/index.html');
    });
}
// create user definition
const registerUser = function (callback) {
    app.post('/register', function (req, res) {
        var user = {
            "fname": req.body.firstname,
            "lname": req.body.lastname,
            "email": req.body.email,
            "password": req.body.password
        };
        const collectionName = 'users';
        dbName.collection(collectionName).insertOne(user, function (err, result) {
            assert.equal(err, null);
            console.log("User registerd successfully !");
            callback(result);
            res.redirect('/login');
        });
    });
}
// verify user definition
const loginUser = function () {
    app.post('/login', function (req, res) {
        const user = {
            "email": req.body.email,
            "password": req.body.password
        }
        const collectionName = 'users';
        dbName.collection(collectionName).findOne({ email: user.email, password: user.password }, { email: 1, password: 1, _id: 0 }, function(err, result) {
            if (result == null) {
                res.end("Invalid Email or Password");
            } else if (result.email == user.email && result.password == user.password){
                res.end("Sucessfully Loged In !");
            } else {
                res.end("An error occured !");  
            }
        });
    });
}

// End of function definition
// Start of function calls

expressListner(portNumber);
dbConnection('baps');
app.use(express.urlencoded({ extended: true }));
goAuthenticate('login');
loginUser();
registerUser(function () { });

//End of function calls
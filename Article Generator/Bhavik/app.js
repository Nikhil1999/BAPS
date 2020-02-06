// Start of variable declaration
// express variables declaration

const express = require('express');
const app = express();
const portNumber = 4900;

// mongo variables declaration
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017";

const assert = require('assert');

var db = null;
const dbName = 'baps';
const collectionName = 'users';
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

// End of variable declaration
// Start of function definition

// express connection definition
const expressListner = function (port) {
    app.listen(port, function (err, start) {
        if (!err) {
            console.log("Express Server is running on port 4900 from " + new Date().toISOString());
        }
    });
}
// Mongodb connection definition
const dbConnection = function (dbName) {
    client.connect(function (err) {
        assert.equal(null, err);
        console.log("Mongo Connected to Server Successfully at " + new Date().toISOString());
        db = client.db(dbName);
        client.close();
    });
}
// Authentication page definition
const goAuthenticate = function () {
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
            "firstName": req.body.firstname,
            "lastName": req.body.lastname,
            "email": req.body.email,
            "password": req.body.password,
            "isVerified": 0,
            "isActive": 1
        };
        const collection = db.collection(collectionName);
        collection.findOne({ email: user.email }, function (err, result) {
            assert.equal(err, null);
            if (result == null) {
                collection.insertOne(user, function (err, result) {
                    assert.equal(err, null);
                    collection.findOne({ email: user.email }, function (err, result) {
                        assert.equal(err, null);
                        console.log(result._id + " User registerd successfully on " + new Date().toISOString());
                    });
                    res.redirect('/login');
                });
            }
            else {
                res.end("User already registered. Please forward to login page !");
                // res.redirect('/');
            }
        });
    });
}
// verify user definition
const loginUser = function (callback) {
    app.post('/login', function (req, res) {
        const user = {
            "email": req.body.email,
            "password": req.body.password
        }
        const collection = db.collection(collectionName);
        collection.findOne({ email: user.email, password: user.password }, function (err, result) {
            assert.equal(err, null);
            if (result == null) {
                console.log("invalid passowrd attempt at " + new Date().toISOString());
                res.end("Invalid Email or Password");
            } else if (!result.isActive) {
                res.end("Account Deleted !");
            } else if (!result.isVerified) {
                res.end("Please verify your account !");
            } else if (result.email == user.email && result.password == user.password) {
                console.log(result._id + " User logged in at " + new Date().toISOString());
                res.end("Sucessfully Logged In !");
            } else {
                res.end("An unknown error occured");
            }
        });
    });
}

//Exceptions
const uncaughtExc = function () {
    process.on("uncaughtException", function (err, result) {
        console.log("UncaughtException at " + new Date().toISOString());
        console.log(err.stack + "");
    });
}

// save image sent from application
const save_picture = function(callback) {
    app.post('/upload_picture', function(req, res) {
        const user = {
            "email": req.body.email,
            "picture": req.body.picture
        }
        const collection = db.collection(collectionName);
        collection.findOne({email: user.email}, function(err, result) {
            assert.equal(err, null);
            if (result == null) {
                res.send("Invalid email id");
            } else {
                console.log(user.email, " ", user.picture);
            }
        });
    });
}

// End of function definition
// Start of function calls

expressListner(portNumber);
dbConnection(dbName);
app.use(express.urlencoded({ extended: true }));
goAuthenticate();
loginUser();
registerUser();
save_picture();
uncaughtExc();

//End of function calls
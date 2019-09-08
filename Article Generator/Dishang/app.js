var express = require('express');
var mongo = require('mongodb');
var url = "mongodb://localhost:27017";
var app = express();

var dbo = null;

var mongoClient = mongo.MongoClient;

mongoClient.connect(url, (err, db) => {
    if (err) throw err;
    dbo = db.db('Registration');
});

app.use(express.urlencoded({ extended: true }));
app.get('/', function(request, response) {
    response.redirect('/login');
});
app.get('/login', function(request, response) {
    response.sendFile(__dirname + '/login/index.html');
});
app.get('/register', function(request, response) {
    response.sendFile(__dirname + '/register/index.html');
});

app.post('/login', function(request, response) {

    console.log('Email : ' + request.body.email);
    console.log('Password : ' + request.body.password);



    dbo.collection('userData').findOne({ email: request.body.email, password: request.body.password }, { email: 1, password: 1, _id: 0 }, (err, res) => {

        var uname = res.email;
        var pwd = res.password;
        if (uname == request.body.email && pwd == request.body.password) {
            response.end('Successfully logged in..!');
        } else {
            response.end('Enter valid username or password');
        }
    });
});

app.post('/register', function(request, response) {
    console.log('First Name : ' + request.body.firstname);
    console.log('Last  Name : ' + request.body.lastname);
    console.log('Email : ' + request.body.email);
    console.log('Password : ' + request.body.password);

    var user = {
        "fname": request.body.firstname,
        "lname": request.body.lastname,
        "email": request.body.email,
        "password": request.body.password
    };
    dbo.collection('userData').insertOne(user, (err, res) => {
        if (err) throw err;
        console.log("User entered");
        console.log(user);
        response.end('User Registered');
    });
});
app.listen(4900, (err, start) => { if (!err) { console.log("Serever is running on port 4900"); } });
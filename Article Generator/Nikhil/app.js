var express = require('express');

var app = express();

app.use(express.urlencoded({extended: true}));

app.get('/', function(request, response){
    response.redirect('/login');
});
app.get('/login', function(request, response){
    response.sendFile(__dirname + '/login/index.html');
});
app.get('/register', function(request, response){
    response.sendFile(__dirname + '/register/index.html');
});

app.post('/login', function(request, response){
    console.log('Email : ' + request.body.email);
    console.log('Password : ' + request.body.password);
    response.end("OK");  
});

app.post('/register', function(request, response){
    console.log('First Name : ' + request.body.firstname);
    console.log('Last  Name : ' + request.body.lastname);
    console.log('Email : ' + request.body.email);
    console.log('Password : ' + request.body.password);
    response.end("OK");  
});

app.listen(3000);
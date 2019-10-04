const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

//Models
const User = require('../models/User');

//Home
router.get('/', function(request, response) {
    if(request.isAuthenticated()) {
        console.log(request.user);
        response.redirect('/dashboard');
    } else {
        response.redirect('/login');
    }
});

//Login
router.get('/login', function(request, response) {
    if(request.isAuthenticated()) {
        response.redirect('/dashboard');
    } else {
        response.render('login');
    }
});

//Login Handler
router.post('/login', function(request, response, next) {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
    })(request, response, next);
});

//Registeration
router.get('/register', function(request, response) {
    if(request.isAuthenticated()) {
        response.redirect('/dashboard');
    } else {
        response.render('register');
    }
});

//Registeration Handler
router.post('/register', function(request, response) {
    const {firstname, lastname, email, password} = request.body;    
    let errors = [];

    //Check Required Fields
    if(!firstname || !email || !password) {
        errors.push({ msg: 'Please fill all the fields'});
    }

    //Check Password Length
    if(password.length < 8) {
        errors.push({ msg: 'Password must be at least 8 characters'});
    }

    if(errors.length > 0) {
        //Send Error
        response.render('register', {
            errors,
            firstname,
            lastname,
            email,
            password
        });
    } else {
        //Check User Exists
        User.findOne({email : email}).then(function(user){
            if(user) {
                //User Exists
                errors.push({ msg: 'Email is already registered'});
                response.render('register', {
                errors,
                firstname,
                lastname,
                email,
                password
            });
            } else {
                //Register User
                const newUser = new User({
                    email,
                    password,
                    firstname,
                    lastname
                })

                //Hash Password
                bcrypt.genSalt(10, function(error, salt){
                    bcrypt.hash(newUser.password, salt, function(error, hash){
                        if(error) return console.log(error); // we should return from here rather than going ahead if error is there (Dishang updated this)
                        newUser.password = hash;
                        newUser.save().then(function(user){
                            response.redirect('/login');
                        });
                    });
                });
            }
        });
    }
});

//Logout
router.get('/logout', function(request, response) {
    request.logout();
    response.redirect('/login');
});

//DashBoard
router.get('/dashboard', function(request, response) {
    if(request.isAuthenticated()) {
        response.render('dashboard', {
            name: request.user.firstname + ' ' + request.user.lastname
        });
    } else {
        response.redirect('/login');
    }
});

module.exports = router;
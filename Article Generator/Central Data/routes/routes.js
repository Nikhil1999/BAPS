//Global Variables
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const validator = require('validator');

//User Model (MongoDB)
const User = require('../models/User');

//Root Page
router.get('/', function(request, response) {
    //Check User Is Logged-In Or Not
    if(request.isAuthenticated()) {
        //Logged-In

        //User Is Logged-In So Redirect To Dashboard
        response.redirect('/dashboard');
    } else {
        //Logged-Out
    
        //User Is Logged-Out So Redirect To Login Page
        response.redirect('/login');
    }
});

//Login Page
router.get('/login', function(request, response) {
    //Check User Is Logged-In Or Not
    if(request.isAuthenticated()) {
        //Logged-In

        //User Is Logged-In So Redirect To Dashboard Page
        response.redirect('/dashboard');
    } else {
        //Logged-Out

        //User Is Logged-Out So Render Login Page
        response.render('login');
    }
});

//Login Page Handler (For Handling Form Data)
router.post('/login', function(request, response, next) {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
    })(request, response, next);
});

//Registeration Page
router.get('/register', function(request, response) {
    //Check User Is Logged-In Or Not
    if(request.isAuthenticated()) {
        //Logged-In

        //User Is Logged-In So Redirect To Dashboard Page
        response.redirect('/dashboard');
    } else {
        //Logged-Out

        //User Is Logged-Out So Render Register Page
        response.render('register');
    }
});

//Registeration Page Handler (For Handling Form Data)
router.post('/register', function(request, response) {
    //Map All The Form Data To Variables
    var firstname = request.body.firstname.toString();
    var lastname = request.body.lastname.toString();
    var email = request.body.email.toString();
    var password = request.body.password.toString();
    var confirmpassword = request.body.confirmpassword.toString();
    // const {firstname, lastname, email, password, confirmpassword} = request.body;    

    //Creating Array For All The Errors
    let errors = [];

    if(!firstname) {
        errors.push({ message: 'Please enter your firstname'});
    } else {
        firstname = firstname.trim();
        if(firstname.length > 30) {
            errors.push({ message: 'Maximum length of firstname can be 30'});
        }
    }

    if(lastname) {
        lastname = lastname.trim();
    }

    if(!email) {
        errors.push({ message: 'Please enter your email'});
    } else {
        email = email.trim();
        if(!validator.isEmail(email)) {
            errors.push({ message: 'Please enter valid email address'});
        }
    }

    if(!password) {
        errors.push({ message: 'Please enter your password'});
    } else {
        if(password.length < 8) {
            errors.push({ message: 'Minimum length of password must be 8'});
        } else {
            if(!confirmpassword) {
                errors.push({ message: 'Password not matching'});
            } else {
                if(!(password === confirmpassword)) {
                    errors.push({ message: 'Password not matching'});
                }
            }
        }
    }

    //Check Errors Are Present Or Not
    if(errors.length > 0) {
        //Errors Are Present

        //Send All The Data Back Along With The Errors
        response.render('register', {
            errors,
            firstname,
            lastname,
            email,
            password,
            confirmpassword
        });
    } else {
        //Errors Are Not Present

        //Check User Is Already Registered Or Not
        User.findOne({email : email}).then(function(user){
            if(user) {
                //User Is Already Registered

                //Push Error Into The Array
                errors.push({ msg: 'This email is already registered'});

                //Send All The Data Back Along With The Error
                response.render('register', {
                    errors,
                    firstname,
                    lastname,
                    email,
                    password
                });
            } else {
                //User Is Not Registered

                //Create A New User
                const newUser = new User({
                    email,
                    password,
                    firstname,
                    lastname
                });

                //Create A Hashed Password
                bcrypt.genSalt(10, function(error, salt){
                    bcrypt.hash(newUser.password, salt, function(error, hash){
                        if(error) {
                            //Push Error Into The Array
                            errors.push({ msg: 'Unable to register your account. Please try again later'});

                            //Send All The Data Back Along With The Error
                            response.render('register', {
                                errors,
                                firstname,
                                lastname,
                                email,
                                password
                            });
                        } else {
                            //Assign This Hashed Password As A Password For This User
                            newUser.password = hash;

                            //Save This User Into The Database
                            newUser.save().then(function(user){
                                if(user) {
                                    //User Is Registered Successfully So Redirect To Login Page
                                    request.flash('success_message', 'You are regisetered successfully');
                                    response.redirect('/login');
                                } else {
                                    //Push Error Into The Array
                                    errors.push({ msg: 'Unable to register your account. Please try again later'});

                                    //Send All The Data Back Along With The Error
                                    response.render('register', {
                                        errors,
                                        firstname,
                                        lastname,
                                        email,
                                        password
                                    });
                                }
                            });
                        }
                    });
                });
            }
        });
    }
});

//Logout Page
router.get('/logout', function(request, response) {
    //Check User Is Logged-In Or Not    
    if(request.isAuthenticated()) {
        //Logged-In
        
        //User Is Logged-In So Perform Logout
        request.logout();
    }

    //Finally Redirect To Login Page
    response.redirect('/login');
});

//DashBoard Page
router.get('/dashboard', function(request, response) {
    //Check User Is Logged-In Or Not
    if(request.isAuthenticated()) {
        //Logged-In

        //User Is Logged-In So Render Dashboard Page
        response.render('dashboard', {
            name: request.user.firstname + ' ' + request.user.lastname
        });
    } else {
        //Logged-Out
    
        //User Is Logged-Out So Redirect To Login Page
        response.redirect('/login');
    }
});

//Forgot Password Page
router.get('/forgot', function(request, response) {
    //Check User Is Logged-In Or Not
    if(request.isAuthenticated()) {
        //Logged-In

        //User Is Logged-In So Redirect To Dashboard Page
        response.redirect('/dashboard');
    } else {
        //Logged-Out
    
        //User Is Logged-Out So Render Forgot Password Page
        response.render('forgot');
    }
});

//Forgot Password Page Handler (For Handling Form Data)
router.post('/forgot', function(request, response) {
    if(request.isAuthenticated()) {
        //User is Authenticated
        response.redirect('/dashboard');
    } else {
        //User Not Authenticated

        var email = request.body.email.toString();

        if(!email) {
            request.flash('error_message', 'Please enter your email');
            response.redirect('/forgot');
        } else {
            email = email.trim();
            if(!validator.isEmail(email)) {
                request.flash('error_message', 'Please enter valid email address');
                response.redirect('/forgot');
            } else {
                //Check User Exists
                User.findOne({email : email}).then(function(user){
                    if(user) {
                        //User Exists
                        crypto.randomBytes(48, function(error, buffer) {
                            if(buffer) {
                                //Buffer For Token Created
                                var token = buffer.toString('hex');
                                user.reset_password_token = token;
                                user.reset_password_expires = Date.now() + 120000; // + 2 minutes

                                //Inserting Token Into The Database
                                user.save().then(function(user){
                                    //First Allow Less Secure App Access In Your Email Account
                                    //For Gmail Visit : https://myaccount.google.com/lesssecureapps

                                    //Mail Setup
                                    var smtp = nodemailer.createTransport({
                                        service: 'Gmail',
                                        auth: {
                                            user: 'bapsvgec@gmail.com',
                                            pass: 'baps@9898'
                                        }
                                    });

                                    var mail = {
                                        to: user.email,
                                        from: 'bapsvgec@gmail.com',
                                        subject: 'BAPS Password Reset',
                                        // text: 'Reset Password Link : ' + request.headers.host + '/reset/' + token,
                                        html: '<p>Reset Password Link : <a href="http://' + request.headers.host + '/reset/' + token + '">Click Here</a></p>'
                                    };

                                    //Sending Mail
                                    smtp.sendMail(mail, function(error){
                                        if(error) {
                                            //Error Sending Mail
                                            request.flash('error_message', 'Unable to send email. Please try again later');
                                            console.log(error);
                                        } else {
                                            //Mail Send Successfully
                                            request.flash('success_message', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                                        }
                                        response.redirect('/forgot');
                                    });
                                });
                            } else {
                                //Unable To Create Buffer For Token
                                request.flash('error_message', 'Unable to reset your password. Please try again later');
                                response.redirect('/forgot');
                            }
                        });
                    } else {
                        //User Not Exists
                        request.flash('error_message', 'Email is not registered');
                        response.redirect('/forgot');
                    }
                });
            }
        }
    }
});

//Reset
router.get('/reset/:token', function(request, response) {
    if(!request.isAuthenticated()) {
        //User Not Authenticated
        User.findOne({ reset_password_token: request.params.token, reset_password_expires: { $gt: Date.now()}}, function(error, user){
            if(user) {
                response.render('reset');
            } else {
                request.flash('error_message', 'Invalid Token');
                response.redirect('/login');
            }
        });
    } else {
        //User Is Authenticated
        response.redirect('/dashboard');
    }
});

//Reset
router.post('/reset/:token', function(request, response) {
    if(!request.isAuthenticated()) {
        var password = request.body.password.toString();
        var confirmpassword = request.body.confirmpassword.toString();

        //User Not Authenticated
        User.findOne({ reset_password_token: request.params.token.toString() }, function(error, user){
            if(user) {
                if(user.reset_password_expires) {
                    if(user.reset_password_expires > Date.now()) {
                        if(!password) {
                            request.flash('error_message', 'Please enter your password');
                            response.redirect(request.originalUrl);
                        } else {
                            if(password.length < 8) {
                                request.flash('error_message', 'Minimum length of password must be 8');
                                response.redirect(request.originalUrl);
                            } else {
                                if(!confirmpassword) {
                                    request.flash('error_message', 'Password not matching');
                                    response.redirect(request.originalUrl);
                                } else {
                                    if(!(password === confirmpassword)) {
                                        request.flash('error_message', 'Password not matching');
                                        response.redirect(request.originalUrl);
                                    } else {
                                        //Create A Hashed Password
                                        bcrypt.genSalt(10, function(error, salt){
                                            bcrypt.hash(password, salt, function(error, hash){
                                                if(error) {
                                                    request.flash('error_message', 'Unable to change password. Please try again later');
                                                } else {
                                                    //Assign This Hashed Password As A Password For This User
                                                    user.password = hash;
                                                    user.reset_password_token = null;
                                                    user.reset_password_expires = null;

                                                    //Save This User Into The Database
                                                    user.save().then(function(user){
                                                        if(user) {
                                                            request.flash('success_message', 'Password changed successfully');
                                                        } else {
                                                            request.flash('error_message', 'Unable to change password. Please try again later');
                                                        }
                                                        response.redirect('/login')
                                                    });
                                                }
                                            });
                                        });
                                    }
                                }
                            }
                        }
                    } else {
                        request.flash('error_message', 'Time limit exceeded for changing password. Please try again');    
                    }
                } else {
                    request.flash('error_message', 'Time limit exceeded for changing password. Please try again');
                }
            } else {
                request.flash('error_message', 'Invalid Password Change Token');
            }
        });
    } else {
        //User Is Authenticated
        response.redirect('/dashboard');
    }
});

module.exports = router;
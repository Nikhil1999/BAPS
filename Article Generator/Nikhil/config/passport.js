const localstrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//User Model
const User = require('../models/User');

module.exports = function(passport) {
    passport.use(
        new localstrategy({ usernameField: 'email' }, function(email, password, done) {
            //Match Email
            User.findOne({ email: email })
                .then(function(user) {
                    if(!user) {
                        return done(null, false, { message: 'Email is not registered'});
                    }

                    //Match Password
                    bcrypt.compare(password, user.password, function(error, isMatch) {
                        if(error) {
                            console.log(error);
                        }
                        
                        if(isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, { message: 'Combination of email and password is incorrect'});
                        }                       
                    });
                })
                .catch(function(error) {
                    console.log(error);
                });
        })
    );

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(error, user) {
            done(error, user);
        })
    });
}
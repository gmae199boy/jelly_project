var express = require('express');
var router = express.Router();

// var passport = require('passport');

// session for mongoose passport
var Donor = require('../model/donor');
var Recipient = require('../model/recipient');

// passport.use(Donor.createStrategy());
// passport.serializeUser(Donor.serializeUser());
// passport.deserializeUser(Donor.deserializeUser());
// passport.use(Recipient.createStrategy());
// passport.serializeUser(Recipient.serializeUser());
// passport.deserializeUser(Recipient.deserializeUser());

module.exports = function(contract, account){
    router.get('/', function(req, res) {
        res.render('login', {title: "login", user: req.session.user, message: req.flash('error')});
    });

    router.post('/', function(req, res){//passport.authenticate('local', { failureRedirect: '/login', failureFlash: true}), function(req, res) {
        var email = req.body.email;
        var password = req.body.password
        switch(req.body.userType){
            case "donor": {
                Donor.find({email: email}, (err, result) => {
                    if(err) {
                        console.log(err);
                        
                        res.render("login", {
                        error: true,
                        errorMessage: "이메일이 없거나 오류가 생겼습니다."
                      });
                    }
                    if(result != undefined){
                        req.session.user = result;
                        res.redirect('/');
                    }
                });
            }
            break;
            case "recipient": {
                Recipient.find({email: email}, (err, result) => {
                    if(err) {
                        console.log(err);
                        
                        res.render("login", {
                        error: true,
                        errorMessage: "이메일이 없거나 오류가 생겼습니다."
                      });
                    }
                    if(result != undefined){
                        req.session.user = result;
                        res.redirect('/');
                    }
                    
                });
            }
            break;
            default: {
              console.log("signup user type name error");
              res.render("signup", {
                error: true,
                errorMessage: "userType이 올바르지 않습니다."
              });
            }
          }
    });
    return router;
}
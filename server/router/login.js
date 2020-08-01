var express = require('express');
var router = express.Router();

var passport = require('passport');

// session for mongoose passport
var User = require('../model/user');

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


module.exports = function(contract, account){
    router.get('/', function(req, res) {
        res.render('login', {title: "login", user: req.user, message: req.flash('error')});
    });

    router.post('/', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true}), function(req, res) {
        console.log('로그인 성공');
        res.redirect('/');

        //express-session login
        // var email = req.body.email;
        // var password = req.body.password
        // Donor.find({email: email, password: password}, (err, result) => {
        //     if(err) {
        //         console.log(err);
                
        //         res.render("login", {
        //         error: true,
        //         errorMessage: "이메일이 없거나 오류가 생겼습니다."
        //         });
        //     }
        //     if(result != undefined){
        //         res.redirect('/');
        //     }
        // });
    });
    return router;
}
var express = require('express');
var router = express.Router();

var passport = require('passport');


// session for mongoose passport
var User = require('../model/user');

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


module.exports = function(contract, account){
  /* GET home page. */
  router.get('/', function(req, res, next) {
    console.log(req.user);
    res.render('index', { title: 'hello', user: req.user });
    // console.log(req.user.userId);
  });

  // router.post('/', function(req, res){
  //   var test = req.body.test;
  //   console.log(test);
  //   res.render('index', {title: test, user: req.user});
  // });
  return router;

}
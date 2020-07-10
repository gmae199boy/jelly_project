var express = require('express');
var router = express.Router();

var passport = require('passport');
var Donor = require('../model/donor');
var Recipient = require('../model/recipient');

passport.use(Donor.createStrategy());
passport.serializeUser(Donor.serializeUser());
passport.deserializeUser(Donor.deserializeUser());
passport.use(Recipient.createStrategy());
passport.serializeUser(Recipient.serializeUser());
passport.deserializeUser(Recipient.deserializeUser());


module.exports = function(contract, account){
  /* GET home page. */
  router.get('/', function(req, res, next) {
    res.render('index', { title: 'hello', donor: req.donor });
    // console.log(req.user.userId);
  });

  // router.post('/', function(req, res){
  //   var test = req.body.test;
  //   console.log(test);
  //   res.render('index', {title: test, user: req.user});
  // });
  return router;

}
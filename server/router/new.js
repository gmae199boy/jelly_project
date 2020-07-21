var express = require('express');
var router = express.Router();
// var passport = require('passport');

// passport.use(User.createStrategy());
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('new', {user: req.user, title: "new"});
});

module.exports = router;
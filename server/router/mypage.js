var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../model/user');
const queryPromise = require('../query/query_promise');
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


module.exports = function(contract, account){
    /* GET home page. */
    router.get('/', function(req, res, next) {
        queryPromise.getPopulatedProductList(req.user.userId).then((result) => {
            console.log(result);
            console.log(result.myProducts[0].id);
            req.user = result;
            res.render('mypage', {
                user: req.user,
            })
        });
    });
    return router;
}

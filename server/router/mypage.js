var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../model/user');
const queryPromise = require('../query/query_promise');
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const DONOR = 0;
const RECIPIENT = 1;


module.exports = function(contract, account){
    /* GET home page. */
    router.get('/', function(req, res) {
        switch(req.user.userType) {
            case DONOR: {
                queryPromise.getPopulatedUserForMyFundingList(req.user.userId).then((result) => {
                    console.log(result);
                    req.user = result;
                    res.render('mypage', {
                        user: req.user,
                    })
                });
            }
            break;
            case RECIPIENT: {
                queryPromise.getPopulatedUserForMyFundingList(req.user.userId).then((result) => {
                    return queryPromise.getPopulatedUserForPurchaseList(req.user.userId);
                }).then((result) => {
                    console.log(result);
                    req.user = result;
                    res.render('mypage', {
                        user: req.user,
                    })
                })
            }
            break;
            default: {
                console.log("유저 타입이 적절하지 않다");
                res.send("유저 타입이 적절하지 않다.");
            }
        }
    });
    return router;
}

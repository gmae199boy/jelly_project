var express = require('express');
var router = express.Router();

// var passport = require('passport');
// var User = require('../model/user');

module.exports = function(contract, account){
    router.get('/', function(req, res) {
        req.session.user = undefined;
        console.log("로그아웃 성공");
        res.redirect('/');
    });
    return router;
}

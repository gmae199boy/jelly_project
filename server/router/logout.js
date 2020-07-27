var express = require('express');
var router = express.Router();

module.exports = function(contract, account){
    router.get('/', function(req, res) {
        req.logout();
        console.log("로그아웃 성공");
        res.redirect('/');

        // express-session logout
        // req.session.user = undefined;
        // console.log("로그아웃 성공");
        // res.redirect('/');
    });
    return router;
}

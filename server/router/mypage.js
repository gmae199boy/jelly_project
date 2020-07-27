var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../model/user');

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


module.exports = function(contract, account){
    /* GET home page. */
    router.get('/', function(req, res, next) {
        res.render('mypage', {
            user: req.user,
        })


        //유저 이메일로 등록된 유저를 찾아서 가져온다//
        //그런데 session 쓰고있으니 그냥 req.user로 불러오자..
        //var email = req.body.email;
        // User.find({email: email}, function(err, items){
        //     if(err) return res.status(500).send({error: 'db find failure'})

        //     // var applies = items.applies;
        //     // applies.forEach((apply)=>{
        //     //     console.log(apply.body);
        //     // })

        //     res.render('mypage', { title: 'hello', user: req.user, items: items });
        // })
    });
    return router;
}

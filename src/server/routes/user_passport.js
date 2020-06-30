var set_nickname = require('../config/set_nickname');
var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

module.exports = function (router, passport) {
    //홈디렉터리
    router.route('/').get(function (req, res) {
        var db = req.app.get('db');
        db.DrawingBoardModel.estimatedDocumentCount({}, function(err, number){
            if(err) throw err;
            db.DrawingBoardModel.find({}, function(err, result){
                if(err) throw err;
                var title = [];
                var image_path = [];
                var content = [];
                var i = 0;
                result.forEach(function(element){
                    title[i] = element.title;
                    image_path[i] = "/images/" + element.image_name;
                    content[i] = element.content;
                    ++i;
                });
                res.render('index', { 
                    user: req.user, 
                    drawing_number_max: number, 
                    title: title, 
                    path: image_path,
                    content: content
                 });
            });
        });
    });

    router.route('/user/login').get(function (req, res) {
        res.render('login');
    });
    router.route('/user/login').post(passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true
    }));
    router.route('/user/signup').get(function (req, res) {
        res.render('signup', { message: req.flash('signupMessage') });
    });
    router.route('/user/signup').post(passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true
    }));

    router.route('/user/logout').get(function (req, res) {
        req.logout();
        res.redirect('/');
    });

    router.route('/user/setnickname').post(function(req, res){
        set_nickname(req, res);
    });

    //패스포트 - 페이스북 인증 라우팅
    router.route('/auth/facebook').get(passport.authenticate('facebook', {
        scope: 'email'
    }));
    //패스포트 - 페이스북 인증 콜백 라우팅
    router.route('/auth/facebook/callback').get(passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/'
    }));

    //패스포트 - 구글 인증 라우팅
    router.route('/auth/google').get(passport.authenticate('google', {
        scope: ['email']
    }));
    //패스포트 - 구글 인증 콜백 라우팅
    router.route('/auth/google/callback').get(passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/'
    }));
}
var express = require('express');
var router = express.Router();

var passport = require('passport');

// 테스트용 save쿼리
const queryPromise = require('../query/query_promise');

// session for mongoose passport
var User = require('../model/user');
var Mall = require('../model//mall');

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


module.exports = function(contract, account){
  /* GET home page. */
  router.get('/', function(req, res, next) {
    queryPromise.getMallList().then((result) => {
      if(result == undefined){
        var mallList = [{
          name: "사과",
          amount: 100,
          desc: "사과다",
        }, {
          name: "딸기",
          amount: 300,
          desc: "맛없다",
        }, {
          name: "초칼렛",
          amount: 1000000,
          desc: "맛있다",
        }];
        queryPromise.setMallList(mallList[0])
        .then((result) =>{
          return queryPromise.setMallList(mallList[1]);
        }).then((result) => {
          return queryPromise.setMallList(mallList[2]);
        }).then((result) => {
          queryPromise.getMallList().then((result) => {
            console.log(result);
            res.render('index', { 
              title: 'hello', 
              user: req.user,
              mallList: result,
            });
          });
        })
      }
    })
    // console.log(req.user.userId);
  });

  // router.post('/', function(req, res){
  //   var test = req.body.test;
  //   console.log(test);
  //   res.render('index', {title: test, user: req.user});
  // });
  return router;

}
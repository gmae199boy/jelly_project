var express = require("express");
var router = express.Router();

//무언가 인자를 받고 싶을때 함수로 선언하고 인자로 받아서 쓴다 ->db
module.exports = function (db) {
  var db = require("../db")(db);

  router.get("/", function (req, res, next) {
    res.render("home", { user: req.session.loggedIn });
  });

  router
    .route("/login")
    .get(function (req, res, next) {
      res.render("login", { error: false, user: req.session.loggedIn });
    })
    .post(function (req, res, next) {
      const email = req.body.email;
      const password = req.body.password;

      db.getLoginUser([email, password], function (err, result) {
        if (err) {
          console.log(err); // 오류
          res.render("error");
        } else if (result.length > 0) {
          // users 값이 있음
          req.session.loggedIn = result[0];
          res.redirect("/");
        } else {
          // users 값이 없음 (빈 list)
          res.render("login", { error: true, user: req.session.loggedIn });
        }
      });
    });

  router
    .route("/signup")
    .all(function (req, res, next) {
      next();
    })
    .get(function (req, res, next) {
      res.render("signup", { errorMessage: null, user: req.session.loggedIn });
    })
    .post(function (req, res, next) {
      const email = req.body.email;
      const password = req.body.password;
      var age = null;
      if (req.body.age) {
        age = req.body.age;
      }

      db.getUserId([email], function (err, users) {
        if (err) {
          // 오류 발생
          res.render("signup", {
            errorMessage: "오류 발생",
            user: req.session.loggedIn,
          });
        } else if (users.length > 0) {
          // 이미 존재하는 이메일
          res.render("signup", {
            errorMessage: "이미 존재하는 이메일",
            user: req.session.loggedIn,
          });
        } else {
          // email이 `users` table에 없을 경우
          db.insertUser([email, password, age], function (err2, result) {
            if (err2) {
              // 오류 발생
              res.render("signup", {
                errorMessage: "생성 오류",
                user: req.session.loggedIn,
              });
            } else {
              // INSERT 성공
              res.render("login", {
                error: false,
                user: req.session.loggedIn,
              });
            }
          });
        }
      });
    });

  router.get("/logout", function (req, res, next) {
    if (req.session.loggedIn) {
      // 로그인 정보가 있으면
      req.session.destroy(function (err) {
        if (err) {
          console.log(err);
          res.render("error");
        } else {
          res.redirect("/");
        }
      });
    } else {
      res.redirect("/");
    }
  });
  router.get("/list", function (req, res, next) {
    db.getUserList(function (err, rows) {
      if (err) {
        console.log(err);
        res.render("error");
      } else {
        res.render("list", { users: rows, user: req.session.loggedIn });
      }
    });
  });

  return router;
};

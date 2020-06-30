var express = require("express");
var router = express.Router();

module.exports = function (connection) {
  router
    .route("/")
    .all(function (req, res, next) {
      // .all -> get, post등 으로 가기 전에 얘를 먼저 실행한다.
      if (!req.session.loggedIn) {
        res.redirect("/logout");
      } else {
        next();
      }
    })
    .get(function (req, res, next) {
      connection.query(
        `
                SELECT p.post_id, p.title, u.email, p.user_id, p.view_count, p.likes, count(c.post_id) AS comment_count
                FROM posts AS p
                LEFT JOIN users AS u
                    ON p.user_id = u.id
                LEFT JOIN comments AS c
                    ON c.post_id = p.post_id
                GROUP BY c.post_id, p.post_id
                ORDER BY p.post_id ASC;
            `,
        function (err, posts) {
          if (err) {
            console.log(err);
            res.render("error");
          } else {
            res.render("posts", {
              user: req.session.loggedIn,
              posts: posts,
            });
          }
        }
      );
    });

  router
    .route("/create")
    .all(function (req, res, next) {
      // .all -> get, post등 으로 가기 전에 얘를 먼저 실행한다.
      if (!req.session.loggedIn) {
        res.redirect("/logout");
      } else {
        next();
      }
    })
    .get(function (req, res, next) {
      res.render("editPost", {
        user: req.session.loggedIn,
        action: "/posts/create",
        post: { title: "", contents: "" },
      });
    })
    .post(function (req, res, next) {
      const title = req.body.title;
      const contents = req.body.contents;
      connection.query(
        `insert into posts (title, contents, user_id)
                    values (?, ?, ?)`,
        [title, contents, req.session.loggedIn.id],
        function (err, result) {
          if (err) {
            console.log(err);
            res.render("error");
          } else {
            res.redirect("/posts");
          }
        }
      );
    });

  return router;
};

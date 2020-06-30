var express = require("express");
var router = express.Router();
var moment = require("moment");

module.exports = function (db) {
  router.get("/like/:postId/:likes", function (req, res, next) {
    // 나중에 쿼리 수정!
    if (!req.session.loggedIn) {
      res.redirect("/logout");
    } else {
      const postId = req.params.postId;
      const likes = req.params.likes;
      db.query(
        `SELECT post_id, user_id from likes_list
                    where post_id=? and user_id=?`,
        [postId, req.session.loggedIn.id],
        function (err, result) {
          if (err) {
            console.log(err);
            res.render("error");
          } else if (result.length > 0) {
            res.redirect("/post/" + postId);
          } else {
            db.query(
              `
              update posts set
                  likes=?
                      where post_id=?
                        `,
              [Number(likes) + 1, postId],
              function (err, result) {
                if (err) {
                  console.log(err);
                  res.render("error");
                } else {
                  db.query(
                    `INSERT INTO likes_list(post_id, user_id)
                                        VALUES(?, ?) `,
                    [postId, req.session.loggedIn.id],
                    function (err, result) {
                      if (err) {
                        console.log(err);
                        res.render("error");
                      } else {
                        res.redirect("/post/" + postId);
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    }
  });

  router.get("/delete/:postId", function (req, res, next) {
    if (!req.session.loggedIn) {
      res.redirect("/logout");
    } else {
      const postId = Number(req.params.postId);
      db.query(`delete from comments where post_id = ?`, [postId], function (
        err,
        result
      ) {
        if (err) {
          console.log(err);
          res.render("error");
        } else {
          db.query(`DELETE FROM posts WHERE post_id=?`, [postId], function (
            err,
            re
          ) {
            if (err) {
              console.log(err);
              res.render("error");
            } else {
              res.redirect("/posts");
            }
          });
        }
      });
    }
  });

  router.get("/comment/delete/:postId/:comment", function (req, res, next) {
    if (!req.session.loggedIn) {
      res.redirect("/logout");
    } else {
      const postId = req.params.postId;
      const comment = String(req.params.comment);
      db.query(
        `DELETE from comments
                    where post_id=? and comments=?`,
        [postId, comment],
        function (err, result) {
          if (err) {
            console.log(err);
            res.render("error");
          } else {
            res.redirect("/post/" + postId);
          }
        }
      );
    }
  });

  router
    .route("/edit/:postId")
    .all(function (req, res, next) {
      if (!req.session.loggedIn) {
        res.redirect("/logout");
      } else {
        next();
      }
    })
    .get(function (req, res, next) {
      const postId = req.params.postId;
      db.query(
        `select * from posts
                    where user_id = ? and post_id = ?`,
        [req.session.loggedIn.id, postId],
        function (err, rows) {
          // console.log(rows);
          // console.log(postId);
          // console.log(req.session.loggedIn.id);
          if (err) {
            console.log(err);
            res.render("error");
          } else if (rows.length < 1) {
            res.render("error");
          } else {
            res.render("editPost", {
              user: req.session.loggedIn,
              post: rows[0],
              action: "/post/edit/" + postId,
            });
          }
        }
      );
    })
    .post(function (req, res, next) {
      const title = req.body.title;
      const contents = req.body.contents;
      const postId = req.params.postId;
      db.query(
        `update posts set 
                    title=?, contents=?
                        where post_id=?
                `,
        [title, contents, postId],
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

  router
    .route("/:postId")
    .all(function (req, res, next) {
      // .all -> get, post등 으로 가기 전에 얘를 먼저 실행한다.
      if (!req.session.loggedIn) {
        res.redirect("/logout");
      } else {
        next();
      }
    })
    .get(function (req, res, next) {
      //쿼리 나중에 수정
      const postId = req.params.postId;
      db.getPost([postId], function (err, posts) {
        if (err) {
          console.log(err);
          res.render("error");
        } else if (posts.length < 1) {
          console.log("post가 없음");
          res.render("error");
        } else {
          db.getComments([postId], function (err, comments) {
            if (err) {
              console.log(err);
              res.render("error");
            } else {
              db.query([postId, req.session.loggedIn.id], function (
                err,
                result
              ) {
                if (err) {
                  console.log(err);
                  res.render("error");
                } else {
                  const target = posts[0];
                  if (target.user_id != req.session.loggedIn.id) {
                    db.updateViewCount(
                      [Number(target.view_count) + 1, postId],
                      function (err, result_2) {
                        console.log("3");
                        if (err) {
                          console.log(err);
                          res.render("error");
                        } else {
                          res.render("post", {
                            user: req.session.loggedIn,
                            post: posts[0],
                            like: result,
                            comments: comments,
                            action: "/post/" + postId,
                          });
                        }
                      }
                    );
                  } else {
                    res.render("post", {
                      user: req.session.loggedIn,
                      post: posts[0],
                      like: result,
                      comments: comments,
                      action: "/post/" + postId,
                    });
                  }
                }
              });
            }
          });
        }
      });
    })
    .post(function (req, res, next) {
      const comment = req.body.comment;
      const postId = req.params.postId;
      const time = moment().format("YYYY-MM-DD HH:mm");
      db.query(
        `INSERT INTO comments 
            (post_id, user_id, comments, time)
            VALUES (?, ?, ?, ?)`,
        [postId, req.session.loggedIn.id, comment, time],
        function (err, result) {
          if (err) {
            console.log(err);
            res.render("error");
          } else {
            res.redirect("/post/" + postId);
          }
        }
      );
    });

  return router;
};

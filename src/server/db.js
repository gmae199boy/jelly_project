var mysql = require("mysql2");
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

module.exports = function () {
  var sendQuery = function (query, params = null, callback) {
    connection.query(query, params, function (err, result) {
      if (err) return callback(err);
      callback(null, result);
    });
  };
  return {
    getUserList: function (callback) {
      sendQuery("SELECT * FROM users", callback);
    },

    getLoginUser: function (params, callback) {
      sendQuery(
        "SELECT * FROM users WHERE email=? and password=?",
        params,
        callback
      );
    },

    getUserId: function (params, callback) {
      sendQuery("SELECT id FROM users WHERE email=?", params, callback);
    },

    insertUser: function (params, callback) {
      sendQuery(
        "INSERT INTO users(email, password, age) VALUES(?,?,?)",
        params,
        callback
      );
    },

    getPost: function (params, callback) {
      sendQuery(
        `SELECT post_id, title, contents, email, user_id, view_count, likes
            FROM posts
                left join users
                on user_id = users.id
                    where post_id = ?`,
        params,
        callback
      );
    },

    getComments: function (params, callback) {
      sendQuery(
        `SELECT user_id, comments, email, time
                FROM comments as c
                    left join users as u
                    on c.user_id = u.id
                        where post_id = ?`,
        params,
        callback
      );
    },

    getLikesofPost: function (params, callback) {
      sendQuery(
        `SELECT user_id 
        FROM likes_list
            WHERE post_id=? and user_id=?`,
        params,
        callback
      );
    },

    updateViewCount: function (params, callback) {
      sendQuery(
        `UPDATE posts set
        view_count=?
            where post_id=?`,
        params,
        callback
      );
    },
  };
};

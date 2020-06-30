var http = require("http");
var express = require("express");
var app = express();
var server = http.createServer(app);
var port = 3333;
var path = require("path");
var session = require("express-session");
require("dotenv").config();
var db = require("./db");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

//얘는 그냥 가져오는놈
// var indexRouter = require('./routes/index');
// 얘는 필요한 모듈을 인자로 넘겨서 쓸수있게 해주는놈
var indexRouter = require("./routes/index")(db);
var postsRouter = require("./routes/posts")(db);
var postRouter = require("./routes/post")(db);
app.use("/", indexRouter);
app.use("/posts", postsRouter);
app.use("/post", postRouter);

//다중 join
//         connection.query(`
//             select p.post_id, title, contents, email, p.user_id, view_count, likes, comments
//                 from posts as p
//                     left join users as u
//                     on p.user_id = u.id
//                     left join comments as c
//                     on p.post_id = c.post_id
//                     where p.post_id = ?
//         `,

/*
    업데이트 쿼리
    update posts set title="", contents="" where post_id=?
    -> 수정 페이지 post 메소드만들기
        - 오류 발생 시 error 페이지로 이동
        - 성공 시 /posts 페이지로 이동(게시판 목록)
*/

server.listen(port, function () {
  console.log("웹 서버 시작", port);
});

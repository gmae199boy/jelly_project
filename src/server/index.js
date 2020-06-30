const express = require("express");
const app = express();
const http = require("http"),
  path = require("path");
const bodyParser = require("body-parser"),
  cookieParser = require("cookie-parser"),
  static = require("serve-static"),
  errorHandler = require("errorHandler"),
  expressErrorHandler = require("express-error-handler");
const expressSession = require("express-session");
var moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");

const cors = require("cors");
var config = require("./config/config");
var route_loader = require("./routes/route_loader");

//var MongoClient = require('mongodb').MongoClient;
var db = require("./db_path/database");
var passport = require("passport");
var flash = require("connect-flash");
app.locals.pretty = true;

app.set("views", "./views_file");
app.set("view engine", "jade");

app.set("port", process.env.PORT || config.server_port);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/public", static(path.join(__dirname, "public")));
app.use("/images", static(path.join(__dirname, "images")));
//app.use('/images', static(path.join(__dirname, 'images')));
app.use(cookieParser());
app.use(
  expressSession({
    secret: "my key",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

var router = express.Router();

// const sharp = require('sharp');

var configPassport = require("./config/passport");
configPassport(app, passport);

var userPassport = require("./routes/user_passport");
userPassport(router, passport);

route_loader.init(app, router, config);
// 프로세스 종료 시에 데이터베이스 연결 해제
process.on("SIGTERM", function () {
  console.log("프로세스가 종료됩니다.");
  app.close();
});

app.on("close", function () {
  console.log("Express 서버 객체가 종료됩니다.");
  if (db) {
    db.close();
  }
});

http.createServer(app).listen(app.get("port"), function () {
  console.log("서버가 시작되었습니다. 포트 : " + app.get("port"));

  // 데이터베이스 연결을 위한 함수 호출
  db.init(app, config);
});

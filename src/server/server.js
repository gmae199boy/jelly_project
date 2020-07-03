// ExpressJS Setup
const express = require('express');
const app = express();
var https = require('https');
var bodyParser = require('body-parser');
const fs = require('fs');
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/blog.nopublisher.dev/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/blog.nopublisher.dev/fullchain.pem'),
  ca: fs.readFileSync('/etc/letsencrypt/live/blog.nopublisher.dev/chain.pem')
};


const path = require('path');

//truffle setting
var contract = require('truffle-contract');
var jelly_artifacts = require('../../build/contracts/Jelly.json');
var Jelly = contract(jelly_artifacts);
var account;
var Web3 = require('web3');
var web3 = new Web3('http://localhost:8545');
web3.eth.getAccounts(function(err, accs){
  if(err) {console.log(err);return;}
  if(accs.length ===0) {console.log("어카운트 없음"); return;}
  account = accs[0];

  // Router
var indexRouter = require('./router/index')(Jelly, account);
var eventRouter = require('./router/event')(Jelly, account);
// var loginRouter = require('./router/login');
// var joinRouter = require('./router/join');
// var logoutRouter = require('./router/logout');
// var itemsRouter = require('./router/items');
// var newRouter = require('./router/new');
// var rateRouter = require('./router/rate');
// var mypageRouter = require('./router/mypage');

app.use('/', indexRouter);
app.use('/event', eventRouter);
// app.use('/login', loginRouter);
// app.use('/join', joinRouter);
// app.use('/logout', logoutRouter);
// app.use('/items', itemsRouter);
// app.use('/new', newRouter);
// app.use('/rate', rateRouter);
// app.use('/mypage', mypageRouter);

});
Jelly.setProvider(web3.currentProvider);

// Constants
const PORT = 8080;
const HOST = '127.0.0.1';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// use static file
app.use(express.static(path.join(__dirname, 'public')));

// configure app to use body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// DB
var mongoose = require('mongoose');

// index 
var autoIncrement = require('mongoose-auto-increment');
mongoose.set('useCreateIndex', true);
mongoose.connect('mongodb://localhost:27017/jelly', { useNewUrlParser: true,  useUnifiedTopology: true  })
var db = mongoose.connection;
autoIncrement.initialize(db);

db.on('error', function(){
    console.log('MongoDB connection failed!')
})
db.once('open', function(){
    console.log('MongoDB connection success!')
})


// Passport
var passport = require('passport')
var session = require('express-session')
// flash는 session이 필요하므로 반드시 session 아래에 정의해야 함
var flash = require('connect-flash');
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())


// server start
// app.listen(PORT, HOST);
// console.log(`Running on http://${HOST}:${PORT}`);

https.createServer(options, app).listen(PORT, function(){
  console.log('8080 connected!'); 
});

// server.listen(PORT, function(){
//   console.log("서버 연결");
// })

var login = function (req, res) {
  var id = req.body.id;
  var password = req.body.password;
  var db = req.app.get('db');
  if (db) {
    authUser(db, id, password, function (err, docs) {
      if (err) throw err;
      if (docs) {
        console.dir(docs);
      }
    });
  }
  res.render('index');
};

var login_page = function (req, res) {
  res.render('login');
};

//유저 추가 라우터
var addUser = function (req, res) {
  var id = req.body.id;
  var password = req.body.password;
  var name = req.body.nickname;

  var db = req.app.get('db');
  //데이터베이스 객체가 초기화된 경우, addUser함수 호출하여 사용자 추가
  if (db) {
    addUsers(db, id, password, name, function (err, result) {
      if (err) throw err;

      //결과 객체 확인하여 추가된 데이터 있으면 성공 응답 전송
      if (result && result.insertedCount > 0) {
        console.dir(result);
      } else {  //결과 객체가 없으면 실패 응답 전송

      }
    });
  } else {  //데이터베이스 객체가 초기화되지 않은 경우 실패응답 전송

  }
  res.render('index');
};


//사용자를 인증하는 함수
//사용자를 인증하는 함수 : 아이디로 먼저 찾고 비밀번호를 그 다음에 비교
var authUser = function (database, id, password, cb) {
  console.log('authUser 호출됨');

  //1. 아이디를 사용해 검색
  database.UserModel.findById(id, function (err, result) {
    if (err) {
      cb(err, null);
      return;
    }
    console.dir(result);
    if (result.length > 0) {
      console.log('아이디와 일치하는 사용자 찾음.');
      //2. 비밀번호 확인: 모델 인스턴스를 객체를 만들고 authenticate() 메소드 호출
      var user = new database.UserModel({ id: id });
      var authenticated = user.authenticate(password, result[0]._doc.salt,
        result[0]._doc.hashed_password);
      if (authenticated) {
        console.log('비밀번호 일치함');
        cb(null, result);
        delete user;
      } else {
        console.log('비밀번호 일치하지 않음');
        cb(null, null);
        delete user;
      }
    } else {
      console.log('일치하는 사용자를 찾을 수 없음');
      cb(null, null);
    }
  });
};



//사용자를 추가하는 함수
var addUsers = function (database, id, password, name, cb) {
  console.log('addUser 호출됨');

  //UserModel 인스턴스 생성
  var user = new database.UserModel({ "id": id, "password": password, "nickname": name });

  //save로 저장
  user.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('사용자 데이터 추가함.');
    cb(null, user);
  });
};

module.exports.login = login;
module.exports.addUser = addUser;
module.exports.login_page = login_page;
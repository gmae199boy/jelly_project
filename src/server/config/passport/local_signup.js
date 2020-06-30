var LocalStrategy = require('passport-local').Strategy;

module.exports = new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, function(req, email, password, done) {
    //요청 파라미터 중 name 파라미터 확인
    var paramName = req.body.nickname || req.query.nickname;
  
    if(!paramName){
      return done(null, false, req.flash('signupNameMessage', '닉네임을 설정해 주세요'));
    }
    //User.findOne 이 blocking되므로 async 방식으로 변경할 수도 있음
    process.nextTick(function(){
      var db = req.app.get('db');
      db.UserModel.findOne({'email':email}, function(err, user){
        //오류가 발생하면 
        if(err) return done(err);
  
        //기존에 이메일이 있다면
        if(user) return done(null, false, req.flash('signupMessage', '계정이 이미 있습니다.'));
        else {
          //모델 인스턴스 객체 만들어 저장
          var user = new db.UserModel({'email':email, 'password': password, 'nickname': paramName});
          user.save(function(err) {
            if(err) throw err;
            console.log('사용자 데이터 추가함.');
            return done(null, user);
          });
        }
      });
    });
  });
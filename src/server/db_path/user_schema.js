const crypto = require('crypto');
var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");
var Schema= {};

Schema.createSchema = function(mongoose){
    //스키마 정의
    var UserSchema = mongoose.Schema({
          super_user: {type: Boolean, index: true, 'default': false}
        , email: {type: String, required: true, unique: true, 'default': ''}
        , hashed_password: {type: String, 'default': '' }
        , salt: {type: String}
        , nickname: {type: String, index: 'hashed', unique: true}
        , level: {type: Number, required: true, 'default': 1}
        , exp: {type: Number, required:true, 'default': 0}
        , latest_drawing_m: {type: Number, 'default': null}
        , latest_drawing_d: {type: Number, 'deault': null}
        , drawing_continue: {type: Number, 'default': 0}
        , created_at: {type: Date, index: {unique: false}, 'default': moment().format("YYYY-MM-DD HH:mm")}
        , board_arr: [
            {board_id: {type: String, required: true, unique: true}}
        ]
        , provider: {type: String, 'default': ''}
        , authToken: {type: String, 'default': ''}
        , facebook: {}
        , google: {}
    });


    UserSchema
      .virtual('password')
      .set(function(password){
        this._password = password;
        this.salt = this.makeSalt();
        this.hashed_password = this.encryptPassword(password);
        console.log('virtual password 호출됨 : '+this.hashed_password);
      })
      .get(function(){return this._password});

    //스키마에 모델 인스턴스에서 사용할 수 있는 메소드 추가
    //비밀번호 암호화 메소드
    UserSchema.method('encryptPassword', function(plainText, inSalt){
      if(inSalt){
        return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
      } else {
        return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex');
      }
    });

    //salt값 만들기 메소드
    UserSchema.method('makeSalt', function(){
      return Math.round((new Date().valueOf() * Math.random())) + '';
    });

    //인증 메소드
    UserSchema.method('authenticate', function(plainText, inSalt, hashed_password){
      if(inSalt){
        console.log('authenticate 호출됨 : %s -> %s : %s', plainText,
          this.encryptPassword(plainText,inSalt), hashed_password);
        return this.encryptPassword(plainText, inSalt) == hashed_password;
      } else {
        console.log('authenticate 호출됨 : %s -> %s : %s', plainText,
          this.encryptPassword(plainText), this.hashed_password);
          return this.encryptPassword(plainText) == this.hashed_password;
      }
    });

    ////필수 속성에 대한 유효성 확인(길이 값 체크)
    //UserSchema.path('email').validate(function(email) {
    //  return email.length;
    //}, 'email 칼럼의 값이 없습니다.');

    //UserSchema.path('hashed_password').validate(function(hashed_password){
    //  return hashed_password.length;
    //}, 'hashed_password 칼럼의 값이 없습니다.');

    //스키마에 static 메소드 추가
    UserSchema.static('findByEmail', function(id, cb){
      return this.find({email:email}, cb);
    });
    UserSchema.static('findAll', function(cb){
      return this.find({}, cb);
    });

    console.log('UserSchema 정의함');

    return UserSchema;
};

module.exports = Schema;
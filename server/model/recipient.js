var mongoose = require('mongoose');
// var passportLocalMongoose = require('passport-local-mongoose');
var autoIncrement = require('mongoose-auto-increment');

const recipientSchema = new mongoose.Schema({
    recipientId: {type: Number},            // primary key
    name: String,                       // 수혜자 이름 or 닉네임
    email: String,                      // 수혜자 이메일
    password: String,                   // 수혜자 아이디의 비밀번호
    phoneNumber: String,                // 수혜자 핸드폰 번호
    address: String,                    // 수혜자 주소
    myProducts: [{eventId: Number}]     // 수혜자가 지금까지 샀던 물품 목록
});
// 플러그인 설정
// recipientSchema.plugin(passportLocalMongoose, { usernameField : 'email'});

recipientSchema.plugin(autoIncrement.plugin,{
	model : 'Recipient',
	field : 'recipientId',
	startAt : 0, //시작
	increment : 1 // 증가
});

// const model = mongoose.model('User', userSchema);

// export default model;
module.exports = mongoose.model('Recipient', recipientSchema);

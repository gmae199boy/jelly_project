var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var autoIncrement = require('mongoose-auto-increment');

const donorSchema = new mongoose.Schema({
    donorId: {type: Number},         // primary key
    name: String,                    // 기부자 이름 or 닉네임
    email: String,                   // 기부자 이메일
    password: String,                // 기부자 아이디의 비밀번호
    phoneNumber: String,             // 기부자 핸드폰 번호
    address: String,                 // 기부자 주소
    myEvents: [{eventId: Number}]    // 기부자가 지금까지 기부했던 기부 목록
});
// 플러그인 설정
donorSchema.plugin(passportLocalMongoose, { usernameField : 'email'});

donorSchema.plugin(autoIncrement.plugin,{
	model : 'Donor',
	field : 'donorId',
	startAt : 1, //시작 
	increment : 1 // 증가
});

// const model = mongoose.model('User', userSchema);

// export default model;
module.exports = mongoose.model('Donor', donorSchema);



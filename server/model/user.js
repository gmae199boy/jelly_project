var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var autoIncrement = require('mongoose-auto-increment');
//var EventSchema = require('./event').schema;

const userSchema = new mongoose.Schema({
    userId: { type: Number, unique: true }, // primary key
    name: {
        type: String,
        unique: true,
        //required: true,
        //index: true
    },  // 기부자 이름 or 닉네임
    email: {
        type: String,
        //required: true,
        unique: true,
        index: true
    }, // 기부자 이메일
    password: {
        type: String,
        //required: true
    }, // 기부자 아이디의 비밀번호
    // phoneNumber: {
    //     type: String,
    //     //required: true
    // }, // 기부자 핸드폰 번호
    // address: {
    //     type: String,
    //     //required: true
    // }, // 기부자 주소
    myEvents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        donateAmount: Number
    }], // 기부자가 지금까지 기부했던 기부 목록
    creditRecord: [{
        tid: {type: String, index: true},
        pgToken: {type: String},
        partnerOrderId: {type: String},
        partnerUserId: {type: String},
        itemName: {type: String},
        totalAmount: {type: Number},
        quantity: {type: Number},
        // createdAt: {}
    }], //사용자 결제 정보
});
// 플러그인 설정
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

userSchema.plugin(autoIncrement.plugin, {
    model: 'User',
    field: 'userId',
    startAt: 0, //시작 
    increment: 1 // 증가
});

// const model = mongoose.model('User', userSchema);

// export default model;
module.exports = mongoose.model('User', userSchema);



var mongoose = require('mongoose');
// var passportLocalMongoose = require('passport-local-mongoose');
var autoIncrement = require('mongoose-auto-increment');
require('mongoose-moment')(mongoose);

const productSchema = new mongoose.Schema({
    productId: {type: Number},
    name: String,            // 이벤트 이름
    amount: {type: Number},  // 이벤트 목표 금액
    startDate: 'Moment',     // 이벤트 시작 시간
    endDate: Date,           // 이벤트 종료 시간
    desc: String,            // 이벤트 설명
    status: {
        type: Number, // 1: 진행 전, 2: 진행 중, 4: 진행 종료
        // required: true
    },       // 이벤트 상태 (모금 중, 모금 종료 등) 
    //eventDetail:[{///}]
});

productSchema.plugin(autoIncrement.plugin,{
	model : 'Product',
	field : 'productId',
	startAt : 0, //시작
	increment : 1 // 증가
});

module.exports = mongoose.model('Product', productSchema);
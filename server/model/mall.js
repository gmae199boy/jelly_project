var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

const mallSchema = new mongoose.Schema({
    mallId: {type: Number, unique: true},
    name: String,            // 상품 이름
    amount: {type: Number},  // 상품 목표 금액
    desc: String,            // 상품 설명 
});

mallSchema.plugin(autoIncrement.plugin,{
	model : 'Mall',
	field : 'mallId',
	startAt : 0, //시작
	increment : 1 // 증가
});

module.exports = mongoose.model('Mall', mallSchema);

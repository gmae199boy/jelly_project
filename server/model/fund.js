var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
require('mongoose-moment')(mongoose);

const fundSchema = new mongoose.Schema({
    fundId: {type: Number, unique: true},
    name: {
        type: String,
        required: true,
    },            // 이벤트 이름
    amount: {type: Number},  // 이벤트 목표 금액
    startDate: 'Moment',     // 이벤트 시작 시간
    endDate: Date,           // 이벤트 종료 시간
    desc: String,            // 이벤트 설명
    currentAmount: {type: Number, default: 0},
    // 받아야할 수혜자 리스트
    receiveRecipients: [{
        type: String,
    }],
    status: {
        type: Number, // 1: 진행 전, 2: 진행 중, 4: 진행 종료
        // required: true
    },       // 이벤트 상태 (모금 중, 모금 종료 등)
    fundingDetails:[{
        id: {
            type: mongoose.Schema.Types.ObjectId, //이름만 저장할지 레퍼런스로 넣어야하는지.
            ref: 'User',
        },
        amount: {type: Number, required: true, default: 0},
    }],
});

fundSchema.plugin(autoIncrement.plugin,{
	model : 'Fund',
	field : 'fundId',
	startAt : 0, //시작
	increment : 1 // 증가
});

module.exports = mongoose.model('Fund', fundSchema);

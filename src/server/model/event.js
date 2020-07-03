var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var autoIncrement = require('mongoose-auto-increment');
var moment = require('moment');
require('mongoose-moment')(mongoose);

const eventSchema = new mongoose.Schema({
    eventId: {type: Number},
    name: String,                                       // 이벤트 이름
    type: String,                                       // 이벤트 타입,종류
    amount: String,                                     // 이벤트 목표 금액
    startDate: 'Moment',  // 이벤트 시작 시간
    endDate: Date,    // 이벤트 종료 시간
    desc: String,                                       // 이벤트 설명
    status: String                                      // 이벤트 상태 (모금 중, 모금 종료 등)
    //eventDetail:[{///}]
});

eventSchema.plugin(autoIncrement.plugin,{
	model : 'Event',
	field : 'eventId',
	startAt : 0, //시작 
	increment : 1 // 증가
});

module.exports = mongoose.model('Event', eventSchema);
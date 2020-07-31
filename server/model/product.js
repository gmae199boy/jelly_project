var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
require('mongoose-moment')(mongoose);

const productSchema = new mongoose.Schema({
    productId: {type: Number, unique: true},
    name: String,            // 이벤트 이름
    amount: {type: Number},  // 이벤트 목표 금액
    startDate: 'Moment',     // 이벤트 시작 시간
    endDate: Date,           // 이벤트 종료 시간
    desc: String,            // 이벤트 설명
    status: {
        type: Number, // 1: 진행 전, 2: 진행 중, 4: 진행 종료
        // required: true
    },       // 이벤트 상태 (모금 중, 모금 종료 등) 
    productDetails:[{
        id: {
            type: mongoose.Schema.Types.ObjectId, //이름만 저장할지 레퍼런스로 넣어야하는지.
            ref: 'User',
        },
        amount: {type: Number, required: true, default: 0},
    }],
});

productSchema.plugin(autoIncrement.plugin,{
	model : 'Product',
	field : 'productId',
	startAt : 0, //시작
	increment : 1 // 증가
});

module.exports = mongoose.model('Product', productSchema);


const QRCode = require("qrcode");


// app.get("/", (req, res) => {
//   const inputText = `
//     첫번째 생성하는 QR 코드
//   `;

//   QRCode.toDataURL(inputText, (err, url) => {
//     const data = url.replace(/.*,/, "");
//     const img = new Buffer(data, "base64");

//     res.writeHead(200, {
//       "Content-Type": "image/png",
//       "Content-Length": img.length
//     });

//     res.end(img);
//   });
// });

// app.listen(3000, () => console.log("http://localhost:3000"));
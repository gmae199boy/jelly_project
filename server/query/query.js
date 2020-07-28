var User = require("../model/user");
var Product = require("../model/product");

var query = {};

//한 페이지에 20개의 펀딩까지 보여준다.
//readProductList
const perPage = 20;

// 유저가 참여한 product의 목록을 배열로 리턴한다.
query.getUserProducts = function(userId, callback) {
    User.find({userId: userId}, {myProducts: 1})
    .populate('myProducts')
    .exec((err, result) => {
        if (err) {callback(err, null); return;}
        callback(null, result);
        return;
    });
}

// 현재 진행중인 productList를 배열로 반환한다.
query.getProductList = function(page = 0, status = 2, callback) {
    //status = 1 : 펀딩 진행 전, status = 2 : 펀딩 진행 중, status = 4 : 펀딩 종료
    Product.find({status: status}, { 
        _id: 0, 
        productId: 1, 
        name: 1, 
        type: 1, 
        amount: 1, 
        startDate: 1, 
        endDate: 1, 
        desc: 1, 
        status: 1 })
    .sort({ $natural: 1 })
    .skip(page * perPage)
    .limit(perPage)
    .lean()
    .exec((err, result) => {
        if (err) {callback(err, null); return;}
        if (result) { // 전송 할 데이터가 있으면
            callback(null, result);
            return;
        } else {
            callback(null, null);
            return;
        }
    });
}

query.getProduct = function(productId, callback) {
    Product.findOne({productId: productId}).exec((err, result) => {
        if (err) {callback(err, null); return;}
        callback(null, result);
        return;
    });
}

module.exports = query;
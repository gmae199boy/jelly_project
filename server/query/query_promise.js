var User = require("../model/user");
var Product = require("../model/product");

var queryPromise = {};

//한 페이지에 20개의 펀딩까지 보여준다.
//readProductList
const perPage = 20;

// 유저가 참여한 product의 목록을 배열로 리턴한다.
queryPromise.getUserProducts = function(userId) {
    return new Promise((resolve, reject) => {
        User.find({userId: userId}, {myProducts: 1})
        .populate('myProducts')
        .exec((err, result) => {
            if (err) {reject(eer);}
            resolve(result);
        });
    });
}

// 현재 진행중인 productList를 배열로 반환한다.
queryPromise.getProductList = function(page = 0, status = 2) {
    return new Promise((resolve, reject) => {
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
            if (err) {reject(err);}
            resolve(result);
        });
    });
}

queryPromise.getProduct = function(productId) {
    return new Promise((resolve, reject) => {
        Product.findOne({productId}).exec((err, result) => {
            if (err) {reject(err);}
            console.log("productId = " + productId);
            console.log(result);
            resolve(result);
        });
    });
}

queryPromise.setProduct = function(product) {
    return new Promise((resolve, reject) => {
        product.save((err, result) => {
            if(err) reject(err);
            resolve(result);
        })
    })
}

queryPromise.updateProduct = function(product) {
    return Promise((resolve, reject) => {
        Product.findOneAndUpdate({productId: product.productId}, )
    })
}

queryPromise.setUserData = function(user) {
    return new Promise((resolve, reject) => {
        user.save((err, result) => {
            if(err) reject(err);
            resolve(result);
        })
    });
}

module.exports = queryPromise;
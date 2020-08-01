var User = require("../model/user");
var Fund = require("../model/fund");
var Product = require('../model/product');
var queryPromise = {};

//한 페이지에 20개의 펀딩까지 보여준다.
//readFundList
const perPage = 20;

// 유저가 참여한 fund의 목록을 배열로 리턴한다.
queryPromise.getUserFundingList = function(userId) {
    return new Promise((resolve, reject) => {
        User.find({userId: userId}, {myFundingList: 1})
        .populate('myFundingList')
        .exec((err, result) => {
            if (err) {reject(eer);}
            resolve(result);
        });
    });
}

// 현재 진행중인 fundingList를 배열로 반환한다.
queryPromise.getFundList = function(page = 0, status = 2) {
    return new Promise((resolve, reject) => {
        //status = 1 : 펀딩 진행 전, status = 2 : 펀딩 진행 중, status = 4 : 펀딩 종료
        Fund.find({status: status}, { 
            _id: 0, 
            fundId: 1, 
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

queryPromise.getFund = function(fundId) {
    return new Promise((resolve, reject) => {
        Fund.findOne({fundId: fundId}).exec((err, result) => {
            if (err) {reject(err);}
            resolve(result);
        });
    });
}

queryPromise.setFund = function(fund) {
    return new Promise((resolve, reject) => {
        fund.save((err, result) => {
            if(err) reject(err);
            resolve(result);
        })
    })
}

queryPromise.updateFund = function(fundId, update) {
    return new Promise((resolve, reject) => {
        Fund.findOneAndUpdate(
            {fundId: fundId},
            update,
            {new: true})
            .exec((err, result) => {
                if(err) reject(err);
                console.log(result);
                resolve(result);
            })
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

queryPromise.getPopulatedUserForMyFundingList = function(userId) {
    return new Promise((resolve, reject) => {
        User.findOne({userId: userId}).populate('myFundingList.id', 
            'fundId name amount'
        ).exec((err, result) => {
            if(err) reject(err);
            resolve(result);
        });
    })
}

queryPromise.getProductList = function(page = 0){
    return new Promise((resolve, reject) => {
        //status = 1 : 펀딩 진행 전, status = 2 : 펀딩 진행 중, status = 4 : 펀딩 종료
        Product.find({})
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

queryPromise.getProductDetail = function(productId) {
    return new Promise((resolve, reject) => {
        Product.findOne({productId: productId}).exec((err, result) => {
            if(err) reject(err);
            resolve(result);
        })
    })
}

queryPromise.setProductList = function(product) {
    return new Promise((resolve, reject) => {
        product.save((err, result) => {
            if(err) reject(err);
            resolve(result);
        })
    })
}

module.exports = queryPromise;
var User = require("../model/user");
var Fund = require("../model/fund");
var Product = require('../model/product');
const { query } = require("express");
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
// page와 status에 맞게 리스트를 반환한다.
// page = 2, status = 2 이면 
// status 가 2인(펀딩 중) 20~40 인덱스의 펀딩 리스트를 반환.
queryPromise.getFundList = function(page = 1, status = 2) {
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
        .skip((page - 1) * perPage)
        .limit(perPage)
        .lean()
        .exec((err, result) => {
            if (err) {reject(err);}
            resolve(result);
        });
    });
}

// 펀드 상품을 한개 불러온다
queryPromise.getFund = function(fundId) {
    return new Promise((resolve, reject) => {
        Fund.findOne({fundId: fundId}).exec((err, result) => {
            if (err) {reject(err);}
            resolve(result);
        });
    });
}

queryPromise.getPopulatedFundForRecipient = function(fundId) {
    return new Promise((resolve, reject) => {
        Fund.findOne({fundId: fundId})
            .populate('receiveRecipients')
            .exec((err, result) => {
            if(err) reject(err);
            resolve(result);
        })
    })
}

// 펀드 상품을 저장한다.
queryPromise.setFund = function(fund) {
    return new Promise((resolve, reject) => {
        fund.save((err, result) => {
            if(err) reject(err);
            resolve(result);
        })
    })
}

// 펀드 상품 한개를 업데이트 한다.
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

// 유저 정보를 저장한다.
queryPromise.setUserData = function(user) {
    return new Promise((resolve, reject) => {
        user.save((err, result) => {
            if(err) reject(err);
            resolve(result);
        })
    });
}

// 유저가 들고있는 myFundingList를 Fund 모델에서 참조해서 불러온다.
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

// 유저가 구매한 상품의 리스트를 Product 모델에서 참조해서 불러온다.
queryPromise.getPopulatedUserForPurchaseList = function(userId) {
    return new Promise((resolve, reject) => {
        User.findOne({userId: userId}).populate('purchaseList.id').exec((err, result) => {
            if(err) reject(err);
            resolve(result);
        })
    })
}

// 상품의 리스트를 불러온다.
// page에 맞게 20개씩 불러온다.
queryPromise.getProductList = function(page = 1){
    return new Promise((resolve, reject) => {
        Product.find({})
        .sort({ $natural: 1 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .lean()
        .exec((err, result) => {
            if (err) {reject(err);}
            resolve(result);
        });
    });
}

// 상품 한개를 불러온다
queryPromise.getProduct = function(productId) {
    return new Promise((resolve, reject) => {
        Product.findOne({productId: productId}).exec((err, result) => {
            if(err) reject(err);
            resolve(result);
        })
    })
}

// 상품을 저장한다.
queryPromise.setProduct = function(product) {
    return new Promise((resolve, reject) => {
        product.save((err, result) => {
            if(err) reject(err);
            resolve(result);
        })
    })
}

queryPromise.receivejelly = function(fundId, amount) {
    return new Promise((resolve, reject) => {
        var i = 0;
        queryPromise.getPopulatedFundForRecipient(fundId).then((result) => {
            for(i; i < result.receiveRecipients.length; ++i) {
                User.findOneAndUpdate({
                    userId: result.receiveRecipients.userId
                }, {
                    wallet: result.wallet += amount
                }).exec((err, result) => {
                    if(err) {reject(err);return;}
                });
            }
            if(i == result.receiveRecipients.length) resolve(true);
        })
    })
}

module.exports = queryPromise;
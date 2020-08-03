var express = require('express');
var router = express.Router();
var passport = require('passport');

// var query = require('../query/query');
const queryPromise = require('../query/query_promise');

var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

var User = require('../model/user');
var Fund = require('../model/fund');

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const PRE_FUND = 1;
const FUNDING = 2;
const FUND_OVER = 4;


module.exports = function(contract, account){
    // index
    router.get('/', function(req, res) {
        // promise query
        queryPromise.getFundList(req.query.page, req.query.status)
        .then((result) => {
            res.render('fundList', {
                user: req.user,
                funds: result,
            });
        }).catch((err) => {
            res.send(err);
        })

        // normal query
        // query.getProductList(req.query.page, req.query.status, (err, result) => {
        //     if(err) {console.log(err); res.send("readProductList query err!!");}
        //     res.render('productList', {
        //         user: req.user,
        //         products: result,
        //     });
        // });
    });

    router.route("/create")
        .get(function(req, res){
            res.render('create_fund', {
                user: req.user,
            });
        })
        .post(function(req, res){
            const date = req.body.startDate;
            var fund = new Fund({
                name: req.body.name,
                type: req.body.type,
                amount: req.body.amount,
                desc: req.body.desc,
                status: req.body.status,
                startDate: moment(date).format("YYYY-MM-DD hh:mm"),
            });

            // promise query
            queryPromise.setFund(fund).then((result) => {
                //이더리움 통신
                // console.log('시간 차이: ', moment.duration(moment().diff(result.startDate)).asHours());
                contract.deployed().then(function(contractInstance){
                    contractInstance.newFund(
                        result.amount, // 총 펀딩 달성 금액
                        10, // 각 수혜자들이 받아야 할 금액
                        // 수혜자들의 지갑주소를 배열로 넘겨야 한다.
                        ['0xD5Db8B803FDDF6D3454bb9fDB77795Dc845B90D6','0x9B201AEd418f3c07469F7688296BD247729493aE'],
                        {gas: 1000000, from: account}
                    ).then((bool) => {
                        if(bool) console.log("add fund Successful!!");
                        else console.log("add product Fail");
                        res.redirect('/fund');
                    })
                });
            }).catch((err) => {
                console.log(err);
                res.send(err);
            });
        });

    router.post('/funding/:id', function(req, res){
        const amount = req.body.amount;
        const fundId = req.params.id;
        var fundResult;

        if(amount <= 0) {console.log("기부 금액이 0보다 작거나 같음"); res.send("금액을 0보다 크게 입력해"); return;}
        if(amount > req.user.wallet) {console.log("지갑에 잔액이 충분하지 않음."); res.send("지갑 금액 부족."); return;}
        queryPromise.getFund(fundId).then((result) => {
            var totalAmount = result.currentAmount + amount;
            if(totalAmount > result.amount) {
                console.log("목표 금액을 초과하였다.");
                res.send("목표 금액을 초과했으니 목표 금액까지만 기부해라");
                return;
            } else {
                var fundingDetails = {$push: 
                    {'fundingDetails': 
                        {'id': req.user._id, 'amount': amount,}},
                    currentAmount: result.currentAmount+amount};
                queryPromise.updateFund(fundId, fundingDetails).then((result) => {
                    fundResult = result;
                    req.user.myFundingList.push({id: result._id, amount: amount,});
                    req.user.wallet -= amount;
                    return queryPromise.setUserData(req.user);
                }).then((result) => {
                    console.log('펀딩 성공!!! 얼마나 펀딩했습니까? = ' + result.myFundingList[result.myFundingList.length - 1].amount);
                    contract.deployed().then(function(contractInstance){
                        contractInstance.funding(
                            result.fundId, // 펀드 id
                            amount,        // 펀딩 금액
                            {gas: 1000000, from: account},
                        ).then((bool) => {
                            if(bool) console.log("funding Successful!!");
                            else console.log("funding Fail");

                            // 모금이 완료되면 정산을 시작
                            if(fundResult.amount == fundResult.currentAmount) {
                                queryPromise.receivejelly(fundId).then((result) => {
                                    if(!result) {
                                        console.log('queryPromise.receiveJelly error!');
                                        res.send('queryPromise.receiveJelly error!');
                                    } else {
                                        fundResult.status = FUND_OVER;
                                        queryPromise.setFund(fundResult).then((result) => {
                                            console.log(result);
                                            console.log("수혜자들에게 분배 성공!");
                                            res.redirect('/fund');
                                        }).catch((err) => {
                                            console.log(err);
                                            res.send('정산 에러');
                                        })
                                    }
                                })
                                return;
                            }
                            res.redirect('/fund/' + result.fundId);
                        })
                    });
                }).catch((err) => {
                    console.log(err);
                    res.send("모종의 이유로 펀딩실패");
                })
            }
        })
    });


    // show
    router.get('/:id', function(req, res){
        // promise query
        queryPromise.getFund(req.params.id)
        .then((result) => {
            res.render('fund', {
                user: req.user,
                fund: result,
            });
        })
        .catch((err) => {
            res.send(err);
        })
        /**
         * Query for ethereum
         */
        // console.log(req.params.id)
        // contract.deployed().then(function(contractInstance){
        //     contractInstance.getEvent.call(req.params.id).then(function(event){
        //         console.log(event)
        //         res.render('event', {
        //             event: event,
        //             donor: req.donor
        //         })
        //     });
        // })

        /**
         * Query for mongodb
         */
        // Product.findOne({ eventId: req.params.id }, (err, event)=>{
        //     if(err) {console.log(err); res.send('query err!');}
        //     console.log(event);
        //     res.render('event', {
        //         donor : req.donor,
        //         event: event
        //     });
        // });
    });

    return router;
}

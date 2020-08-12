var express = require('express');
var router = express.Router();
var request = require('request');

var passport = require('passport');

// session for mongoose passport
var User = require('../model/user');

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = function(contract, account){

    // 젤리 결제 시스템 
    // 사용 API : Kakaopay 단건 결제.
    // 추가 정기 결제 시스템
    router.route('/')
        .get(function(req, res) {
            // require -> views page (credit.ejs)
            if(req.user == undefined) res.send("로그인을 해주세요");
            res.render('credit', {title: "credit", user: req.user, message: req.flash('error')});
        })
        .post(function(req, res){
            /**
             * 아직 이중지불 문제는 해결하지 않는다.
             */
            var amount = req.body.amount;

            // 카카오API를 불러오기 위한 준비
            var headers = {
                'Authorization': 'KakaoAK 3f673c88c4254221b40f3bea7349064f',
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            }
            var options = {
                url: "https://kapi.kakao.com/v1/payment/ready",
                method: "POST",
                headers: headers,
                form: {
                    'cid': 'TC0ONETIME',
                    'partner_order_id': 'TC0ONETIME',
                    'partner_user_id': 'TC0ONETIME',
                    'item_name': 'Jelly',
                    'quantity': amount,
                    'total_amount': amount,
                    'tax_free_amount': '0',
                    'approval_url': 'http://localhost:8080/credit/complete',
                    'fail_url': 'http://localhost:8080',
                    'cancel_url': 'http://localhost:8080',
                },
            }
            // 카카오API에 요청 전송
            request(options, (err, response, body) =>{
                if(err) {console.log(err); res.send(err);}
                var resultJson = JSON.parse(body);
                console.log("user.creditRecord typeof : " + typeof(req.user.creditRecord));
                req.user.creditRecord.push({
                    tid: resultJson.tid,
                    partnerOrderId: 'TC0ONETIME',
                    partnerUserId: 'TC0ONETIME',
                    itemName: 'Jelly',
                    totalAmount: amount,
                    quantity: amount,
                });
                req.user.save((err, result) => {
                    if(err) {console.log(err); res.send(err);}
                    console.log("결제 진행중......");
                    res.redirect(resultJson.next_redirect_pc_url);
                })
            });
        });
    
    router.get('/complete', function(req, res) {
        var pg_token = req.query.pg_token;

        // 카카오API의 승인 응답을 받기위한 준비
        var headers = {
            'Authorization': 'KakaoAK 3f673c88c4254221b40f3bea7349064f',
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        }
        var options = {
            url: "https://kapi.kakao.com/v1/payment/approve",
            method: "POST",
            headers: headers,
            form: {
                'cid': 'TC0ONETIME',
                'tid': req.user.creditRecord[req.user.creditRecord.length-1].tid,
                'pg_token': pg_token,
                'partner_order_id': 'TC0ONETIME',
                'partner_user_id': 'TC0ONETIME',
            },
        }
        // 승인 요청
        request(options, (err, response, body) =>{
            if(err) {console.log(err); res.send(err);}
            console.log("결제 승인 페이지 입니다!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            var resultJson = JSON.parse(body);
            console.log(resultJson);
            req.user.creditRecord[req.user.creditRecord.length-1].pgToken = pg_token;
            // console.log('시간 차이: ', moment.duration(moment().diff(result.startDate)).asHours());
            
            // 이더 연동부분
            // 여기서 web3와 통신해서 사용자에게 토큰을 줘야한다.
            contract.deployed().then(function(contractInstance){
                contractInstance.transfer(
                    '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1', // 마스터 계정
                    req.user.address, // 사용자 계정
                    parseInt(resultJson.amount.total),
                    {gas: 1000000, from: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'},
                ).then((bool) => {
                    if(bool) console.log('이더에 저장 성공');
                    else console.log('이더에 저장 실패');
                    req.user.wallet += parseInt(resultJson.amount.total);

                    req.user.save((err, result) => {
                        if(err) {console.log(err); res.send(err);}
                        res.render('credit_complete', {
                            amount: parseInt(resultJson.amount.total),
                            user: req.user,
                        })
                    });
            })});
        });
    })

/**
 * 결제 취소, 환불 등 변수는 나중에 작성 필
 */


    return router;
}
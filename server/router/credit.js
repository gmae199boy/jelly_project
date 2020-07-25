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
            request(options, (err, response, body) =>{
                if(err) {console.log(err); res.send(err);}
                var json = JSON.parse(body);
                console.log(json);
                req.user.creditRecord.push({
                    tid: json.tid,
                    partnerOrderId: 'TC0ONETIME',
                    partnerUserId: 'TC0ONETIME',
                    itemName: 'Jelly',
                    totalAmount: amount,
                    quantity: amount,
                });
                req.user.save((err, result) => {
                    if(err) {console.log(err); res.send(err);}
                    res.redirect(json.next_redirect_pc_url);
                })
            });
        });
    
    router.get('/complete', function(req, res) {
        var pg_token = req.query.pg_token;
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
        request(options, (err, response, body) =>{
            if(err) {console.log(err); res.send(err);}
            console.log("결제 승인 페이지 입니다!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            var json = JSON.parse(body);
            console.log(json);
            res.render('credit_complete', {
                amount: json.amount.total,
                user: req.user,
            })
        });
    })
    return router;
}
var express = require('express');
var router = express.Router();
var request = require('request');

// var passport = require('passport');

// session for mongoose passport
var Donor = require('../model/donor');

// passport.use(Donor.createStrategy());
// passport.serializeUser(Donor.serializeUser());
// passport.deserializeUser(Donor.deserializeUser());

module.exports = function(contract, account){
    router.get('/', function(req, res) {
        // require -> views page (credit.ejs)
        res.render('credit', {title: "credit", user: req.session.user, message: req.flash('error')});
    });

    router.post('/', function(req, res){
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
                'quantity': '1',
                'total_amount': '10000',
                'tax_free_amount': '0',
                'approval_url': 'https://developers.kakao.com/success',
                'fail_url': 'https://developers.kakao.com/fail',
                'cancel_url': 'https://developers.kakao.com/cancel',
            },
        }
        request(options, (err, response, body) =>{
            if(err) {console.log(err); res.send(err);}
            console.log(body);
        })
        // switch(req.body.userType){
        //     case "donor": {
        //         Donor.find({email: email, password: password}, (err, result) => {
        //             if(err) {
        //                 console.log(err);
                        
        //                 res.render("login", {
        //                 error: true,
        //                 errorMessage: "이메일이 없거나 오류가 생겼습니다."
        //               });
        //             }
        //             if(result != undefined){
        //                 req.session.user = result;
        //                 res.redirect('/');
        //             }
        //         });
        //     }
        //     break;
        //     case "recipient": {
        //         Recipient.find({email: email, password: password}, (err, result) => {
        //             if(err) {
        //                 console.log(err);
                        
        //                 res.render("login", {
        //                 error: true,
        //                 errorMessage: "이메일이 없거나 오류가 생겼습니다."
        //               });
        //             }
        //             if(result != undefined){
        //                 req.session.user = result;
        //                 res.redirect('/');
        //             }
                    
        //         });
        //     }
        //     break;
        //     default: {
        //       console.log("signup user type name error");
        //       res.render("signup", {
        //         error: true,
        //         errorMessage: "userType이 올바르지 않습니다."
        //       });
        //     }
        //   }
    });
    return router;
}
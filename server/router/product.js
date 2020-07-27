var express = require('express');
var router = express.Router();
var passport = require('passport');

var query = require('../query/query');

var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

var User = require('../model/user');
var Product = require('../model/product');

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


module.exports = function(contract, account){
    // index
    router.get('/', function(req, res) {
        if(req.query.productId !== undefined){
            query.readProduct(req.query.productId, (err, result) => {
                if (err) {console.log(err); res.send("readProduct query err!!")}
                res.render('product', {
                    user: req.user,
                    product: result,
                });
            });
        }
        query.readProductList(req.query.page, req.query.status, (err, result) => {
            if(err) {console.log(err); res.send("readProductList query err!!");}
            res.render('productList', {
                user: req.user,
                products: result,
            });
        });
    });

    router.route("/create")
        .get(function(req, res){
            res.render('createProduct', {
                user: req.user,
            });
        })
        .post(function(req, res){
            const date = req.body.startDate;
            var product = new Product({
                name: req.body.name,
                type: req.body.type,
                amount: req.body.amount,
                desc: req.body.desc,
                status: req.body.status,
                startDate: moment(date).format("YYYY-MM-DD hh:mm")
            });
            product.save(function(err, result){
                if(err) {console.log(err); res.send('product save err!');}
                console.log("product create success");
                res.redirect('/product');
                //이더리움 통신
                //console.log('시간 차이: ', moment.duration(moment().diff(result.startDate)).asHours());
                // contract.deployed().then(function(contractInstance){
                //     contractInstance.addEvent(
                //         result.eventId,
                //         {gas: 1000000, from: account}
                //     ).then(function(bool){
                //         if(bool) console.log("add product Successful!!");
                //         else console.log("add product Fail");
                //         res.redirect('/product');
                //     })
                        // result.name,
                        // result.type, 
                        // result.amount, 
                        // moment(result.startDate).format('YYYY-MM-DD hh:mm'), 
                        // moment(result.endDate).format('YYYY-MM-DD hh:mm'),
                        // result.desc, result.status, {gas: 500000, from: account})
                        //     .then(function(){
                        //         res.redirect('/event');
                        //     })
                // })
            })
        });

    router.post('/funding', function(req, res){
        const email = req.user.email;
        const amount = req.body.amount;
        const productId = req.query.productId;

        if(amount <= 0) {console.log("기부 금액이 0보다 작거나 같음"); res.send("금액을 0보다 크게 입력해");}

        query.readProduct(productId, (err, result) => {
            if(err) {console.log(err); res.send('readProduct query err!');}
            res.send(result);
        });
    });


    // show
    router.get('/:id', function(req, res){
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
        Event.findOne({ eventId: req.params.id }, (err, event)=>{
            if(err) {console.log(err); res.send('query err!');}
            console.log(event);
            res.render('event', {
                donor : req.donor,
                event: event
            });
        });
    });

    // // update
    // router.route('/update/:id')
    //     .get((req, res) => {
    //         Event.findOne({ id: req.params.itemId }, (err, event) => {
    //             if(err) {console.log(err); res.send('query fail');}
    //             res.render('update', { 
    //                 event: event
    //             });
    //         }); 
    //     })
    //     .post((req, res) => {
    //         Item.updateOne(
    //             { id: req.params.eventId }, 
    //             { $set: { name: req.body.name, comment: req.body.comment, detail: req.body.detail } }, 
    //             (err, item) => {
    //             if(err) return res.json(err);
    //             console.log("수정 성공")
    //             res.redirect('/');
    //         });
    //     })

    // // delete
    // router.get('/delete/:id', (req, res) => {
    //     Event.deleteOne({ evnetId: req.params.eventId }, (err, event) => {
    //     if(err) {console.log(err); res.send(err);}
    //     res.redirect('/event');
    //     });
    // });

    // //create an apply
    // router.post('/:id/applies', function(req, res, next){
    //     var newapply = { body: req.body.apply, author: req.body.user }
    //     console.log(newapply)
    //     Item.findOne({ itemId: req.params.id }, function(err, item){
    //         item.applies.push(newapply);
    //         item.save();
    //         console.log("신청 성공");
    //         res.redirect('/');
    //     })
    // });

    // // admit an apply
    // router.post('/:id/admit', function(req, res, next){
    //     var index = req.body.index;
    //     Item.findOne({ itemId: req.params.id }, function(err, item){
    //         if(err) return res.json({success:false, message:err});
    //         item.applies[index].$set({status: "matched"});
    //         item.save();
    //         console.log(item.applies[index].status);
    //         res.redirect('/')
    //     })
    // })
    return router;
}

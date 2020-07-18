var express = require('express');
var router = express.Router();
var passport = require('passport');

var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

var Donor = require('../model/donor');
var Event = require('../model/event');

passport.use(Donor.createStrategy());
passport.serializeUser(Donor.serializeUser());
passport.deserializeUser(Donor.deserializeUser());


module.exports = function(contract, account){
    // index
    router.get('/', function(req, res, next) {
        const page = req.body.page;
        const perPage = 20;
        Event.find({}, { _id: 0, eventId: 1, name: 1, type: 1, amount: 1, startDate: 1, endDate: 1, desc: 1, status: 1 })
        .sort({ $natural: 1 })
        .skip(page * perPage)
        .limit(perPage)
        .lean()
        .exec((err, result) => {
            if (err) {console.log(err); res.send('query err!');}
            if (result) { // 전송 할 데이터가 있으면
                res.render('eventList', {
                    donor: req.donor,
                    events: result
                })
            } else {
                res.status(401).send('err');
            }
        });
    });

    router.route("/create")
        .get(function(req, res){
            res.render('createEvent', {
                donor: req.donor
            });
        })
        .post(function(req, res){
            var date = req.body.startDate;
            var event = new Event({
                name: req.body.name,
                type: req.body.type,
                amount: req.body.amount,
                desc: req.body.desc,
                status: req.body.status,
                startDate: moment(date).format("YYYY-MM-DD hh:mm")
            });
            event.save(function(err, result){
                if(err) {console.log(err); res.send('event save err!');}
                //console.log('시간 차이: ', moment.duration(moment().diff(result.startDate)).asHours());
                contract.deployed().then(function(contractInstance){
                    contractInstance.addEvent(
                        result.eventId,
                        {gas: 1000000, from: account}
                    ).then(function(bool){
                        if(bool) console.log("addEvent Successful!!");
                        else console.log("addEvent Fail");
                        res.redirect('/event');
                    })
                        // result.name,
                        // result.type, 
                        // result.amount, 
                        // moment(result.startDate).format('YYYY-MM-DD hh:mm'), 
                        // moment(result.endDate).format('YYYY-MM-DD hh:mm'),
                        // result.desc, result.status, {gas: 500000, from: account})
                        //     .then(function(){
                        //         res.redirect('/event');
                        //     })
                })
            })
        });

    router.post('/donate/:id', function(req, res){
        const email = req.body.email;
        const amount = req.body.amount;
        if(amount <= 0) {console.log("기부 금액이 0보다 작거나 같음"); res.send("금액을 0보다 크게 입력해");}

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

var express = require('express');
var router = express.Router();
var passport = require('passport');

var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

var User = require('../model/donor');
var Event = require('../model/event');

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// index
router.get('/', function(req, res, next) {
    const page = req.body.page;
    const perPage = 20;
    Event.find({}, { _id: 0, name: 1, type: 1, amount: 1, startDate: 1, endDate: 1, desc: 1, status: 1 })
    .sort({ $natural: 1 })
    .skip(page * perPage)
    .limit(perPage)
    .lean()
    .exec((err, result) => {
        if (err) {console.log(err); res.send('query err!');}
        if (result) { // 전송 할 데이터가 있으면
            res.status(200).send(result);
        } else {
            res.status(401);
        }
    });
});

router.route("/create").all(function(req, res, next){
    next();
})
    .get(function(req, res, next){
        res.render('createEvent', {
            donor: req.donor
        });
    })
    .post(function(req, res, next){
        var date = req.body.startDate;
        var pp = moment(date).format("YYYY-MM-DD hh:mm");

        var event = new Event({
            name: req.body.name,
            type: req.body.type,
            amount: req.body.amount,
            desc: req.body.desc,
            status: req.body.status,
            startDate: pp
        })
        event.save(function(err, result){
            if(err) {console.log(err); res.send('event save err!');}
            //console.log('시간 차이: ', moment.duration(moment().diff(result.startDate)).asHours());
            res.send(result);
        })
    });

// show
router.get('/:id', function(req, res, next){
    console.log("[SHOW GET]evnet id: " + req.params.id);
    Event.findOne({ eventId: req.params.id }, (err, event)=>{
        if(err) {console.log(err); res.send('query err!');}
        res.send(event);
    });
});

// update
router.get('/update/:id', (req, res) => {
    Item.findOne({ id: req.params.itemId }, (err, item) => {
      if(err) return res.json(err);
      res.render('update', { title: "update",  user: req.user, item: item });
    }); 
});

router.post('/:id', (req, res) => {
    Item.updateOne(
    { id: req.params.itemId }, 
    { $set: { name: req.body.name, comment: req.body.comment, detail: req.body.detail } }, 
    (err, item) => {
      if(err) return res.json(err);
      console.log("수정 성공")
      res.redirect('/');
    });
});

// create
router.post('/', function(req, res, next){
    var item = new Item();
    item.name = req.body.name;
    item.comment = req.body.comment;
    item.detail = req.body.detail;
    item.user = req.user.email;

    console.log(item);

    item.save(function (err, item){
        if(err) return console.error(err);
        console.log("등록 성공");
    })
    res.redirect("/items")
})

// delete
router.get('/delete/:id', (req, res) => {
    Item.deleteOne({ id: req.params.itemId }, (err, item) => {
      if(err) return res.json(err);
      console.log("삭제 성공")
      res.redirect('/');
    });
});

//create an apply
router.post('/:id/applies', function(req, res, next){
    var newapply = { body: req.body.apply, author: req.body.user }
    console.log(newapply)
    Item.findOne({ itemId: req.params.id }, function(err, item){
        item.applies.push(newapply);
        item.save();
        console.log("신청 성공");
        res.redirect('/');
    })
});

// admit an apply
router.post('/:id/admit', function(req, res, next){
    var index = req.body.index;
    Item.findOne({ itemId: req.params.id }, function(err, item){
        if(err) return res.json({success:false, message:err});
        item.applies[index].$set({status: "matched"});
        item.save();
        console.log(item.applies[index].status);
        res.redirect('/')
    })
})

module.exports = router;

var express = require('express');
var router = express.Router();
var QRCode = require('qrcode');
var passport = require('passport');

// 테스트용 save쿼리
const queryPromise = require('../query/query_promise');

// session for mongoose passport
var User = require('../model/user');
var Product = require('../model/product');

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


module.exports = function(contract, account){
  /* GET home page. */
  router.get('/', function(req, res, next) {
    //테스트용 코드
    //product 에 등록된 상품이 없으면 미리 만들어 놓는다.
    console.log('product page');
    queryPromise.getProductList().then((result) => {
      console.log(result);
      if(result[0] == undefined){
        var productList1 = new Product({
          name: "사과",
          amount: 100,
          desc: "사과다",
        });
        var productList2 = new Product({
          name: "딸기",
          amount: 300,
          desc: "맛없다",
        });
        var productList3 = new Product({
          name: "초칼렛",
          amount: 1000000,
          desc: "맛있다",
        });
        queryPromise.setProduct(productList1)
        .then((result) =>{
          return queryPromise.setProduct(productList2);
        }).catch((err) => {console.log(err)}).then((result) => {
          return queryPromise.setProduct(productList3);
        }).catch((err) => {console.log(err)}).then((result) => {
          queryPromise.getProductList().then((result) => {
            console.log(result);
            res.send(result);
            // res.render('product', { 
            //   user: req.user,
            //   products: result,
            // });
          });
        })
      } else {
        queryPromise.getProduct().then((result) => {
          console.log(result);
          res.send(result);
        })
      }
    })
    // console.log(req.user.userId);
  });

  router.post('/purchase', function(req, res) {
    const quantity = req.body.quantity;
    const amount = req.body.amount * quantity;

    var temp = [];
    var name = {
      data: req.body.name
    }
    temp.push(name);
    var blank = { data: " "};
    temp.push(blank);
    var quan = {
      data: quantity
    }
    temp.push(quan);

    QRCode.toDataURL(temp, (err, url) => {
      if(err) console.log(err);
      console.log(url);
      const data = url.replace(/.*,/, "");
      const img = new Buffer.alloc(data.length, data, "base64");

      User.findOne({userId: 0}).exec((err, result) => {
        if(err){console.log(err); res.send("유저없음");}
        result.purchaseList.push({
          id: req.body._id,
          amount: amount,
          quantity: quantity,
          qrCode: img,
        });
        queryPromise.setUserData(result).then((result) => {
          console.log(result);
          res.writeHead(200, {
            "Content-Type": "image/png",
            "Content-Length": img.length
          });
          res.end(img);
        })
      })
      // req.user.purchaseList.push({
      //   id: req.body._id,
      //   amount: amount,
      //   quantity: quantity,
      //   qrCode: img,
      // });
      // queryPromise.setUserData(req.user).then((result) => {
      //   console.log(result);
      //   res.writeHead(200, {
      //     "Content-Type": "image/png",
      //     "Content-Length": img.length
      //   });
      //   res.end(img);
      // })
    });

    //이더 통신 필요
  })

  router.get('/:id', function(req, res) {
    queryPromise.getProduct(req.params.Id).then((result) =>{
      console.log(result);
      res.send(result);        
    })
  })

  return router;

}
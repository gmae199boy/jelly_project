var express = require('express');
var router = express.Router();
var passport = require('passport');
var Donor = require('../model/donor');
var Recipient = require('../model/recipient');

passport.use(Donor.createStrategy());
passport.serializeUser(Donor.serializeUser());
passport.deserializeUser(Donor.deserializeUser());
passport.use(Recipient.createStrategy());
passport.serializeUser(Recipient.serializeUser());
passport.deserializeUser(Recipient.deserializeUser());

const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
// const ccpPath = path.resolve(__dirname, '../..', 'network' ,'connection.json');
// const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
// const ccp = JSON.parse(ccpJSON);

async function cc_call(fn_name, args){
    
  const walletPath = path.join(process.cwd(), 'wallet');
  const wallet = new FileSystemWallet(walletPath);

  const userExists = await wallet.exists('user2');
  if (!userExists) {
      console.log('An identity for the user "user2" does not exist in the wallet');
      console.log('Run the registerUser.js application before retrying');
      return;
  }
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: 'user2', discovery: { enabled: false } });
  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('teamate');

  var result;
  
  if(fn_name == 'addUser')
      result = await contract.submitTransaction('addUser', args);
  else if( fn_name == 'addRating')
  {
      e=args[0];
      p=args[1];
      s=args[2];
      result = await contract.submitTransaction('addRating', e, p, s);
  }
  else if(fn_name == 'readRating')
      result = await contract.evaluateTransaction('readRating', args);
  else
      result = 'not supported function'

  return result;
}


module.exports = function(contract, account){

  /* GET home page. */
  router.get('/', function(req, res, next) {
      res.render('signup', {title: "signup"});
  });

  // 회원가입 로직
  router.post('/',  function(req, res, next) {
      console.log(req.body.email);
      console.log(req.body.name);
      console.log(req.body.password);

      switch(req.body.userType){
        case "donor": {
          // DB에 회원등록
          Donor.register(new Donor({name: req.body.name, email: req.body.email}), req.body.password, function(err) {
            if (err) {
              console.log('error while donor register!', err);
              res.send("signup fail");
            }
            console.log('회원가입 성공');
            res.redirect('/');
          });
        }
        break;
        case "recipient": {
          Recipient.register(new Recipient({name: req.body.name, email: req.body.email}), req.body.password, function(err) {
            if (err) {
              console.log('error while recipient register!', err);
              res.send("signup fail");
            }
            console.log('회원가입 성공');
            res.redirect('/');
          });
        }
        break;
        default: {
          console.log("signup user type name error");
          res.send("회원가입 시 지정 유저 타입이 donor, recipient 둘 중 하나가 아닙니다.");
        }
      }

      // 블록체인에 등록
      // result = cc_call('addUser', req.body.email);
  })
  return router;
}
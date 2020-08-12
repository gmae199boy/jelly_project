var express = require('express');
var router = express.Router();
var passport = require('passport');

// session for mongoose passport
var User = require('../model/user');

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// hyperledger fabric
// const { FileSystemWallet, Gateway } = require('fabric-network');
// const fs = require('fs');
// const path = require('path');
// const ccpPath = path.resolve(__dirname, '../..', 'network' ,'connection.json');
// const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
// const ccp = JSON.parse(ccpJSON);

// async function cc_call(fn_name, args){
    
//   const walletPath = path.join(process.cwd(), 'wallet');
//   const wallet = new FileSystemWallet(walletPath);

//   const userExists = await wallet.exists('user2');
//   if (!userExists) {
//       console.log('An identity for the user "user2" does not exist in the wallet');
//       console.log('Run the registerUser.js application before retrying');
//       return;
//   }
//   const gateway = new Gateway();
//   await gateway.connect(ccp, { wallet, identity: 'user2', discovery: { enabled: false } });
//   const network = await gateway.getNetwork('mychannel');
//   const contract = network.getContract('teamate');

//   var result;
  
//   if(fn_name == 'addUser')
//       result = await contract.submitTransaction('addUser', args);
//   else if( fn_name == 'addRating')
//   {
//       e=args[0];
//       p=args[1];
//       s=args[2];
//       result = await contract.submitTransaction('addRating', e, p, s);
//   }
//   else if(fn_name == 'readRating')
//       result = await contract.evaluateTransaction('readRating', args);
//   else
//       result = 'not supported function'

//   return result;
// }


module.exports = function(contract, account){
  /* GET home page. */
  router.get('/', function(req, res, next) {
      res.render('signup', {title: "signup"});
  });

  // 회원가입 로직
  router.post('/',  function(req, res, next) {
      // DB에 회원등록
      User.register(new User({
        name: req.body.name,
        email: req.body.email,
        userType: req.body.userType,
        address: req.body.address,
        // wallet: 10000,  // 테스트용 코드
      }), req.body.password, function(err) {
        if (err) {
          console.log('error while user register!', err);
          res.send("회원가입 쿼리 실패");
        }
        console.log('회원가입 성공');
        res.redirect('/');
      });
  })
  return router;
}
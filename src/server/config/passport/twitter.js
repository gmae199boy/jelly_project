var TwitterStrategy = require('passport-facebook').Strategy;
var config = require('../config');

module.exports = function(app, passport) {
    return new TwitterStrategy({
        clientID: config.facebook.clientID,
        clientSecret: config.facebook.clientSecret,
        callbackURL: config.facebook.callbackURL,
        profileFields: ['emails']
    }, function (accessToken, refreshToken, profile, done) {
        console.log('passport의 facebook 호출됨');
        console.dir(profile);

        //var options = {
        //    criteria: {'facebook.id': profile.id}
        //};

        var database = app.get('db');
        database.UserModel.findOne({'facebook.id':profile.id}, function(err, user) {
            if(err) return done(err);

            if(!user){
                var user = new database.UserModel({
                    email: profile.emails[0].value,
                    provider: 'facebook',
                    authToken: accessToken,
                    facebook: profile._json
                });
                user.save(function(err){
                    if(err){
                        console.log(err);
                        return done(err, user);
                    }
                });
            } else {
                return done(err, user);
            }
        });
    });
}
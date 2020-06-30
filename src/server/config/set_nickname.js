module.exports = function (req, res) {
    var nickname = req.body.nickname;
    var userinfo = req.user;
    var db = req.app.get('db');
    if (userinfo.google) {
        db.UserModel.findOne({ 'google.sub': userinfo.google.sub }, function (err, user) {
            //오류가 발생하면 
            if (err) return done(err);
            if (user) {
                user.nickname = nickname;
                user.save(function (err, user) {
                    if (err) throw err;
                    console.log('세이브 성공!!!!!!!!!!!');

                    req.session.passport.user = user;
                    res.redirect('/');
                });
            } else {
                console.log('닉네임 설정 오류');
            }
        });
    } else if (userinfo.facebook) {
        db.UserModel.findOne({ 'facebook.id': userinfo.facebook.id }, function (err, user) {
            //오류가 발생하면 
            if (err) return done(err);
            if (user) {
                user.nickname = nickname;
                user.save(function (err, user) {
                    if (err) throw err;
                    console.log('세이브 성공!!!!!!!!!!!');

                    req.session.passport.user.nickname = nickname;
                    res.redirect('/');
                });
            } else {
                console.log('닉네임 설정 오류');
            }
        });
    } else 
    {
        console.log('구글, 페이스북이 아닌 아이디거나 치명적인 오류');
    }
}
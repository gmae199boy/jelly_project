var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");
var fs = require('fs');
const sharp = require('sharp');

var upload_images = function (req, res) {
    var user = req.user;
    var title = req.body.title;
    var content = req.body.content;
    if (!user) {
        res.redirect('/');
        return;
    }
    if (!title || !content || !req.file) {
        res.redirect('/');
        return;
    }
    if (!user.nickname) {
        res.redirect('/');
        return;
    } else {
        var db = req.app.get('db');
        db.DrawingBoardModel.findOne({ title: title }, function (err, result) {
            if (err) throw err;
            if (!result) {
                var filename = moment().format("HHmmss").toString() + req.file.filename;
                sharp(req.file.path)
                    .resize(512)
                    .toFile("images/"+ filename)
                    .then(data => {fs.unlink(req.file.path, err=>{
                        if(err) throw err;

                        var drawing_board = new db.DrawingBoardModel({
                            email: user.email
                            , nickname: user.nickname
                            , title: title
                            , content: content
                            , image_name: filename
                            , image_path: "https://drawing.nopublisher.dev/images/" + filename
                            , level: user.level
                            //category
                        });
        
                        //게시물 db에 저장
                        drawing_board.save(function (err, result) {
                            if (err) throw err;
        
                            //유저 아이디에 게시물 id db 세션에 저장
                            db.UserModel.findOne({ email: user.email }, function (err, user) {
                                if (err) throw err;
                                if (!user.latest_drawing_m && !user.latest_drawing_d) {
                                    user.latest_drawing_d = parseInt(moment().format("DD"));
                                    user.latest_drawing_m = parseInt(moment().format("MM"));
                                    ++user.drawing_continue;
                                    user.exp += user.drawing_continue;
                                } else {
                                    var paDate = user.latest_drawing_d;
                                    var curDate = parseInt(moment().format("DD"));
                                    var paMonth = user.latest_drawing_m;
                                    var curMonth = parseInt(moment().format("MM"));
                                    var curYear = parseInt(moment().format("YYYY"));
        
                                    if (paDate != curDate) {
                                        switch (paMonth) {
                                            //31일 일때 
                                            case 1, 3, 5, 7, 8, 10, 12: {
                                                if (paDate != 31 && curMonth == paMonth) {
                                                    if ((curDate - paDate) == 1 || (curDate - paDate) == -1130) {
                                                        if (user.drawing_continue < 50) {
                                                            ++user.drawing_continue;
                                                            user.exp += user.drawing_continue;
                                                        } else {
                                                            user.exp += user.drawing_continue;
                                                        }
                                                    } else {
                                                        user.drawing_continue = 1;
                                                        user.exp += user.drawing_continue;
                                                    }
                                                } else if (paDate == 31 && ((curMonth - paMonth) == 1 || (paMonth - curMonth) == 11)) {
                                                    if (user.drawing_continue < 50) {
                                                        ++user.drawing_continue;
                                                        user.exp += user.drawing_continue;
                                                    } else {
                                                        user.exp += user.drawing_continue;
                                                    }
                                                } else {
                                                    user.drawing_continue = 1;
                                                    ++user.exp;
                                                }
                                                user.latest_drawing_m = curMonth;
                                                user.latest_drawing_d = curDate;
                                            }
                                            break;
                                            //30일 일때
                                            case 4, 6, 9, 11: {
                                                if (paDate != 30 && curMonth == paMonth) {
                                                    if ((curDate - paDate) == 1 || (curDate - paDate) == -1130) {
                                                        if (user.drawing_continue < 50) {
                                                            ++user.drawing_continue;
                                                            user.exp += user.drawing_continue;
                                                        } else {
                                                            user.exp += user.drawing_continue;
                                                        }
                                                    } else {
                                                        user.drawing_continue = 1;
                                                        user.exp += user.drawing_continue;
                                                    }
                                                } else if (paDate == 30 && (curMonth - paMonth) == 1) {
                                                    if (user.drawing_continue < 50) {
                                                        ++user.drawing_continue;
                                                        user.exp += user.drawing_continue;
                                                    } else {
                                                        user.exp += user.drawing_continue;
                                                    }
                                                } else {
                                                    user.drawing_continue = 1;
                                                    ++user.exp;
                                                }
                                                user.latest_drawing_m = curMonth;
                                                user.latest_drawing_d = curDate;
                                            }
                                            break;
                                            //윤년 계산
                                            case 2: {
                                                if((curYear % 4) == 0){
                                                    if (paDate != 29 && curMonth == paMonth) {
                                                        if ((curDate - paDate) == 1 || (curDate - paDate) == -1130) {
                                                            if (user.drawing_continue < 50) {
                                                                ++user.drawing_continue;
                                                                user.exp += user.drawing_continue;
                                                            } else {
                                                                user.exp += user.drawing_continue;
                                                            }
                                                        } else {
                                                            user.drawing_continue = 1;
                                                            user.exp += user.drawing_continue;
                                                        }
                                                    } else if (paDate == 29 && (curMonth - paMonth) == 1) {
                                                        if (user.drawing_continue < 50) {
                                                            ++user.drawing_continue;
                                                            user.exp += user.drawing_continue;
                                                        } else {
                                                            user.exp += user.drawing_continue;
                                                        }
                                                    } else {
                                                        user.drawing_continue = 1;
                                                        ++user.exp;
                                                    }
                                                } else {
                                                    if (paDate != 28 && curMonth == paMonth) {
                                                        if ((curDate - paDate) == 1 || (curDate - paDate) == -1130) {
                                                            if (user.drawing_continue < 50) {
                                                                ++user.drawing_continue;
                                                                user.exp += user.drawing_continue;
                                                            } else {
                                                                user.exp += user.drawing_continue;
                                                            }
                                                        } else {
                                                            user.drawing_continue = 1;
                                                            user.exp += user.drawing_continue;
                                                        }
                                                    } else if (paDate == 28 && (curMonth - paMonth) == 1) {
                                                        if (user.drawing_continue < 50) {
                                                            ++user.drawing_continue;
                                                            user.exp += user.drawing_continue;
                                                        } else {
                                                            user.exp += user.drawing_continue;
                                                        }
                                                    } else {
                                                        user.drawing_continue = 1;
                                                        ++user.exp;
                                                    }
                                                }
                                                user.latest_drawing_m = curMonth;
                                                user.latest_drawing_d = curDate;
                                            }
                                                break;
                                        }
                                    }
                                }
                                user.board_arr.push({ board_id: result._id });
                                user.save(function (err, user) {
                                    if (err) throw err;
                                    req.session.passport.user = user;
                                    res.redirect('/');
                                    return;
                                });
                            });
                        });
                    })})
                    .catch(err => {console.log(err);});
            } else {
                //게시물의 제목이 이미 존재합니다!!! 구현
            }
        });
    }
};


module.exports.upload_images = upload_images;
const multer = require('multer');
const fs = require('fs');
var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

var route_loader = {};

route_loader.init = function (app, router, config) {
    return initRoutes(app, router, config);
};

function initRoutes(app, router, config) {
    var infoLen = config.route_info.length;
    console.log('설정에 정의된 라우팅 모듈의 수 : %d', infoLen);

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
        },
        filename: function (req, file, cb) {
            file.uploadedFile = {
                name: file.originalname.split('.')[0],
                ext: file.mimetype.split('/')[1]
            };
            cb(null, file.uploadedFile.name + moment().format("YYYYMMDDHHmmss") + '.' + file.uploadedFile.ext);
        }
    });
    var uploads = multer({ storage: storage });

    for (var i = 0; i < infoLen; i++) {
        var curItem = config.route_info[i];

        // 모듈 파일에서 모듈 불러옴
        var curModule = require(curItem.file);
        console.log('%s 파일에서 모듈정보를 읽어옴.', curItem.file);

        //  라우팅 처리
        if (curItem.type == 'get') {
            router.route(curItem.path).get(curModule[curItem.method]);
        } else if (curItem.type == 'post') {
            router.route(curItem.path).post(curModule[curItem.method]);
        } else if (curItem.type == 'image') {
            router.route(curItem.path).post(uploads.single('image_name'), curModule[curItem.method]);
        }


        console.log('라우팅 모듈 [%s]이(가) 설정됨.', curItem.method);
    }

    // 라우터 객체 등록
    app.use('/', router);
};



module.exports = route_loader;
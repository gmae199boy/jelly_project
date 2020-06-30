var mongoose = require('mongoose');

//database 객체에 db, schema, model 모두 추가
var db = {};
db.init = function(app, config){
    console.log('db.init() 호출됨');

    connect(app, config);
};

//데이터베이스에 연결하고 응답 객체의 속성으로 db 객체 추가
function connect(app, config){
    console.log('db.connect() 호출됨');
    var databaseUrl = config.db_url;

    //데이터베이스 연결
    console.log('데이터베이스에 연결을 시도합니다.');
    mongoose.Promise = global.Promise;
    mongoose.connect(databaseUrl, {useUnifiedTopology : true, useNewUrlParser : true});
    mongoose.set('useCreateIndex', true);
    db.db = mongoose.connection;
  
    db.db.on('error', console.error.bind(console, 'mongoose connection error.'));
    db.db.on('open', function(){
      console.log('데이터베이스에 연결되었습니다. : ' + databaseUrl);
      createSchema(app, config);
    });
  
    //연결 끊어졌을 떄 5초후 재연결
    db.db.on('disconnected', function(){
      console.log('연결이 끊어졌습니다. 0초 후 다시 연결합니다.');
      setInterval(connect, 0);
    });
}

//config에 정의한 스키마 및 모델 객체 생성
function createSchema(app, config){
    var schemaLen = config.db_schemas.length;
    console.log('설정에 정의된 스키마 수: %s', schemaLen);

    for(var i = 0; i < schemaLen; ++i){
        var curItem = config.db_schemas[i];

        //모듈파일에서 모듈 불러온 후 createSchema() 함수 호출하기
        var curSchema = require(curItem.file).createSchema(mongoose);
        console.log('%s 모듈을 불러들인 후 스키마 정의함.' , curItem.file);

        //User 모델 정의
        var curModel = mongoose.model(curItem.collection, curSchema);
        console.log('%s 컬렉션을 위해 모델 정의함.', curItem.collection);

        //database 객체에 속성으로 추가
        db[curItem.schemaName] = curSchema;
        db[curItem.modelName] = curModel;
    }

    app.set('db', db);
}

module.exports = db;
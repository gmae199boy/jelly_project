//{file: './user', path: '/user/login', method: 'login', type: 'post'},
//{file: './user', path: '/user/login', method: 'login_page', type: 'get'},
module.exports = {
    server_port: 3000,
    db_url: 'mongodb://localhost:27017/drawing_blog',
    db_schemas:[
          {file: './user_schema', collection: 'users', schemaName: 'UserSchema', modelName: 'UserModel'}
        , {file: './drawing_schema', collection: 'drawing_board', schemaName: 'DrawingBoardSchema', modelName: 'DrawingBoardModel'}
    ],
    route_info: [
          {file: './upload_images', path: '/upload_images', method: 'upload_images', type: 'image'}
        , {file: './drawing_board', path: '/drawing_board', method: 'drawing_board', type: 'get'}
        , {file: './return_board',  path: '/return_board',  method: 'return_board',  type: 'get'}
    ],
    facebook: {
        clientID: '1577984075671850',
        clientSecret: 'bfec1ceefc1c8de1c9e3f13678679a5c',
        callbackURL: '/auth/facebook/callback'
    },
    google: {
        clientID: '952840265315-us8dhabpk2ddjp68fjiis81m3rnto2ug.apps.googleusercontent.com',
        clientSecret: 'OenOqM3crlftfWs3nF73hCKD',
        callbackURL: '/auth/google/callback'
    }
}
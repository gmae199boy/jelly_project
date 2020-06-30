module.exports.return_board = function(req, res){
    var db = req.app.get('db');
    db.DrawingBoardModel.find({}, function(err, result){
        if(err) throw err;
        if(result){
            res.status(200).send(result);
        }
    });
};
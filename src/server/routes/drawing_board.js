module.exports.drawing_board = function(req, res){
    var title = req.query.drawing_title;
    var db = req.app.get('db');
    var image_path = "/images/";
    db.DrawingBoardModel.findOne({title: title}, function(err, result){
        if(err) throw err;
        image_path = image_path + result.image_name;
        res.render("drawing_board", {title: title, path: image_path});
        //res.send(result);
    });
};
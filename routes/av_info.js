module.exports = function (app) {
	var db = require('./db');

	app.get('/api/av_info/:id?', function(req, res) {
        var options = app.processOptions(req,
            ['from', 'to', 'last'],
            ['id']);
        db.getAvInfoFromTo(app.db, from, to, function(err, result) {
            app.error(err, res, result);
        });
    });
};
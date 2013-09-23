module.exports = function (app) {
	var db = require('./db');

	app.get('/api/av_info/:id?', function(req, res) {
        var options = app.processOptions(req,
            ['from', 'to', 'last'],
            ['id']);
	db.getAvInfoFromTo(app.db, options.from, options.to, function(err, result) {
            app.error(err, res, result);
        });
    });
};

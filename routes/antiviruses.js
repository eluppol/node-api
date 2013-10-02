module.exports = function(app) {
    var db = require('./db');

    app.get('/api/antiviruses/:id?', function(req, res) {
        var options = app.processOptions(req,
            ['full_name', 'core_version', 'update_version', 'active', 'short_name'],
            ['id']);
        db.getAntiviruses(app.db, options, function(err, result) {
            app.error(err, res, result);
        });
    });
};

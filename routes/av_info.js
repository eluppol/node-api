module.exports = function (app) {
  var db = require('./db');

  app.get('/api/av_info/?', function(req, res) {
    var from = req.query['from'];
    var to = req.query['to'];
    if (!from || !to) {
      app.error(true, res);
    } else {
      var options = app.processOptions(req,
        ['av_id', 'file_id', 'scan_time'],
        []);
      db.getAvInfoFromTo(app.db, options, from, to, function(err, result) {
        app.error(err, res, result);
      });
    }
  });
};

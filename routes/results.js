module.exports = function(app) {
  var db = require('./db');

  app.post('/api/results', function (req, res) {
    if (req.body.file_id && req.body.av_id &&
      req.body.result && req.body.scan_time) {
        db.addResult(app.db, req.body.file_id, req.body.av_id,
          req.body.result, req.body.scan_time, function(err, result) {
            app.error(err, res, result);
          });
      } else {
        res.send(400, {status: 400, message: 'Not valid parameters.'});
      }
  });

  app.get('/api/results/:id?', function (req, res) {
    console.log('ip: ' + req.ip);
    var options = app.processOptions(req,
      ['av_id', 'file_id', 'scan_time', 'from', 'to'],
      ['id']);
    db.getResults(app.db, options, function (err, result) {
      app.error(err, res, result);
    });
  });
};

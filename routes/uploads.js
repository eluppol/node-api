module.exports = function(app) {
    var crypto = require('crypto'),
        fs = require('fs'),
        dgram = require('dgram'),
        db = require('./db');

    app.post('/api/uploads', function(req, res) {
        var processUpload = function(path, name, user_id, file_id) {
            db.addUpload(app.db, name, user_id, file_id, function (err, result) {
                if (err) {
                    res.send(500, {status: 500, message: 'Internal server error.'});
                }
                var message = new Buffer(JSON.stringify({path: path.slice(4), file_id: file_id}));
                // Get list of known IP from DB
                db.getHosts(app.db, function(err, result) {
                    if (err) {
                        res.send(500, {status: 500, message: 'Internal server error.'});
                    }
                    if (result.rows.length == 0) {
                        res.send(400, {status: 400, message: 'Empty query response.'})
                    }
                    for (var i = 0; i < result.rows.length; i++) {
                        var socket = dgram.createSocket('udp4');
                        socket.send(message, 0, message.length, 10000, result.rows[i]['ip'],
                            function(err, res) {
                                if (err) {
                                    res.send(500, {status: 500, message: 'Internal server error.'});
                                }
                        });
                    }
                });
                res.send(200, {status: 200, message: 'Success.', result: result.rows[0]});
            });
        }

        if (! req.files || ! req.files.upload) {
            res.send(400, {status: 400, message: 'Error uploading file. Try again later.'});
        } else {
            var shasum = crypto.createHash('sha256'),
                upload = req.files.upload,
                stream = fs.ReadStream(upload.path);

            stream.on('data', function(data) {
                shasum.update(data);
            });

            stream.on('end', function() {
                var hash = shasum.digest('hex');
                db.checkHash(app.db, hash, function(err, result) {
                    if (err) {
                        res.send(500, {status: 500, message: 'Internal server error.'});
                    }
                    if (result.rows.length == 0) {
                        db.addFile(app.db, hash, upload.type, upload.size, function(err, result) {
                            if (err) {
                                res.send(500, {status: 500, message: 'Internal server error.'});
                            }
                            processUpload(upload.path, upload.name, 0, result.rows[0].id);
                        });
                    } else {
                        processUpload(upload.path, upload.name, 0, result.rows[0].id);
                    }
               });
            });
        }});

    app.get('/api/uploads/:id?', function(req, res) {
        var options = app.processOptions(req,
            ['name', 'user_id', 'file_id', 'time'],
            ['id']);
        db.getUploads(app.db, options, function(err, result) {
            if (err) {
                res.send(500, {status: 500, message: 'Internal server error.'});
            }
            if (result.rows.length == 0) {
                res.send(400, {status: 400, message: 'Empty query response.'})
            } else {
                res.send(200, {status: 200, message: 'Success.', result: result.rows});
            }
        });
    });
}


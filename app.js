var express = require('express'),
    http = require('http'),
    pg = require('pg').native;

var app = express();
app.disable('x-powered-by');
app.db = new pg.Client({
    user: 'worker',
    password: 'ditinua',
    database: 'avmultiscan',
    host: '127.0.0.1',
    port: 5432
});
app.db.connect(function(err) {
    if (err) {
        console.error(err);
    }
});
// params - options to process from request query
// filters - options that could be in fileds=... query
app.processOptions  = function(req, params, filters) {
    var options = {};
    filters = filters.concat(params);
    params = params.concat(['fields', 'offset', 'limit']);
    // Collect parameters from request query to options
    for (var param in req.query) {
        if (params.indexOf(param) != -1) {
            options[param] = req.query[param];
        }
    }
    // Process numeric parameters
    if (req.params.id) {
        options.id = req.params.id[0];
    }
    // If we have fields filtering parameter
    if (options.fields) {
        // Store field parameter string
        var fields = options.fields;
        // Here we will store fields to return
        options.fields = [];
        // For every filter in filters
        for (var i = 0; i < filters.length; i++) {
            // If we have such filter in fileds parameter string
            if (fields.indexOf(filters[i]) != -1) {
                // Add such parameter into options fields
                options.fields[options.fields.length] = filters[i];
            }
        }
    }
    options.offset = options.offset ? parseInt(options.offset) : 0;
    options.limit = options.limit ? parseInt(options.limit) : 10;
    return options;
}
//noinspection JSValidateTypes
app.param(function(name, fn){
    if (fn instanceof RegExp) {
        return function(req, res, next, val){
            var captures;
            if (captures = fn.exec(String(val))) {
                req.params[name] = captures;
                next();
            } else {
                next('route');
            }
        }
    }
});
app.param('id', /^\d+$/);
app.use(express.compress());
app.use(express.bodyParser());

require('./routes')(app);
http.createServer(app).listen(3002);

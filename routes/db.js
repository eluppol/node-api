exports.checkHash = function(db, hash, next) {
    query(db, {text: "select id from files where hash=$1", values: [hash]}, next);
}

exports.addFile = function(db, hash, type, size, next) {
    query(db, {text: "insert into files (hash, type, size, infected) values ($1, $2, $3, $4) returning *",
        values: [hash, type, size, 0]}, next);
}

exports.addUpload = function(db, name, user_id, file_id, next) {
    query(db, {text: "insert into uploads (name, user_id, file_id) values ($1, $2, $3) returning *",
        values: [name, user_id, file_id]}, next);
}

exports.addResult = function(db, file_id, av_id, result, scan_time, next) {
    query(db, {text: "insert into results (file_id, av_id, result, scan_time) values ($1, $2, $3, $4) returning *",
        values: [file_id, av_id, result, scan_time]}, next);
}

exports.getHosts = function(db, next) {
    query(db, {text: "select ip from hosts", values: []}, next);
}

exports.getUploads = function(db, options, next) {
    getSomething(db, 'uploads', options, next);
}

exports.getFiles = function(db, options, next) {
    getSomething(db, 'files', options, next);
}

exports.getAntiviruses = function(db, options, next) {
    getSomething(db, 'antiviruses', options, next);
}

exports.getResults = function(db, options, next) {
    getSomething(db, 'results', options, next);
}

exports.getAvInfoFromTo = function(db, from, to, next) {
    text = "select av_id, result from results where time >= \'"
        + from + "\' and time <= \'" + to + "\';";
    query(db, text, next);
}

function getSomething(db, something, options, next) {
    var text,
        values = [],
        index = 1,
        offset = options.offset,
        limit = options.limit;
    delete options.offset;
    delete options.limit;
    // If we want returning values
    if (options.fields) {
        text = "select " + options.fields + " from " + something;
        delete options.fields;
    } else {
        text = "select * from " + something;
    }
    if (options === {}) {
        query(db, {text: text, values: values}, next);
    }
    // Parse offset & limit (or only index)
    if (options.id) {
        text += " where id = $1";
        values[0] = options.id;

        index = 2;
        delete options.id;
    } else {
        text += " where true";
    }
    for (var option in options) {
        text += " and " + option + "=$" + index;
        values[index - 1] = options[option];
        index += 1;
    }
    text += " offset $" + index;
    values[index - 1] = offset;
    index += 1;
    text += " limit $" + index;
    values[index - 1] = limit;

    query(db, {text: text, values: values}, next);
}

function query(db, query, next) {
    console.log(query);
    db.query(query, function(err, res) {
        if (err) {
            console.error(err);
            next(err);
        }
        next(undefined, res);
    });
}

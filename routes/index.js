module.exports = function(app) {
    require('./uploads')(app);
    require('./results')(app);
    require('./files')(app);
    require('./antiviruses')(app);
}

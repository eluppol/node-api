exports.parseDate = function(datestring) {
    var tmp = JSON.parse("{" + datestring.replace(/(\d+)([a-z]+)/gi, ', \"$2\" : $1').slice(1) + " }");
    var fields = ['y', 'm', 'd', 'h', 'min', 's'];
    var offset = {};
    for (field in fields) {
        offset[field] = tmp[field] ? tmp[field] : 0;
    }
    return offset;
}

exports.applyDateOffset = function(oldDate, offset) {
    var date = new Date(oldDate.getTime() - (offset.s + 60 * (offset.min + 60 * (offset.h + 24 * offset.d))));
    var monthOffset = offset.m % 12;
    var newMonth;
    if (monthOffset > date.getMonth()) {
        newMonth = 12 - monthOffset + date.getMonth();
        offset.y = offset.y + 1;
    }
    date.setMonth(newMonth);
    date.setFullYear(date.getFullYear() - offset.y);
    return date;
}
exports.parseDate = function(datestring) {
    var tmp = JSON.parse("{" + datestring.replace(/(\d+)([a-z]+)/gi, ', \"$2\" : $1').slice(1) + " }");
    var fields = ['y', 'm', 'd', 'h', 'min', 's'];
    var offset = {};
    for (var i = 0; i < fields.length; i++) {
        offset[fields[i]] = tmp[fields[i]] ? tmp[fields[i]] : 0;
    }
    return offset;
}

exports.applyDateOffset = function(oldDate, offset) {
    var date = new Date(oldDate.getTime() - (offset.s + 60 * (offset.min + 60 * (offset.h + 24 * offset.d)) * 1000));
    var monthOffset = offset.m % 12;
    offset.y = offset.y + offset.m / 12 | 0;
    var newMonth;
    if (monthOffset > date.getMonth()) {
        newMonth = 12 - monthOffset + date.getMonth();
        offset.y = offset.y + 1;
    } else {
	newMonth = date.getMonth() - monthOffset;
    }
    date.setMonth(newMonth);
    date.setFullYear(date.getFullYear() - offset.y);
    return date;
}

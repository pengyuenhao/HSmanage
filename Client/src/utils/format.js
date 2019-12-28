function dateFtt(fmt, date) {
    var o = {
      "M+": date.getMonth() + 1, //月份
      "d+": date.getDate(), //日
      "h+": date.getHours(), //小时
      "m+": date.getMinutes(), //分
      "s+": date.getSeconds(), //秒
      "q+": Math.floor((date.getMonth() + 3) / 3), //季度
      S: date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        (date.getFullYear() + "").substr(4 - RegExp.$1.length)
      );
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt))
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length == 1
            ? o[k]
            : ("00" + o[k]).substr(("" + o[k]).length)
        );
    return fmt;
}
function formatDateTime(time, format) {
    if (format == null) format = "yyyy-MM-dd HH:mm:ss";
    var t = new Date(time);
    var tf = function (i) { return (i < 10 ? '0' : '') + i };
    return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function (a) {
        switch (a) {
            case 'yyyy':
                return tf(t.getFullYear());
                break;
            case 'MM':
                return tf(t.getMonth() + 1);
                break;
            case 'mm':
                return tf(t.getMinutes());
                break;
            case 'dd':
                return tf(t.getDate());
                break;
            case 'HH':
                return tf(t.getHours());
                break;
            case 'ss':
                return tf(t.getSeconds());
                break;
        }
    })
}
function formatTime(time, unit) {
    if (unit == null) unit = "ss";
    let ss = Math.floor(time / 1000);
    let mm = Math.floor(ss / 60);
    let HH = Math.floor(mm / 60);
    let dd = Math.floor(HH / 24);
    let MM = Math.floor(dd / 30);
    let yyyy = Math.floor(MM / 12);
    var tf = function (i) { return (i < 10 ? '0' : '') + i };
    switch (unit) {
        case "ss":
            return ss;
        case "mm":
            return mm;
        case "HH":
            return HH;
        case "HHmm":
            return HH +"小时"+ tf(mm % 60)+"分钟";
        case "dd":
            return dd;
        case "MM":
            return MM;
        case "yyyy":
            return yyyy;
    }


}
module.exports = {
    formatDateTime: formatDateTime,
    formatTime: formatTime,
    dateFtt:dateFtt
}
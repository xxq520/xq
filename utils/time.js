let now = new Date();
let year = now.getFullYear();
let month = now.getMonth();//真实的月份需要再加上1
let day = now.getDate();
let currentTime = new Date();

function dealChatTime(currentItemTimeStamp, frontItemTimeStamp) {
    let ifShowTime = timeDivide(currentItemTimeStamp, frontItemTimeStamp);
    return justSimpleDealTime(currentItemTimeStamp, ifShowTime);
}

function timeDivide(currentItemTimeStamp, frontItemTimeStamp) {
    // console.log('时间戳显示时间', currentItemTimeStamp, frontItemTimeStamp);
    return Math.abs(currentItemTimeStamp - frontItemTimeStamp) / 1000 > 300
}

function justSimpleDealTime(currentItemTimeStamp, ifShowTime) {
    currentTime.setTime(currentItemTimeStamp);
    let hoursAndMinutes = currentTime.getHours() + ':' + (currentTime.getMinutes() >= 10 ? currentTime.getMinutes() : ('0' + currentTime.getMinutes()));
    let currentTimeDay = currentTime.getDate();
    if (currentTime.getFullYear() === year && currentTime.getMonth() === month) {
        if (currentTimeDay === day) {//当天显示时分
            return {//5分钟内发送多条消息时不重复显示时间标签,大于5分钟显示时间标签
                ifShowTime: ifShowTime,
                timeStr: hoursAndMinutes
            };
        } else if (currentTimeDay === day - 1) {//昨天：昨天+时分（24小时制）
            return {ifShowTime: ifShowTime, timeStr: '昨天 ' + hoursAndMinutes}
        }
    }
    return {
        ifShowTime: ifShowTime,
        timeStr: currentTime.getFullYear() + '年' + (currentTime.getMonth() + 1) + '月' + currentTimeDay + '日 ' + hoursAndMinutes
    };
}
//格式化时间戳时间转换为年月日形式
function timeStamp(date){
    if(date){
        date=new Date(date)
        var strDate = fromDate(date);
        return strDate;
    }else{
        date=new Date()
        var strDate = fromDate(date);
        return strDate;
    }
}
//格式化时间 返回结果  2019-12-12 14:11:35
function  fromDate(date) {
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    var D = (date.getDate() < 10 ? '0'+date.getDate() : date.getDate()) + ' ';
    var h = (date.getHours() < 10 ? '0'+date.getHours() : date.getHours()) + ':';
    var m = (date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes()) + ':';
    var s = (date.getSeconds() < 10 ? '0'+date.getSeconds() : date.getSeconds());
    return  Y+M+D+h+m+s;
}
function getNowDate(date){

}

module.exports = {
    dealChatTime,
    timeStamp
};
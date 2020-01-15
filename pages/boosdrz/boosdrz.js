const notification = require('../../utils/notification.js');
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
// const Quantity = require('../../component/quantity/index');
const constant = require("../../utils/constant.js");
const util = require('../../utils/util.js');
const qcreateTime = require("../../utils/time.js");
var app = getApp();
Page({
    data: {
        imghost: constant.imghost,
        arr: [],
        qsum: 0
    },
    onLoad: function (option) {
        //请求商户的商品被用户购买的数据
        var that = this;
        var shop = wx.getStorageSync('shop').id
        http.request({
            url: '/getQorder',
            data: {
                qshopid: shop,
                otherterm: `and (qstatus = 3 )`
            },
            success: function (e) {
                var sum = 0
                var arr = [];
                //转换时间函数封装
                function formatSeconds(value) {
                    var theTime = parseInt(value);// 需要转换的时间秒
                    var theTime1 = 0;// 分
                    var theTime2 = 0;// 小时
                    var theTime3 = 0;// 天
                    if (theTime > 60) {
                        theTime1 = parseInt(theTime / 60);
                        theTime = parseInt(theTime % 60);
                        if (theTime1 > 60) {
                            theTime2 = parseInt(theTime1 / 60);
                            theTime1 = parseInt(theTime1 % 60);
                            if (theTime2 > 24) {
                                //大于24小时
                                theTime3 = parseInt(theTime2 / 24);
                                theTime2 = parseInt(theTime2 % 24);
                            }
                        }
                    }
                    var result = '';
                    if (theTime2 > 0) {
                        result = "" + parseInt(theTime2) + '小时' + result;
                    }
                    if (theTime3 > 0) {
                        result = "" + parseInt(theTime3) + "天" + result;
                    }
                    return result;
                }
                for (var i = 0; i < e.length; i++) {
                    var price = 0;
                    var newarr = false;
                    if (e[i].length == 1) {
                        e[i][0].guige = e[i][0].qprocedureName.split('【')[1].split('】')[0]
                        var dateTime = e[i][0].qfhtime;
                        // +86400 * 7 * 1000
                        var time = dateTime;
                        e[i][0].endTime = (time + 604800000) - Date.now();
                        e[i][0].strTime = ((e[i][0].endTime / 86400000).toFixed(2) * 24).toString();
                        e[i][0].endTime = formatSeconds(e[i][0].endTime / 1000)
                        // 截取商品的名称   不包含规格
                        e[i][0].qprocedureName = e[i][0].qprocedureName.split('【')[0]
                        e[i][0].qfhtime = qcreateTime.timeStamp(e[i][0].qfhtime);
                        if (Number(e[i][0].strTime) > 0) {
                            newarr = true
                        }
                        e[i][0].hj = e[i][0].qsum || 0
                    } else {
                        for (var j = 0; j < e[i].length; j++) {
                            e[i][j].guige = e[i][j].qprocedureName.split('【')[1].split('】')[0]
                            var dateTime = e[i][j].qfhtime;
                            price += e[i][j].qsum
                            var time = dateTime;
                            e[i][j].endTime = (time + 604800000) - Date.now();
                            e[i][j].strTime = ((e[i][j].endTime / 86400000).toFixed(2) * 24).toString();
                            e[i][j].endTime = formatSeconds(e[i][j].endTime / 1000)
                            // 截取商品的名称   不包含规格
                            e[i][j].qprocedureName = e[i][j].qprocedureName.split('【')[0]
                            e[i][j].qfhtime = qcreateTime.timeStamp(e[i][j].qfhtime);
                            if (Number(e[i][j].strTime) > 0) {
                                newarr = true
                            }
                        }
                        e[i][0].hj = price - e[i][0].reducityMoney || 0
                    }
                    if (newarr) {
                        arr.push(e[i])
                    }
                }
                for (var i = 0; i < arr.length; i++) {
                    sum += arr[i][0].hj;
                }
                that.setData({
                    arr: arr,
                    qsum: sum.toFixed(2)
                })
                //存储状态为待入账的商品的数据
            }
        })
    }
});
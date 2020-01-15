const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
const timeStamp = require("../../utils/time.js");
var app = getApp();

Page({
    data: {
        host: constant.host + '/img/',
        selectedNav: '00',
        width: app.systemInfo.windowWidth,
        luntan: 1,
        zj: []
    },
    onLoad: function (e) {
        var that = this
        this.setData({
            userTrue: e.shopid ? true : false
        })
        if (e.shopid != undefined) {
            http.request({
                url: '/findQhongbaoByQid',
                data: {
                    qid: e.shopid,
                    // otherterm1: ' AND qtype IN(5,6,10)',
                    orderstr: `and qtime>date${util.time}`,
                },
                success: function (Qhongbao) {
                    var data = Qhongbao
                    for (var i = 0; i < data.length; i++) {
                        data[i].endTime = Date.now() - data[i].qtime;
                        data[i].qtime = timeStamp.timeStamp(data[i].qtime)
                        //截取商品的名称   不包含规格
                    }
                    //按时间排序订单的记录
                    for (var i = 0; i < data.length; i++) {
                        for (var j = 0; j < data.length - 1 - i; j++) {
                            if (data[j].endTime > data[j + 1].endTime) {
                                var temp = data[j];
                                data[j] = data[j + 1]
                                data[j + 1] = temp
                            }
                        }
                    }
                    that.setData({
                        shopzj: data
                    })
                }
            })
            http.request({
                url: '/getQhongbao',
                data: {
                    qid: wx.getStorageSync('shop').id,
                    otherterm1: ' AND qtype IN(1,2,8) AND qstatus IN(1,2,3)',
                    orderstr: 'order by qtime desc'
                },
                success: function (e) {
                    http.request({
                        url: '/getQinformation',
                        data: {
                            storeId: wx.getStorageSync('shop').id,
                            orderstr: 'and a.state in (1,2,3,4)'
                        },
                        success(data) {
                            //刷选信息红包
                            data = data.filter(function (item, index) {
                                return item.hbMoney
                            })
                            var arr = e.concat(data)
                            for (var i = 0; i < arr.length; i++) {
                                arr[i].endTime = Date.now() - (arr[i].qtime || arr[i].time);
                                if (arr[i].qtime) {
                                    arr[i].qtime = timeStamp.timeStamp(arr[i].qtime)
                                } else {
                                    arr[i].qtime = timeStamp.timeStamp(arr[i].time)
                                }
                            }
                            for (var i = 0; i < arr.length; i++) {
                                for (var j = 0; j < arr.length - 1 - i; j++) {
                                    if (arr[j].endTime > arr[j + 1].endTime) {
                                        var temp = arr[j];
                                        arr[j] = arr[j + 1]
                                        arr[j + 1] = temp
                                    }
                                }
                            }
                            that.setData({
                                shoptx: arr
                            })
                        }
                    })
                }
            }, true)
        } else {
            http.request({
                url: '/getQhbdetails',
                data: {
                    otherterm: 'AND qtype IN(1,2)',
                    userId: wx.getStorageSync('user').id,
                    orderstr: 'order by time desc'
                },
                success: function (e) {
                    e.forEach(function (item, index) {
                        item.qtime = timeStamp.timeStamp(item.time)
                    })
                    that.setData({
                        zj: e
                    })
                }
            })
            http.request({
                url: '/getQhongbao',
                data: {
                    qid: wx.getStorageSync('user').id,
                    qtype: 4,
                    orderstr: 'order by qtime desc'
                },
                success: function (e) {
                    e.forEach(function (item, index) {
                        item.qtime = timeStamp.timeStamp(item.qtime)
                    })
                    that.setData({
                        usertx: e
                    })
                }
            })
        }
    },
    onShow: function () {
        var that = this
        that.setData({
            user: wx.getStorageSync('user'),
            shop: wx.getStorageSync('shop')
        })
    },
    luntan: function (e) {
        this.setData({
            luntan: e.currentTarget.dataset.luntan,
        })
    }
})
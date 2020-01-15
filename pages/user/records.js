// pages/user/records.js
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
const fromDate = require("../../utils/time.js");

Page({
    /*** 页面的初始数据*/
    data: {
        host: constant.imghost,
        mdlist: [],
        facepay: []
    },
    /*** 生命周期函数--监听页面加载*/
    onLoad: function (e) {
        console.log('页面参数', e)
        var that = this
        if (e.userid != undefined) {
            http.request({
                url: '/getQfacepay',
                data: {
                    quserId: e.userid,
                    qdelete: 1,
                    orderstr: `and qtime>date${util.time} order by id desc`
                },
                success: function (e) {
                    var arr = [];
                    for (var i = 0; i < e.length; i++) {
                        e[i].qtime = fromDate.timeStamp(e[i].qtime)
                        if (e[i].qdelete === 1) {
                            arr.push(e[i])
                        } else {
                        }
                    }
                    that.setData({
                        facepay: arr
                    })
                }
            })
        }
        if (e.shopid != undefined) {
            http.request({
                url: '/getQfacepay',
                data: {
                    qbusinessId: e.shopid,
                    qdelete: 1,
                    orderstr: `and qtime>date${util.time} order by id desc`
                },
                success: function (e) {
                    var arr = [];
                    for (var i = 0; i < e.length; i++) {
                        e[i].qtime = fromDate.timeStamp(e[i].qtime)
                        if (e[i].qdelete === 1) {
                            arr.push(e[i])
                        } else {
                        }
                    }
                    that.setData({
                        SPfacepay: arr
                    })
                }
            })
        }
    }
})
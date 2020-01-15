// pages/user/shoucang.js
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
const timeStamp = require("../../utils/time.js");
var app = getApp()
Page({
    data: {
        luntan: 1,
        struts: 1,
        imghost: constant.imghost,
        qrcode: '',
        page: 1,
        productData: [],
    },
    del(e) {
        let id = e.currentTarget.dataset.id
        var that = this
        http.request({
            url: '/getQuserCoupon',
            data: {
                qcouponid: id,
            },
            success: function (e) {
                if (e.length != 0) {
                    wx.showToast({
                        title: '已有用户领取',
                        image: '/images/search_no.png',
                        duration: 2000
                    })
                    return
                } else {
                    http.request({
                        url: '/updateQcoupons',
                        data: {
                            id: id,
                            del: 2
                        },
                        success: function (e) {
                            that.shuju()
                        }
                    });
                }
            }
        });
    },
    onLoad: function () {
        // 页面显示
    },
    xq(e) {
        wx.navigateTo({
            url: '/pages/logs/logs?id=' + e.currentTarget.dataset.id + '&qshopid=' + e.currentTarget.dataset.shopid + '&tp=2',
        })
    },
    shuju() {
        var that = this;
        http.request({
            url: '/getQcoupons',
            data: {
                storeId: wx.getStorageSync('shop').id,
                del: 1
            },
            success: function (e) {
                for (var i = 0; i < e.length; i++) {
                    e[i].time = timeStamp.timeStamp(e[i].time).substr(0, 10)
                    e[i].endTime = timeStamp.timeStamp(e[i].endTime).substr(0, 10)
                }
                that.setData({
                    productData: e,
                })
            }
        })
    },
    onShow: function (options) {
        this.shuju()
    },
    luntan: function (data) {
        var that = this;
        that.setData({
            luntan: data.currentTarget.dataset.luntan
        })
    },

});
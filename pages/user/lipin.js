// pages/user/shoucang.js
const notification = require('../../utils/notification.js');
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
        is_select: false,
        qshopid: 0,
        qsum: 0
    },
    onLoad: function (options) {
        console.log(options);
        if (options.qshopid) {
            this.data.qshopid = options.qshopid;
            this.data.qsum = options.qsum;
            this.setData({
                qshopid: options.qshopid,
                luntan: 2
            })
        }
        // 页面显示
        this.shuju()
    },
    xq(e) {
        wx.navigateTo({
            url: '/pages/logs/ysyyhq?id=' + e.currentTarget.dataset.id + '&qshopid=' + e.currentTarget.dataset.shopid + '&tp=2',
        })
    },
    shuju() {
        wx.showNavigationBarLoading()
        var that = this;
        http.request({
            url: '/getQuserCoupon',
            data: {
                quserid: wx.getStorageSync('user').id,
                qstoreId: this.data.qshopid == 0 ? '' : this.data.qshopid,
                orderstr: 'order by id desc'
            },
            success: function (e) {
                for (var i = 0; i < e.length; i++) {
                    e[i].time = timeStamp.timeStamp(e[i].time).substr(0, 10)
                    e[i].endTime = timeStamp.timeStamp(e[i].endTime).substr(0, 10)
                }
                wx.hideNavigationBarLoading()
                that.setData({
                    productData: e,
                })
            }
        })
    },
    ewm(e) {
        if ((e.currentTarget.dataset.typeid == 2) && Number(this.data.qsum) < Number(e.currentTarget.dataset.full)) {
            wx.showToast({
                title: "满减金额不够",
                image: '/images/tksh.png',
                duration: 2000,
            });
            return;
        }
        var yhq = {};
        yhq.id = e.currentTarget.dataset.id;
        yhq.money = e.currentTarget.dataset.money
        notification.emit('notification_order_check_yhq', yhq);
        setTimeout(function () {
            wx.navigateBack();
        }, 500);
    },
    gbewm() {
        this.shuju()
        this.setData({
            qrcode: ''
        })
    },
    ylq: function () {
        wx.showToast({
            title: "已领取",
            image: '/images/tksh.png',
            duration: 2000,
        });
    },
    struts(data) {
        console.log('点击参数', data.currentTarget.dataset.struts);
        var that = this;
        that.setData({
            struts: data.currentTarget.dataset.struts
        })
    },
    luntan: function (data) {
        console.log('点击参数', data.currentTarget.dataset.luntan);
        var that = this;
        that.setData({
            luntan: data.currentTarget.dataset.luntan
        })
    },
    handleClick: function (e) {
        console.log(event);
        var yhq = event.currentTarget.id;
        if (this.data.is_select) {
            notification.emit('notification_order_check_yhq', yhq);
            setTimeout(function () {
                wx.navigateBack();
            }, 500);
        } else {
            wx.navigateTo({
                url: '../delivery/detail?delivery_id=' + delivery_id
            });
        }
    },
    dpxq(e) {
        let id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: '/pages/shangjzy/shangjzy?id=' + id,
        })
    }
});
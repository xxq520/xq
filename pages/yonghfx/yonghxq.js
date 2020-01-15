// pages/yonghfx/yonghxq.js
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
const time = require("../../utils/time.js");
var app = getApp();
Page({
    /*** 页面的初始数据*/
    data: {
        user: {},
        qtype1: 0,
        qtype2: 0
    },
    /*** 生命周期函数--监听页面加载*/
    onLoad: function (options) {
        var that = this
        http.request({
            url: '/getQuser',
            data: {
                id: options.userid,
            },
            success: function (data1) {
                that.data.user = data1[0];
                that.setData({
                    user: data1[0]
                })
                http.request({
                    url: '/getQuserRecordNum',
                    data: {
                        qbusinessid: wx.getStorageSync('shop').id,
                        qopenid: data1[0].qopenid,
                    },
                    success: function (data) {
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].qtype == 1) {
                                that.setData({
                                    qtype1: data[i].qnum
                                })
                            }
                            if (data[i].qtype == 2) {
                                that.setData({
                                    qtype2: data[i].qnum
                                })
                            }
                        }
                    }
                });
                http.request({
                    url: '/getQuserRecord',
                    data: {
                        qbusinessid: wx.getStorageSync('shop').id,
                        qopenid: that.data.user.qopenid,
                        orderstr: 'order by qtime desc limit 0,50',
                    },
                    success: function (data) {
                        var ftime = '';
                        for (var i = 0; i < data.length; i++) {
                            data[i].qtime = time.timeStamp(data[i].qtime)
                            if (ftime == data[i].qtime.slice(0, 10)) {
                                data[i].qshow = false;
                                data[i].qshowtime = ftime
                            } else {
                                ftime = data[i].qtime.slice(0, 10);
                                data[i].qshow = true;
                                data[i].qshowtime = ftime
                            }
                        }
                        that.setData({
                            records: data
                        })
                    }
                })
            }
        })
    },
    dianhua: function () {
        if (this.data.user.qphone != null) {
            wx.makePhoneCall({
                phoneNumber: this.data.user.qphone
            })
        } else {
            wx.showToast({
                title: '用户未公布电话',
                image: '/images/search_no.png',
                duration: 2000,
            });
            setTimeout(function () {
                wx.hideToast()
            }, 2000);
        }
    },
    tochat: function () {
        let item = {};
        item.friendId = this.data.user.qopenid;
        item.friendHeadUrl = this.data.user.qicon;
        item.friendName = this.data.user.qnick;
        item.conversationId = -1;
        item.msgUserId = wx.getStorageSync('shop').id;
        item.timeStr = "19:06";
        item.timestamp = 1533294362000;
        item.type = "text";
        wx.navigateTo({
            url: `/pages/im/chat/chat?friend=${JSON.stringify(item)}`
        });
    }
})
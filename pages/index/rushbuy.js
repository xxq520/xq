// pages/index/rushbuy.js
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
const timeStamp = require("../../utils/time.js");
var app = getApp();
Page({
    /*** 页面的初始数据*/
    data: {
        host: constant.imghost,
        lq: [],
        userlq: [],
        canIUse: false
    },
    shouye(e) {
        console.log('页面参数', e)
        var id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: '/pages/shangjzy/shangjzy?id=' + id,
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        wx.getSetting({
            success: function (res) {
                console.log('os授权信息：', res);
                if (res.authSetting['scope.userInfo']) {
                    that.setData({
                        canIUse: false
                    })
                } else {
                    that.setData({
                        canIUse: true
                    })
                }
            }
        })
        http.request({
            url: '/getQcoupons',
            data: {
                typeId: 2,
                bstate: 2,
                del: 1,
                orderstr: 'limit 0 ,10'
            },
            success: (res) => {
                console.log('优惠券', res)
                res.forEach((item,index)=>{
                    item.time=timeStamp.timeStamp(item.time).substr(0,10)
                    item.endTime=timeStamp.timeStamp(item.endTime).substr(0,10)
                })
                this.setData({
                    lq: res,
                })
                let quserid = wx.getStorageSync("user").id;
                http.request({
                    url: "/getQuserCoupon",
                    data: {
                        quserid,
                    },
                    success: (res) => {
                        console.log('我的优惠券', res)
                        //校验用户是否已领取
                        for (var i = 0; i < this.data.lq.length; i++) {
                            let juan = false
                            res.forEach(item => {
                                if (this.data.lq[i].id === item.id) {
                                    juan = true
                                }
                            })
                            if (juan) {
                                this.data.lq[i].isPt = true
                            }
                            this.data.userlq.push(this.data.lq[i])
                        }

                        this.setData({
                            userlq: this.data.userlq,
                        })

                    }
                })
            }
        })

    },
    bindGetUserInfo: function (e) {
        var that = this;
        wx.getSetting({
            success: function (res) {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称
                    wx.getUserInfo({
                        lang: 'zh_CN',
                        success: function (res) {
                            var objz = {};
                            objz.avatarUrl = res.userInfo.avatarUrl;
                            objz.nickName = res.userInfo.nickName;
                            app.globalData.userInfo = res.userInfo;
                            wx.setStorageSync('userInfo', objz); //存储userInfo
                            http.request({
                                url: '/getQuser',
                                data: {
                                    qopenid: app.globalData.userOpen.openid
                                },
                                success: function (e) {
                                    console.log('用户信息', e);
                                    if (e.length == 0) {
                                        http.request({
                                            url: '/insertQuser',
                                            data: {
                                                qopenid: app.globalData.userOpen.openid,
                                                qnick: app.globalData.userInfo.nickName,
                                                qicon: app.globalData.userInfo.avatarUrl,
                                                qsjopenid: that.data.sjopenid == '' ? '' : that.data.sjopenid,
                                                qnum: 0,
                                                qxin: 0
                                            },
                                            success: function (e) {
                                                http.request({
                                                    url: '/getQuser',
                                                    data: {
                                                        qopenid: app.globalData.userOpen.openid
                                                    },
                                                    success: function (e) {
                                                        wx.setStorageSync('user', e); //存储user
                                                        that.shuju()
                                                    }
                                                })
                                            },
                                        })
                                    } else if (that.data.sjopenid != '') {
                                        http.request({
                                            url: '/updateQuser',
                                            data: {
                                                id: e[0].id,
                                                qopenid: app.globalData.userOpen.openid,
                                                qnick: app.globalData.userInfo.nickName,
                                                qicon: app.globalData.userInfo.avatarUrl,
                                                qsjopenid: that.data.sjopenid == '' ? '' : that.data.sjopenid,

                                            },
                                            success: function (e) {
                                                console.log('请求成功')
                                            },
                                        })
                                    } else {
                                        wx.setStorageSync('user', e); //存储user
                                    }
                                }
                            })
                        }
                    });
                    that.setData({
                        canIUse: false
                    })

                } else {
                    wx.showModal({
                        title: '提示',
                        content: '请重新授权登录！',
                        showCancel: false
                    });
                    that.setData({
                        canIUse: true
                    })
                }
            }
        })
    },
    // 领券
    coupon(e) {
        var qcouponid = e.currentTarget.dataset.lqid;
        let qstoreId = e.currentTarget.dataset.storeid
        let quserid = wx.getStorageSync("user").id;
        let index = e.currentTarget.dataset.index
        http.request({
            url: "/getQuserCoupon",
            data: {
                quserid,
                qcouponid,
            },
            success: (res) => {
                console.log(res);
                if (res.length >= 1) {
                    wx.showToast({
                        title: '已经领过了',
                        image: '/images/search_no.png',
                        duration: 2000
                    })
                } else {
                    http.request({
                        url: '/insertQuserCoupon',
                        data: {
                            quserid,
                            qcouponid,
                            qstoreId,
                            qstatus: 1
                        },
                        success: () => {
                            this.data.userlq[index].isPt = true
                            this.setData({
                                userlq: this.data.userlq
                            })
                            wx.showToast({
                                title: '领取成功',
                            })
                        }
                    })
                }
            }
        })
    },
})
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
var app = getApp();
Page({
    data: {
        money: 0,
        id: 0,
        nameList: [],
        imghost: constant.imghost,
        agreeIndex: 0,
        agree1: true,
    },
    bindGetUserInfo: function (e) {
        var that = this;
        wx.getSetting({
            success: function (res) {
                console.log('bt授权信息', res);
                if (res.autprepayhSetting['scope.userInfo']) {
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
    onLoad: function (options) {
        var that = this
        wx.getSetting({
            success: function (res) {
                console.log('os授权信息：', res);
                if (res.authSetting['scope.userInfo']) {
                } else {
                    that.setData({
                        canIUse: true
                    })
                }
            }
        })
        var that = this;
        that.setData({
            money: app.globalData.rzmoney,
            userInfo: app.globalData.userInfo,
            sysinfo: app.globalData.sysinfo,
        })
        if (options.id) {
            that.data.id = options.id;
            wx.setNavigationBarTitle({
                title: '商家续费'
            });
        }

        http.request({
            url: '/getQbanner',
            data: {
                state: 1,
                type: 3
            },
            success: function (e) {
                for (var i = 0; i < e.length; i++) {
                    that.data.nameList.push(e[i].title)
                }
                that.setData({
                    nameList: that.data.nameList,
                })
            },
        })
    },
    toxy: function () {
        wx.navigateTo({
            url: '/pages/rzxy/rzxy',
        })
    },
    prepay: function () {
        //判断是否勾选统一入驻协议
        if (this.data.agree1) {
            util.showFailToast({
                title: '需同意入驻协议！'
            });
            return;
        }
        var that = this;
        var order = {};
        //在全局的变量中获取用户的openid
        order.qsubmitter = app.globalData.userOpen.openid
        //在本机的微信缓存当中获取用户的id
        order.id = wx.getStorageSync("user").id
        //在全局变量中获取入驻的费用
        order.qsum = app.globalData.rzmoney//0.01
        // order.qsum =0.01
        //设置类型为1为入驻或续费商家支付
        order.type = 1
        //在微信的缓存中获取商家的信息
        order.fkBusinessId = wx.getStorageSync('shop').id || ''
        http.request({
            url: '/prepayTo',
            data: order,
            //发送给开发者服务器请求支付时所需的参数
            success: function (data) {
                //本次支付的groupid
                var qgroupid = data.qgroupid;
                wx.requestPayment({
                    timeStamp: data.timeStamp,
                    nonceStr: data.nonceStr,
                    package: data.package,
                    signType: data.signType,
                    paySign: data.paySign,
                    success: function (response) {
                        if (response.errMsg == "requestPayment:ok") {
                            //如果是入驻支付成功的时候
                            if (that.data.id == 0) {
                                //支付入驻店铺成功的时候跳转至填写店铺的相关消息页面
                                wx.navigateTo({
                                    url: '/pages/user/zhuczc',
                                })
                            } else {
                                //如果是商家续费的话
                                util.showFailToast({
                                    title: '续费成功！'
                                });
                                //跳转至商家的首页
                                setTimeout(function () {
                                    wx.redirectTo({
                                        url: '/pages/booszy/booszy',
                                    })
                                }, 2000);
                            }
                            //如果返回的不是支付成功的回调的话
                        } else {
                            util.showFailToast({
                                title: '支付失败！'
                            });
                            return;
                        }
                    },
                    fail: function (response) {
                        util.showFailToast({
                            title: '取消支付！'
                        });
                    }
                })
            }
        })
    },
    agree() {
        ++this.data.agreeIndex;
        if (this.data.agreeIndex % 2 == 0) {
            this.setData({
                agree1: true,
                agree2: false,
            })
        } else {
            this.setData({
                agree1: false,
                agree2: true,
            })
        }
    }
})
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
//const Quantity = require('../../component/quantity/index');
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
const timeStamp = require("../../utils/time.js");
var app = getApp();
Page({
    data: {
        num: 1,
        logs: [],
        gou: true,
        modalHidden: true,
        fenxiang: false,
        imghost: constant.imghost,
        coupon: {},
        business: {}
    },
    onLoad: function (options) {
        var that = this;
        if (!options.tp) {
            that.setData({
                gou: false
            })
        }
        ;
        http.request({
            url: '/getQcoupons',
            data: {
                id: options.id,
            },
            success: function (e) {
                e[0].time = timeStamp.timeStamp(e[0].time).substr(0,10)
                e[0].endTime = timeStamp.timeStamp(e[0].endTime).substr(0,10)
                that.data.coupon = e[0];
                that.setData({
                    phone: wx.getStorageSync('user').qphone,
                    coupon: e[0],
                    id: options.id,
                })
            }
        });
        http.request({
            url: '/getQbusiness',
            data: {
                id: options.qshopid,
            },
            success: function (e) {
                if (e[0].ad) {
                    e[0].ad = e[0].ad.split(",");
                }
                e[0].views = (e[0].views / 10000).toFixed(2) + '万';
                that.data.business = e[0];
                that.setData({
                    business: e[0],
                });
            }
        })
    },
    jian() {
        this.setData({
            num: this.data.num - 1 < 1 ? 1 : this.data.num - 1
        })
    },
    jia() {
        let shengyu = this.data.coupon.number
        if ((this.data.num + 1) > shengyu) {
            wx.showToast({
                title: '数量不足',
                icon: "none",
                duration: 2000
            })
            setTimeout(function () {
                wx.hideToast()
            }, 2000);
        } else {
            this.setData({
                num: this.data.num + 1
            })
        }
    },
    gb: function () {
        this.setData({
            fenxiang: false
        })
    },
    daodianmaidan(e) {
        wx.navigateTo({
            url: `/pages/pics/gdal/gdal?business=` + e.currentTarget.dataset.business + '&id=' + e.currentTarget.dataset.id + '&logo=' + e.currentTarget.dataset.logo + '&fanhui=2',
        })
    },
    //当用户支付成功的时候给用户发送一条服务通知
    pay: function (e) {
        var that = this;
        var nowDate = util.getNowDate()
        app.globalData.spid = e.currentTarget.dataset.spid;
        var order = {}
        order.qsubmitter = app.globalData.userOpen.openid
        order.qsubmitterName = app.globalData.userInfo.nickName
        order.qprocedureName = this.data.coupon.name
        //正确价格
        order.qsum = (this.data.coupon.money * that.data.num).toFixed(2)
        order.qtotal = that.data.num;
        order.qstatus = 3;
        //设置支付类型4为代金劵支付
        order.type = 5
        //在当前页面的data数据中获取需要充值的商户的id
        order.fkBusinessId = that.data.business.id || ''
        //代金劵的id
        order.couponsId = that.data.coupon.id
        if (this.data.coupon.money * that.data.num <= 0) {
            for (let i = 0; i < that.data.num; i++) {
                http.request({
                    url: '/insertQuserCoupon',
                    data: {
                        quserid: wx.getStorageSync('user').id,
                        qcouponid: that.data.coupon.id,
                        qstoreId: that.data.business.id,
                        qstatus: 1
                    },
                    success: function (e) {
                        if (i == that.data.num.length - 1) {
                            util.showFailToast({
                                title: '购买成功'
                            });
                        }
                    }
                })
            }
            that.setData({
                nowDate: nowDate,
                fenxiang: true
            })
        } else {
            var that = this
            http.request({
                url: '/prepayTo',
                data: order,
                success: function (data) {
                    wx.requestPayment({
                        timeStamp: data.timeStamp,
                        nonceStr: data.nonceStr,
                        package: data.package,
                        signType: data.signType,
                        paySign: data.paySign,
                        success: function (response) {
                            that.setData({
                                nowDate: nowDate,
                                fenxiang: true
                            })
                        }
                    })
                },
                fail: function (response) {
                    util.showFailToast({
                        title: '取消支付！'
                    })
                }
            })
        }
    },
    shoucang: function (e) {
        var that = this;
        http.request({
            url: '/insertQcollect',
            data: {
                qscid: e.currentTarget.dataset.qscid,
                qopenid: app.globalData.userOpen.openid,
                qtype: 3,
                qstatus: 1,
            },
            success: function (data) {
                wx.showModal({
                    title: '',
                    content: '已成功收藏！',
                })
            }
        })
    },
    getPhoneNumber: function (e) { //点击获取手机号码按钮
        var that = this;
        if (!wx.getStorageSync('user').qphone) {
            wx.checkSession({
                success: function () {
                    var ency = e.detail.encryptedData;
                    var iv = e.detail.iv;
                    var sessionk = app.globalData.userOpen.session_key;
                    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
                        that.setData({
                            modalstatus: true
                        });
                    } else { //同意授权
                        wx.request({
                            method: "GET",
                            url: constant.host + '/deciphering.do',
                            data: {
                                id: wx.getStorageSync('user').id,
                                encrypdata: ency,
                                ivdata: iv,
                                sessionkey: sessionk
                            },
                            header: {
                                'content-type': 'application/json' // 默认值
                            },
                            success: (res) => {
                                http.request({
                                    url: '/getQuser',
                                    data: {
                                        id: wx.getStorageSync('user').id,
                                    },
                                    success: function (data) {
                                        wx.setStorageSync('user', data)
                                        that.setData({
                                            phone: wx.getStorageSync('user').qphone,
                                        })
                                    }
                                })
                            }
                        })
                    }
                }
            })
        }
    },
    tochat: function (e) {
        var message = {};
        message.qformId = e.detail.formId;
        message.qopenId = getApp().globalData.userOpen.openid
        http.request({
            url: '/insertQmessage',
            data: message,
            success: function (resp) {
            }
        });
        getApp().globalData.imuserInfo.myHeadUrl = getApp().globalData.userInfo.avatarUrl;
        getApp().globalData.imuserInfo.nickName = getApp().globalData.userInfo.nickName;
        getApp().getIMHandler().sendMsg({
            content: {
                type: 'first',
                userId: getApp().globalData.imuserInfo.userId,
                friendId: app.globalData.userOpen.openid,
                nickName: getApp().globalData.userInfo.nickName,
                myHeadUrl: getApp().globalData.userInfo.avatarUrl
            }
        });
        let item = {};
        item.friendId = this.data.business.id + '';
        item.friendHeadUrl = this.data.host + this.data.business.logo;
        item.friendName = this.data.business.storeName;

        item.conversationId = -1;
        item.msgUserId = app.globalData.userOpen.openid;
        item.timeStr = "19:06";
        item.timestamp = 1533294362000;
        item.type = "text";
        wx.navigateTo({
            url: `/pages/im/chat/chat?friend=${JSON.stringify(item)}`
        });
    }
})
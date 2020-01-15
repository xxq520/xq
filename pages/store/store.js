const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
const qcreateTime = require("../../utils/time.js");
var app = getApp();
Page({
    data: {
        imghost: constant.imghost,
        orders: []
    },
    onLoad: function (e) {
        wx.setStorageSync('first', true)
        this.shuju()
    },
    shuju() {
        var that = this
        http.request({
            url: '/getQorder',
            data: {
                qshopid: wx.getStorageSync('shop').id,
                otherterm: "and (qstatus = 2 or qstatus =5)"
            },
            success: function (e) {
                for (var i = 0; i < e.length; i++) {
                    var price = 0;
                    for (var j = 0; j < e[i].length; j++) {
                        if (e[i][j].cost) {
                            price += e[i][j].cost * e[i][j].qtotal
                        } else {
                            price += e[i][j].qsum
                        }
                        e[i][j].qcreateTime = qcreateTime.timeStamp(e[i][j].qcreateTime);
                        if (e[i][j].qprocedureName != null) {
                            if (e[i][j].qprocedureName.indexOf('【') != -1) {
                                var a = e[i][j].qprocedureName.split("【")
                                e[i][j].qprocedureName = a[0]
                                e[i][j].orderstr = a[1].split("】")[0] || 0
                            }
                        }
                    }
                    e[i][0].hj = price;
                    if (e[i][0].qstatus == 2 || e[i][0].qstatus == 3 || e[i][0].qstatus == 4) {
                        if (e[i][0].reducityMoney) {
                            console.log(price, price - e[i][0].reducityMoney)
                            e[i][0].hj = price - e[i][0].reducityMoney
                        } else {
                            e[i][0].hj = price
                        }
                    }
                }

                that.setData({
                    orders: e
                })
            }
        })
    },
    phone(e) {
        if (e.currentTarget.dataset.phone != null) {
            wx.makePhoneCall({
                phoneNumber: e.currentTarget.dataset.phone
            })
        } else {
            wx.showToast({
                title: '未填写电话',
                image: '/images/search_no.png',
                duration: 2000
            })
        }
    },
    weixin() {
        wx.showToast({
            title: '暂未开放',
            image: '/images/search_no.png',
            duration: 2000
        })
    },
    fahuo(e) {
        var qcode = e.currentTarget.dataset.qcode;
        var arr = '';
        //判断确认收货的是否是多个商品
        if (qcode.length) {
            for (var i = 0; i < qcode.length; i++) {
                arr += qcode[i].id + ','
            }
        }
        var that = this
        //将多个订单的确认收货通过拼接id发送给服务器
        http.request({
            url: '/NewupdateQorder',
            data: {
                id: arr.slice(0, arr.length - 1),
                status: 3,
                //设置7天后自动确认收货
                time: 7
                // qstatus: qcode == 1 ? 3 : 4
            },
            success: function (e) {
                setTimeout(() => {
                    wx.showToast({
                        title: '发货成功',
                        icon: 'success',
                        duration: 2000
                    });
                }, 10)
                that.shuju(true)
                setTimeout(function () {
                    wx.hideLoading();
                }, 2000)
            }
        })
    },
    yonghfx() {
        wx.redirectTo({
            url: '/pages/yonghfx/yonghfx',
        })
    },
    ty(e) {
        var qcode = e.currentTarget.dataset.qcode;
        var arr = '';
        //判断确认收货的是否是多个商品
        if (qcode.length) {
            for (var i = 0; i < qcode.length; i++) {
                arr += qcode[i].id + ','
            }
        }
        var that = this
        //将多个订单的确认收货通过拼接id发送给服务器
        http.request({
            url: '/NewupdateQorder',
            data: {
                id: arr.slice(0, arr.length - 1),
                status: 3,
                //设置7天后自动确认收货
                time: 7
                // qstatus: qcode == 1 ? 3 : 4
            },
            success: function (e) {
                setTimeout(() => {
                    wx.showToast({
                        title: '操作成功',
                        icon: 'success',
                        duration: 2000
                    });
                }, 10)
                that.shuju(true)
                setTimeout(function () {
                    wx.hideLoading();
                }, 2000)
            }
        })
    },
    wode() {
        wx.redirectTo({
            url: '/pages/pics/pics',
        })
    },
    shouye() {
        wx.redirectTo({
            url: '/pages/booszy/booszy',
        })
    },
    saoma: function () {
        var that = this;
        var nowDate = util.getNowDate();
        wx.scanCode({
            success(res) {
                if (res.path != undefined) {
                    var list = res.path.split('=')
                    http.request({
                        url: '/getQuserCouponData',
                        data: {
                            id: list[1],
                            qdelete: 1
                        },
                        success: function (e) {
                            if (e.length != 0) {
                                if (e[0].qstoreId != wx.getStorageSync('shop').id) {
                                    wx.showModal({
                                        title: '系统提示',
                                        content: '该卷不属于本店'
                                    })
                                } else if (e[0].qstatus == 2) {
                                    wx.showModal({
                                        title: '系统提示',
                                        content: '该代金券已核销'
                                    })
                                } else {
                                    http.request({
                                        url: '/updateQuserCoupon',
                                        data: {
                                            id: e[0].id,
                                            qtime: nowDate,
                                            qstatus: 2 //核销状态
                                        },
                                        success: function (e) {
                                            wx.showModal({
                                                title: '系统提示',
                                                content: '代金券核销成功'
                                            })
                                        }
                                    })
                                }
                            } else {
                                wx.showModal({
                                    title: '系统提示',
                                    content: '优惠券不存在'
                                })
                            }
                        }
                    });
                } else {
                    wx.showModal({
                        title: '系统提示',
                        content: '优惠券不存在'
                    })
                }
            }
        })
    }
})
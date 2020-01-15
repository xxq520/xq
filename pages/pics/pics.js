const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
var app = getApp();

Page({
    data: {
        host: constant.imghost,
        user: '',
        shop: ''
    },
    onLoad: function () {
        wx.setStorageSync('first', true)
        this.setData({
            user: wx.getStorageSync('user'),
            shop: wx.getStorageSync('shop')
        })
    },
    mingxi: function () {
        wx.navigateTo({
            url: '/pages/storelistss/storelist?shopid=' + this.data.shop.id,
        })
    },
    tcdl: function () {
        app.globalData.shoplogin = false
        wx.setStorageSync('phone', '')
        wx.showLoading({
            title: '正在注销',
        })
        setTimeout(function () {
            wx.hideLoading()
            wx.switchTab({
                url: '/pages/index/index'
            })
        }, 1000)
    },
    phone(e) {
        wx.makePhoneCall({
            phoneNumber: '020-31568159'
        })
    },
    yonghfx() {
        wx.redirectTo({
            url: '/pages/yonghfx/yonghfx',
        })
    },
    shouye() {
        wx.redirectTo({
            url: '/pages/booszy/booszy',
        })
    },
    xiaoxi() {
        wx.redirectTo({
            url: '/pages/store/store',
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
                                        content: '该卷不属于本店',
                                        success(res) {
                                            if (res.confirm) {
                                            }
                                        }
                                    })
                                } else if (e[0].qstatus == 2) {
                                    wx.showModal({
                                        title: '系统提示',
                                        content: '该代金券已核销',
                                        success(res) {
                                            if (res.confirm) {
                                            }
                                        }
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
                                                content: '代金券核销成功',
                                                success(res) {
                                                    if (res.confirm) {

                                                    }
                                                }
                                            })
                                        }
                                    });
                                }
                            } else {
                                wx.showModal({
                                    title: '系统提示',
                                    content: '优惠券不存在',
                                    success(res) {
                                        if (res.confirm) {

                                        }
                                    }
                                })
                            }
                        }
                    });
                } else {
                    wx.showModal({
                        title: '系统提示',
                        content: '优惠券不存在',
                        success(res) {
                            if (res.confirm) {

                            }
                        }
                    })
                }
            }
        })
    },
    xzewm: util.throttle(function (e) {
        var that = this
        wx.showLoading({
            title: '下载中',
        })
        var id = wx.getStorageSync('shop').id;
        var requestData = {
            json: '{"path": "/pages/shangjzy/shangjzy?id=' + id + '", "width":1280}',
            sellerId: wx.getStorageSync('shop').logo // 'tu0.jpg'//
        };
        wx.request({
            url: constant.host + '/imagetocode',
            data: requestData,
            method: 'POST', // OPconstantTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            success: (res) => {
                var mUrl = constant.imghost + res.data.url;
                that.saveimage(mUrl)
            }
        })
    }, 10000),
    saveimage: function (mUrl) {
        wx.downloadFile({
            url: mUrl,
            type: 'image',
            success: function (res) {
                if (res.statusCode === 200) {
                    wx.saveImageToPhotosAlbum({
                        filePath: res.tempFilePath,
                        success(res) {
                            wx.hideLoading()
                            wx.showToast({
                                title: '已下载至相册',
                                duration: 2000
                            })
                        }
                    })
                } else {
                    wx.showToast({
                        title: '网络异常',
                        image: '/images/search_no.png',
                        duration: 2000
                    })
                }
            },
        })
    }
})
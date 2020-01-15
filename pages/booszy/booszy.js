// pages/booszy/booszy.js
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
var app = getApp();
var numCount = 6;
var numSlot = 5;
var mW = 360;
var mH = 360;
var mCenter = mW / 2; //中心点
var mAngle = Math.PI * 2 / numCount; //角度
var mRadius = mCenter - 60; //半径(减去的值用于给绘制的文本留空间)
var radCtx = wx.createCanvasContext("radarCanvas")
//获取Canvas
Page({
    /*** 页面的初始数据*/
    data: {
        user: '',
        shop: '',
        order: 0,
        orders: 0,
        fenxiao: 0,
        fenxiaos: 0,
        procedureNum: 0,
        host: constant.imghost,
        procedureTypeNum: 0,
        arr: [0, 2],
        bfb: 0,
        isTrue: true
    },
    wkf() {
        wx.showToast({
            title: '暂未开放',
            image: '/images/search_no.png',
            duration: 2000
        })
    },
    onLoad: function (options) {
        var that = this
        if (wx.getStorageSync('first')) {
            that.setData({
                isTrue: false,
            })
        } else {
            that.setData({
                isTrue: true
            })
            var timer = setInterval(() => {
                that.setData({
                    bfb: that.data.bfb + 4
                })
                if (that.data.bfb >= 100) {
                    clearInterval(timer);
                    that.setData({
                        isTrue: false
                    })
                }
            }, 10);
        }
        if (!app.globalData.shoplogin) {
            app.globalData.shoplogin = true;
        }
        this.logonIM();
    },
    logonIM() {
        getApp().globalData.imuserInfo.userId = wx.getStorageSync('shop').id + '';
        getApp().getIMHandler().sendMsg({
            content: {
                type: 'first',
                userId: getApp().globalData.imuserInfo.userId,
                friendId: wx.getStorageSync('shop').id + ''
            }
        })
    },
    shuju() {
        var that = this;
        var nowDate = util.getNowDate().substring(0, 10);
        this.setData({
            shop: wx.getStorageSync('shop'),
            user: wx.getStorageSync('user')
        })
        http.request({
            url: '/getQorderNum',
            data: {
                qshopid: that.data.shop ? that.data.shop.id : wx.getStorageSync('shop').id,
                otherterm: "and qstatus in (1,2 ,3 ,4)", //
            },
            success: function (data) {
                that.setData({
                    orders: data,
                    isTrue: false
                })
            }
        }, true);
        http.request({
            url: '/getQorderNum',
            data: {
                qshopid: that.data.shop ? that.data.shop.id : wx.getStorageSync('shop').id,
                otherterm: " and qstatus != 7  and (qcreate_time LIKE '%" + nowDate + "%')"
            },
            success: function (data) {
                that.setData({
                    order: data
                })
            }
        }, true)
        http.request({
            url: '/getQuser',
            data: {
                qsjopenid: app.globalData.userOpen.openid,
                otherterm: " and (qtime LIKE '%" + nowDate + "%')"
            },
            success: function (data) {
                that.setData({
                    fenxiao: data.length,
                })
            }
        }, true)
        http.request({
            url: '/getQprocedureCount',
            data: {
                storeId: that.data.shop ? that.data.shop.id : wx.getStorageSync('shop').id,
                otherterm: 'and  state != 3',
            },
            success: function (e) {
                that.setData({
                    procedureNum: e,
                    bfb: 99
                });
            }
        }, true)
        http.request({
            url: '/getQcoupons',
            data: {
                storeId: that.data.shop ? that.data.shop.id : wx.getStorageSync('shop').id,
                del: 1
            },
            success: function (e) {
                that.setData({
                    coupons: e,
                    bfb: 99,
                    couponsNum: e.length
                });
            }
        }, true)
        http.request({
            url: '/getQprocedureType',
            data: {
                qshopid: that.data.shop ? that.data.shop.id : wx.getStorageSync('shop').id,
                qdelete: 1
            },
            success: function (e) {
                that.setData({
                    procedureType: e,
                    procedureTypeNum: e.length,
                    isTrue: false
                });
            }
        }, true)
        http.request({
            url: '/getQbusiness',
            data: {
                tel: wx.getStorageSync('phone') != '' ? wx.getStorageSync('phone') : '',
                userId: wx.getStorageSync('phone') != '' ? '' : that.data.user ? that.data.user.id : wx.getStorageSync('user').id,
            },
            success: function (data) {
                wx.setStorageSync('shop', data[0])
                http.request({
                    url: '/updateQbusiness',
                    data: {
                        id: data[0].id,
                        isTrue: false,
                        cityname: wx.getStorageSync('city') + wx.getStorageSync('district'),
                        userId: wx.getStorageSync('phone') == '' ? '' : that.data.user ? that.data.user.id : wx.getStorageSync('user').id
                    }
                }, true)
                that.setData({
                    shop: data[0],
                })
            }
        }, true);
    },
    spgl(e) {
        if (this.data.procedureTypeNum == 0) {
            wx.navigateTo({
                url: `/pages/shangpfl/shangpfl`,
            })
        } else {
            wx.navigateTo({
                url: `/pages/shangpgl/shangpgl?procedureType= ${JSON.stringify(e.currentTarget.dataset.proceduretype)}&shopid=` + e.currentTarget.dataset.shopid,
            })
        }
    },
    sptpgl(e) {
        wx.navigateTo({
            url: `/pages/shangpfl/shangpfl?procedureType= ${JSON.stringify(e.currentTarget.dataset.proceduretype)} `,
        })
    },
    wode() {
        wx.redirectTo({
            url: '/pages/pics/pics',
        })
    },
    xiaoxi() {
        wx.redirectTo({
            url: '/pages/store/store',
        })
    },
    yonghfx() {
        wx.redirectTo({
            url: '/pages/yonghfx/yonghfx',
        })
    },
    saoma: function () {
        var that = this;
        var nowDate = util.getNowDate();
        wx.scanCode({
            success(res) {
                if (res.path != undefined) {
                    var list = res.path.split('=');
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
                    })
                } else {
                    wx.showModal({
                        title: '系统提示',
                        content: '优惠券不存在'
                    })
                }
            }
        })
    },
    onShow: function () {
        if (wx.getStorageSync('shop').state == 4) {
            wx.showModal({
                title: '当前店铺已过期',
                content: '是否前往续费?',
                success(res) {
                    if (res.confirm) {
                        wx.navigateTo({
                            url: '/pages/user/shangjrz',
                        })
                    } else if (res.cancel) {
                        wx.switchTab({
                            url: '/pages/index/index',
                        })
                    }
                }
            })
        } else {
            this.shuju()
        }
    },
    onPullDownRefresh: function () {
        var that = this
        this.shuju()
        //是否提示用户已经刷新完成
        setTimeout(() => {
            wx.stopPullDownRefresh()
        }, 1000)
    },
    /*** 页面上拉触底事件的处理函数*/
})
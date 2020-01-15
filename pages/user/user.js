const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
var app = getApp();

Page({
    data: {
        imghost: constant.imghost,
        statusBarHeight: app.globalData.statusBarHeight,
        orderInfo: {
            status1: 0,
            status2: 0,
            status3: 0,
            status4: 0,
            status5: 0,
            cash: 0,
            yongjin: 0.00,
            codeText: 60,
            isCodeN: false,
            isCodeT: true,
            isPhone: false,
            newPhone: '',
            strCode: "lanlan",
            showGetUser: false
        },
        modalHidden: true,
        userInfo: {},
        orderInfo: {},
        projectSource: 'https://github.com/liuxuanqiang/wechat-weapp-mall',
        userListInfo: [{
            icon: '../../images/iconfont-dingdan.png',
            text: '我的订单',
            isunread: true,
            unreadNum: 2
        }, {
            icon: '../../images/iconfont-card.png',
            text: '我的代金券',
            isunread: false,
            unreadNum: 2
        }, {
            icon: '../../images/iconfont-icontuan.png',
            text: '我的拼团',
            isunread: true,
            unreadNum: 1
        }, {
            icon: '../../images/iconfont-shouhuodizhi.png',
            text: '收货地址管理'
        }, {
            icon: '../../images/iconfont-kefu.png',
            text: '联系客服'
        }, {
            icon: '../../images/iconfont-help.png',
            text: '常见问题'
        }],
        ewm: false
    },
    //获取用户的信息
    getUser(e) {
        if (e.detail.errMsg === 'getUserInfo:ok') {
            this.setData({
                showGetUser: false
            })
            this.onLoad()
            this.onShow()
        }
        this.bindGetUserInfo()
    },
    //监听下拉刷新
    onPullDownRefresh() {
        var that = this
        this.onLoad(app.globalData.userIsTrue > 0 ? true : false)
        wx.showToast({
            title: '刷新完成',
            icon: "none",
            duration: 1500
        })
        setTimeout(() => {
            wx.stopPullDownRefresh()
        }, 1000)
    },
    ewm() {
        this.setData({
            ewm: this.data.ewm ? false : true
        })
    },
    onLoad: function (e = false) {
        var that = this;
        wx.getSetting({
            success: function (res) {
                if (res.authSetting['scope.userInfo']) {
                    that.setData({
                        showGetUser: false
                    })
                } else {
                    that.setData({
                        showGetUser: true
                    })
                }
            }
        })
        http.request({
            url: '/getQuserCoupon',
            data: {
                quserid: that.data.user ? that.data.user.id : wx.getStorageSync('user').id,
                qstatus: 1
            },
            success: function (e) {
                that.setData({
                    coupons: e,
                })
            },
        }, true)
        http.request({
            url: '/getQfacepay',
            data: {
                quserId: that.data.user ? that.data.user.id : wx.getStorageSync('user').id,
                qdelete: 1,
                orderstr: `and qtime>date${util.time} order by id desc`
            },
            success: function (e) {
                that.setData({
                    facepay: e
                })
            }
        }, true)
    },
    /**
     * 账户明细
     */
    mingxi: function () {
        wx.navigateTo({
            url: '/pages/storelistss/storelist',
        })
    },
    onShow: function () {
        var that = this;
        //调用应用实例的方法获取全局数据
        app.getUserInfo(function (userInfo) {
            wx.getSetting({
                success: function (res) {
                }
            })
            //更新数据
            http.request({
                url: '/getQuser',
                data: {
                    qopenid: app.globalData.userOpen.openid,
                },
                success: function (data) {
                    wx.setStorageSync('user', data[0])
                    that.setData({
                        user: data[0],
                        userInfo: userInfo,
                        loadingHidden: true
                    })
                }
            }, app.globalData.userIsTrue == 0 ? false : true)
        });
        this.loadOrderStatus();
        //this.bindGetUserInfo()
    },
    modalConfirm: function () {
        this.setData({
            modalHidden: true
        })
    },
    guize: function () {
        this.setData({
            aa: false,
            modalHidden: false
        })
    },
    bindGetUserInfo: function (e) {
        var that = this;
        wx.getSetting({
            success: function (res) {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称
                    wx.getUserInfo({
                        success: function (res) {
                            var objz = {};
                            objz.avatarUrl = res.userInfo.avatarUrl;
                            objz.nickName = res.userInfo.nickName;
                            app.globalData.userInfo = res.userInfo;
                            wx.setStorageSync('userInfo', objz); //存储userInfo
                            that.setData({
                                userInfo: res.userInfo,
                                canIUse: false
                            })
                            http.request({
                                url: '/getQuser',
                                data: {
                                    qopenid: app.globalData.userOpen.openid,
                                },
                                success: function (data) {
                                    if (data.length == 0) {
                                        http.request({
                                            url: '/insertQuser',
                                            data: {
                                                qopenid: app.globalData.userOpen.openid,
                                                qnick: res.userInfo.nickName,
                                                qicon: res.userInfo.avatarUrl,
                                                qnum: 0,
                                                qxin: 0
                                            },
                                            success: function (data) {
                                            }
                                        })
                                    } else {
                                        that.onLoad()
                                        wx.setStorageSync('user', data[0]);
                                        that.setData({
                                            user: data[0]
                                        })
                                    }
                                }
                            })
                        }
                    });
                } else {
                    wx.showModal({
                        title: '提示',
                        content: '请重新授权登录！',
                        showCancel: false
                    });
                }
            }
        })
    },
    loadOrderStatus: function () {
        //获取用户订单数据
        var that = this;
        http.request({
            url: '/getQorderStatusNum',
            data: {
                qsubmitter: getApp().globalData.userOpen.openid,
            },
            success: function (data) {
                var orderInfo = that.data.orderInfo;
                if (data.status1 != undefined) {
                    orderInfo.status1 = data.status1;
                }
                if (data.status2 != undefined) {
                    orderInfo.status2 = data.status2;
                }
                if (data.status3 != undefined) {
                    orderInfo.status3 = data.status3;
                }
                if (data.status4 != undefined) {
                    orderInfo.status4 = data.status4;
                }
                if (data.status5 != undefined) {
                    orderInfo.status5 = data.status5;
                }
                that.setData({
                    orderInfo: data
                });
                app.globalData.userIsTrue = 1
            }
        }, app.globalData.userIsTrue == 0 ? false : true);


    },
    onShareAppMessage: function () {
        return {
            title: '',
            path: '/pages/index/index'
        }
    },
    dhdl: function (e) {
        var that = this
        if (that.data.isPhone) {
            http.request({
                url: '/getQbusiness',
                data: {
                    tel: that.data.newPhone
                },
                success: function (data) {
                    if (data.length != 0) {
                        wx.setStorageSync('phone', that.data.newPhone);
                        wx.setStorageSync('shop', data[0]);
                        wx.showLoading({
                            title: '正在登录',
                        })
                        setTimeout(function () {
                            wx.hideLoading()
                            wx.reLaunch({
                                url: '/pages/booszy/booszy',
                            })
                        }, 1000);
                        var message = {};
                        message.qformId = e.detail.formId;
                        message.qopenId = getApp().globalData.userOpen.openid
                        http.request({
                            url: '/insertQmessage',
                            data: message,
                            success: function (resp) {
                            }
                        });
                    } else {
                        that.modalConfirm()
                        util.showFailToast({
                            title: '手机号未注册商家'
                        });
                    }
                }
            });
        } else {
            wx.showToast({
                title: '请先验证手机号',
                image: '/images/search_no.png',
                duration: 2000
            })
        }
    },
    //商家登录
    wxdl: function (e) {
        wx.getStorageSync('user', this.data.user)
        var that = this
        http.request({
            url: '/getQbusiness',
            data: {
                userId: that.data.user ? that.data.user.id : wx.getStorageSync('user').id
            },
            success: function (data) {
                if (data.length != 0) {
                    wx.setStorageSync('shop', data[0])
                    wx.showLoading({
                        title: '正在登录',
                    })
                    var message = {};
                    message.qformId = e.detail.formId;
                    message.qopenId = getApp().globalData.userOpen.openid
                    http.request({
                        url: '/insertQmessage',
                        data: message,
                        success: function (resp) {
                        }
                    });
                    wx.hideLoading();
                    wx.redirectTo({
                        url: '/pages/booszy/booszy',
                    })
                } else {
                    that.modalConfirm()
                    util.showFailToast({
                        title: '微信未注册商家'
                    });
                }
            }
        });
    },
    ruzhu: function () {
        var that = this
        if (wx.getStorageSync('user').qnote == 99 || that.data.user.qnote == 99) {
            wx.navigateTo({
                url: '/pages/user/zhuczc',
            })
        } else {
            http.request({
                url: '/getQbusiness',
                data: {
                    userId: wx.getStorageSync('user').id || that.data.user.id,
                },
                success: function (data) {
                    if (data.length != 0) {
                        wx.setStorageSync('shop', data[0])
                        wx.showModal({
                            title: '系统提示',
                            content: '当前微信已注册商户，是否登录？',
                            success(res) {
                                if (res.confirm) {
                                    wx.showLoading({
                                        title: '正在登录',
                                    })
                                    setTimeout(function () {
                                        wx.reLaunch({
                                            url: '/pages/booszy/booszy',
                                        })
                                    }, 1000);
                                }
                            }
                        })
                    } else if (wx.getStorageSync('user').qnote == 2) {
                        wx.navigateTo({
                            url: '/pages/user/zhuczc',
                        })
                    } else {
                        wx.navigateTo({
                            url: '/pages/user/shangjrz',
                        })
                    }
                }
            });
        }

    },
    /*
    短信验证
    */
    getCodeFun: function () {
        var that = this;
        if (!that.data.newPhone) {
            wx.showToast({
                title: '请输入注册手机号',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        http.request({
            url: '/sendSMS',
            data: {
                phone: that.data.newPhone,
            },
            success: function (data) {
                that.data.strCode = data;
                that.setData({
                    isCodeN: true,
                    isCodeT: false,
                    strCode: data
                })
                var i = 60;
                var time = setInterval(function () {
                    that.setData({
                        codeText: i
                    })
                    if (i < 1) {
                        that.setData({
                            isCodeN: false,
                            isCodeT: true,
                            strCode: "lanlan"
                        })
                        clearInterval(time);
                    }
                    i--;
                }, 1000)
            }
        });
    },
    inputPhone: function (e) {
        this.data.isPhone = false;
        var newPhone = e.detail.value;
        if (newPhone.length < 11) {
            return;
        } else if (newPhone.length == 11) {
            if (!util.isPhone(newPhone)) {
                wx.showToast({
                    title: '电话号码格式错误',
                    image: '/images/search_no.png',
                    duration: 2000
                })
            } else {
                this.data.newPhone = newPhone;
            }
        }
    },
    inputCode: function (e) {
        var that = this;
        var newCode = e.detail.value;
        if (newCode.length < 4) {
            return;
        } else if (newCode.length == 4) {
            if (newCode == this.data.strCode) {
                this.data.isPhone = true;
                wx.showToast({
                    title: '验证成功',
                    duration: 2000
                })
                that.setData({
                    isCodeN: true,
                    isCodeT: false,
                    strCode: "lanlan"
                })
            } else {
                util.showFailToast({
                    title: '验证码错误!',
                    duration: ''
                });
            }
        }
    },
})
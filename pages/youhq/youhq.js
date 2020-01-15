//index.js
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
//const Quantity = require('../../component/quantity/index');
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
const timeStamp = require("../../utils/time.js");
var app = getApp();
Page({
    data: {
        statusBarHeight: app.globalData.statusBarHeight,
        window_width: app.globalData.window_width,
        circular: true,
        vertical: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        functions: [],
        paixu: ['网红店铺', '人气最多', '最新入驻', '最低消费'],
        luntan: 1,
        djq: 1,
        topNum: 0,
        modalHidden: true,
        djtc: true,
        goodsList: [{
            actEndTime: '2018-12-14 18:00:00.0'
        }],
        actEndTime: [],
        actEndTimeList: [],
        host: constant.imghost,
        width: app.systemInfo.windowWidth,
        height: app.systemInfo.windowHeight,
        countDownList: [],
        banner: [],
        yhj: [],
        djj: [],
        page: 0,
        limit: 20,
        noinfo: false,
        load: true,
        //设置数据加载状态组件的状态  1加载中  2自己内容
        //-1加载错误  0数据为空   默认就是2  自定义图片和文字3
        empty: app.globalData.content,
        //请求错误提示的图片
        imgLayouSrc: app.globalData.imgLayouSrc,
        //请求错误时提示的文字
        titleLayou: app.globalData.titleLayou,
        showGetUser: false
    },
    bindGetUserInfo: function (e) {
        var that = this;
        wx.getSetting({
            success: function (res) {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称
                    wx.getUserInfo({
                        success: function (res) {
                            that.onLoad()
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
                                        wx.setStorageSync('user', data[0]);
                                        that.setData({
                                            user: wx.getStorageSync('user')
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
                    })
                }
            }
        })
    },
    getUser(e) {
        if (e.detail.errMsg === 'getUserInfo:ok') {
            this.setData({
                showGetUser: false
            })
        }
        this.bindGetUserInfo()
    },
    sousuo(e) {
        wx.navigateTo({
            url: '../storelist/storelist?typeid=999&name=搜索店铺',
        })
    },
    onLoad: function () {
        var that = this;
        this.setData({
            timer: this.showImg()
        })
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
    },
   //图片懒加载
    showImg() {
        var that = this;
        var timer;
        return function () {
            //每次滚动条触发事件就先清除定时器，让最后一次执行的事件才生效
            if (timer) {
                clearTimeout(timer)
            }
            timer = setTimeout(function () {
                //获取类名为img的元素距离顶部的高度
                wx.createSelectorQuery().selectAll('.aspectFill').boundingClientRect((ret) => {
                    // 页面的可视高度
                    let height = that.data.height
                    //懒加载图片的总数
                    var arr = that.data.yhj.length == 0 ? that.data.djj : that.data.yhj;
                    //计录上一次懒加载的索引，下次就可以从记录当中取出作为循环判断的条件
                    var num = 0;
                    ret.forEach((item, index) => {
                        //判断是优惠卷还是代金劵
                        var itemStr = that.data.yhj.length == 0 ? item.top - 220 <= height : item.top <= height
                        if (itemStr) {
                            // 判断是否在显示范围内
                            num++;
                            //让当前的懒加载图片显示
                            arr[index].show = true
                        }
                    })
                    //判断是商家的代金券还是优惠券
                    if (that.data.yhj.length == 0) {
                        that.setData({
                            djj: arr,
                            defaultNum: num
                        })
                    } else {
                        that.setData({
                            yhj: arr,
                            defaultNum: num
                        })
                    }
                }).exec()
            }, 200)
        }
    },
   //emptyCallback重新加载回调函数
    emptyCallback(e) {
        this.onLoad()
    },
    bindPickerChange(e) {
        var that = this
        var tp = e.currentTarget.dataset.luntan
        var id = that.data.functions[e.detail.value].id
        that.setData({
            yhj: [],
            djj: [],
            luntan: tp,
            index: e.detail.value
        })
        if (tp == 2) {
            http.request({
                url: '/getQcoupons',
                data: {
                    lat: wx.getStorageSync('latitude'),
                    lng: wx.getStorageSync('longitude'),
                    bstate: 2,
                    typeId: that.data.djq,
                    del: 1,
                    orderstr: 'limit ' + that.data.page * that.data.limit + ',' + that.data.limit,
                    state: id
                },
                success: function (e) {
                    if (e.length == 0) {
                        that.setData({
                            noinfo: true,
                            load: false
                        })
                        return
                    } else {
                        that.data.yhj = [];
                        that.data.djj = [];
                        for (var i = 0; i < e.length; i++) {
                            e[i].time = timeStamp.timeStamp(e[i].time).substr(0, 10)
                            e[i].endTime = timeStamp.timeStamp(e[i].endTime).substr(0, 10)
                            if (e[i].typeId == 1) {
                                that.data.yhj.push(e[i]);
                            } else if (e[i].typeId == 2) {
                                e[i].number = parseInt(e[i].number / e[i].surplus * 100)
                                that.data.djj.push(e[i]);
                            }
                        }
                        that.setData({
                            load: false,
                            noinfo: e.length < that.data.limit ? true : false,
                            yhj: that.data.yhj,
                            djj: that.data.djj,
                        })
                    }
                }
            })
        }
    },
    qj: function (e) {
        var that = this;
        var yhjid = e.currentTarget.dataset.id
        var qshopid = e.currentTarget.dataset.qshopid
        http.request({
            url: '/getQuserCoupon',
            data: {
                quserid: wx.getStorageSync('user').id,
                qcouponid: yhjid
            },
            success: function (e) {
                if (e.length != 0) {
                    wx.showToast({
                        title: '已经领过了',
                        image: '/images/search_no.png',
                        duration: 2000
                    })
                } else {
                    http.request({
                        url: '/insertQuserCoupon',
                        data: {
                            quserid: wx.getStorageSync('user').id,
                            qstoreId: qshopid,
                            qcouponid: yhjid,
                            qstatus: 1
                        },
                        success: function (e) {
                            wx.showToast({
                                title: '领取成功',
                                image: '/images/search_no.png',
                                duration: 2000
                            })
                            wx.navigateTo({
                                url: '/pages/shangjzy/shangjzy?id=' + qshopid,
                            })
                        }
                    })
                }
            }
        })
    },
    luntan: function (e) {
        this.setData({
            luntan: e.currentTarget.dataset.luntan
        })
        this.shuju();
    },
    djq: function (e) {
        this.setData({
            djq: e.currentTarget.dataset.djq
        })
        this.shuju();
    },
    todp: function (e) {
        wx.navigateTo({
            url: e.currentTarget.dataset.appid,
        })
    },
    onShow: function () {
        this.shuju();
    },
    onScroll: util.throttle(function (e) {
        var that = this
        that.setData({
            load: true
        })
        that.data.page++
        http.request({
            url: '/getQcoupons',
            data: {
                lat: wx.getStorageSync('latitude'),
                lng: wx.getStorageSync('longitude'),
                bstate: 2,
                typeId: that.data.djq,
                del: 1,
                orderstr: 'limit ' + that.data.page * that.data.limit + ',' + that.data.limit
            },
            success: function (e) {
                if (e.length == 0) {
                    that.setData({
                        noinfo: true,
                        load: false
                    })
                    return
                } else {
                    for (var i = 0; i < e.length; i++) {
                        e[i].time = timeStamp.timeStamp(e[i].time).substr(0, 10)
                        e[i].endTime = timeStamp.timeStamp(e[i].endTime).substr(0, 10)
                        if (e[i].typeId == 1) {
                            that.data.yhj.push(e[i]);
                        } else if (e[i].typeId == 2) {
                            e[i].number = parseInt(e[i].number / e[i].surplus * 100)
                            that.data.djj.push(e[i]);
                        }
                    }
                    that.setData({
                        yhj: that.data.yhj,
                        djj: that.data.djj,
                        noinfo: e.length < that.data.limit ? true : false,
                        load: false
                    })
                }
            }
        })
    }, 2000),
    shuju: function () {
        var that = this;
        that.setData({
            page: 0
        })
        //菜单栏
        http.request({
            url: '/getQbusinessType',
            data: {
                uniacid: 2339
            },
            success: function (e) {
                that.setData({
                    functions: e.data,
                })
            },
        }, false, that);
        //优惠券页轮播图
        http.request({
            url: '/getQbanner',
            data: {
                state: 1,
                type: 6
            },
            success: function (e) {
                that.setData({
                    banner: e
                })
            },
        }, false, that);
        //优惠券
        http.request({
            url: '/getQcoupons',
            data: {
                lat: wx.getStorageSync('latitude'),
                lng: wx.getStorageSync('longitude'),
                bstate: 2,
                typeId: that.data.djq,
                del: 1,
                orderstr: 'limit ' + that.data.page * that.data.limit + ',' + that.data.limit
            },
            success: function (e) {
                //页面首次加载渲染懒加载
                that.data.timer();
                that.data.yhj = [];
                that.data.djj = [];
                for (var i = 0; i < e.length; i++) {
                    e[i].time = timeStamp.timeStamp(e[i].time).substr(0, 10)
                    e[i].endTime = timeStamp.timeStamp(e[i].endTime).substr(0, 10)
                    if (e[i].typeId == 1) {
                        that.data.yhj.push(e[i]);
                    } else if (e[i].typeId == 2) {
                        e[i].number = parseInt(e[i].number / e[i].surplus * 100)
                        that.data.djj.push(e[i]);
                    }
                }
                that.setData({
                    load: false,
                    yhj: that.data.yhj,
                    djj: that.data.djj,
                })
            },
        }, false, that);
    },
    shouye(e) {
        var id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: '/pages/shangjzy/shangjzy?id=' + id,
        })
    },
    gmdjq(e) {
        var id = e.currentTarget.dataset.id
        var qshopid = e.currentTarget.dataset.qshopid
        wx.navigateTo({
            url: '/pages/logs/logs?id=' + id + '&qshopid=' + qshopid,
        })
    },
    stopPageScroll() {
        return
    },
    // 获取滚动条当前位置
    scrolltoupper: function () {
        //触发懒加载事件
        this.data.timer()
        util.throttle(function (e) {
            if (e.detail.scrollTop > 100) {
                this.setData({
                    floorstatus: true
                });
            } else {
                this.setData({
                    floorstatus: false
                });
            }
        }, 10000)
    },
    //回到顶部
    goTop: function (e) { // 一键回到顶部
        this.setData({
            topNum: this.data.topNum = 0
        });
    },
    timeFormat(param) { //小于10的格式化函数
        return param < 10 ? '0' + param : param;
    },
    countDown() { //倒计时函数
        // 获取当前时间，同时得到活动结束时间数组
        let newTime = new Date().getTime();
        let endTimeList = this.data.actEndTimeList;
        let countDownArr = [];
        // 对结束时间进行处理渲染到页面
        endTimeList.forEach(o => {
            let endTime = new Date(o).getTime();
            let obj = null;
            // 如果活动未结束，对时间进行处理
            if (endTime - newTime > 0) {
                let time = (endTime - newTime) / 1000;
                // 获取天、时、分、秒
                let day = parseInt(time / (60 * 60 * 24));
                let hou = parseInt(time % (60 * 60 * 24) / 3600);
                let min = parseInt(time % (60 * 60 * 24) % 3600 / 60);
                let sec = parseInt(time % (60 * 60 * 24) % 3600 % 60);
                obj = {
                    day: this.timeFormat(day),
                    hou: this.timeFormat(hou),
                    min: this.timeFormat(min),
                    sec: this.timeFormat(sec)
                }
            } else { //活动已结束，全部设置为'00'
                obj = {
                    day: '00',
                    hou: '00',
                    min: '00',
                    sec: '00'
                }
            }
            countDownArr.push(obj);
        })
        // 渲染，然后每隔一秒执行一次倒计时函数
        this.setData({
            countDownList: countDownArr
        })
        setTimeout(this.countDown, 1000);
    },
    fucClick(event) {
        const id = event.currentTarget.dataset.id;
        const name = event.currentTarget.dataset.name;
    },
    bannertz: function (e) {
        const id = e.currentTarget.dataset.spid;
        if (id != null) {
            wx.navigateTo({
                url: '../goods/goods?id=' + id,
            })
        }
    },
    goodDetail(e) {
        wx.navigateTo({
            url: '../goods/goods?id=' + e.currentTarget.dataset.id,
        })
    }
})
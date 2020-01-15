//index.js
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
//const Quantity = require('../../component/quantity/index');
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
const time = require("../../utils/time.js");
const sensitive = require('../../utils/sensitive')
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
        modalHidden: true,
        fenxiang: false,
        tzid: 0, //帖子id
        hbid: 0, //红包ID
        dz: false,
        sc: false,
        //hb: true,
        qhb: false,
        scid: 0,
        hbje: 0,
        hbzs: 0, //红包总数
        hbyq: 0, //已领数量
        hbzje: 0, //红包金额
        host: constant.imghost,
        width: app.systemInfo.windowWidth,
        height: app.systemInfo.windowHeight,
        information: [],
        hbdetails: [],
        collect: [],
        hxm: '',
        qtitle: '',
        icon: wx.getStorageSync('userInfo').avatarUrl,
        dataNow:Date.now()
    },
    qtitle(e) {
        this.setData({
            qtitle: e.detail.value
        })
    },
    tjqtitle(e) {

    },
    sjxq(e) {
        wx.navigateTo({
            url: '/pages/shangjzy/shangjzy?id=' + e.currentTarget.dataset.spid
        })
    },
    // 预览图片
    previewImg: function (e) {
        var srcs = []
        e.currentTarget.dataset.srcs.forEach(item => {
            srcs.push(this.data.host + item)
        })

        wx.previewImage({
            current: this.data.host + e.currentTarget.dataset.src,
            urls: srcs,
        })
    },
    onLoad: function (e) {
        var that = this;
        that.data.tzid = e.id
    },
    /**
     *监听分享
     */

    onShareAppMessage(res) {
        if (res.from === 'button') {
            var record = {};
            record.qbusinessid = this.data.information.storeId
            record.qmiaoshu = '分享了你的信息'
            record.qtype = 6;
            http.insertUserRecord(record);
        }
        return {
            title: '您的好友向您推荐了信息,点击查看',
            // path:'/pages/index/index'
            path: 'pages/shangjhb/shangjhb?id=' + this.data.information.id
        }
    },
    onShow: function () {
        var that = this;
        that.shuju();
        // this.goTop();
    },
    shuju: function () {
        var that = this;
        //红包信息
        http.request({
            url: '/getQinformation',
            data: {
                id: that.data.tzid,
            },
            success: function (e) {
                var record = {};
                record.qbusinessid = e[0].storeId;
                record.qinformationid = e[0].id
                record.qmiaoshu = '查看了你的信息'
                record.qtype = 3;
                http.insertUserRecord(record);
                for (var i = 0; i < e.length; i++) {
                    e[i].img = e[i].img.split(",")
                    e[i].time = time.timeStamp(e[i].time)
                }
                that.setData({
                    information: e[0]
                })
            },
        });
        //店铺信息评论
        http.request({
            url: '/getQcomment',
            data: {
                qnote: 1,
                qidd: that.data.tzid,
                orderstr: 'order by qdate desc'
            },
            success: function (e) {
                console.log('评论信息', e)
                for (var i = 0; i < e.length; i++) {
                    e[i].qdate = time.timeStamp(e[i].qdate)
                }
                that.setData({
                    comment: e
                })
            },
        });
        //是否收藏 点赞
        http.request({
            url: '/getQcollect',
            data: {
                qscid: that.data.tzid,
                qtype: 2,
                qstatus: 1,
                qdelete: 1,
                orderstr: 'order by a.id desc'
            },
            success: function (e) {
                if (e.length != 0) {
                    for (var i = 0; i < e.length; i++) {
                        if (e[i].qopenid == app.globalData.userOpen.openid) {
                            that.setData({
                                scid: e[i].id,
                                sc: true
                            })
                        }
                    }
                } else {
                    that.setData({
                        sc: false,

                    })
                }
            }
        })
        http.request({
            url: '/getQcollect',
            data: {
                qscid: that.data.tzid,
                qtype: 2,
                qstatus: 2,
                qdelete: 1,
                orderstr: 'order by a.id desc'
            },
            success: function (e) {
                if (e.length != 0) {
                    for (var i = 0; i < e.length; i++) {
                        if (e[i].qopenid == app.globalData.userOpen.openid) {
                            that.data.dz = true
                            e[i].qicon = e[0].qicon
                            e[0].qicon = wx.getStorageSync('userInfo').avatarUrl
                        }
                    }
                    that.setData({
                        dz: that.data.dz,
                        collect: e,
                    })
                } else {
                    that.setData({
                        dz: false
                    })
                }
            }
        })
        //红包记录
        http.request({
            url: '/getQhbdetails',
            data: {
                qid: that.data.tzid,
                qstatus: 1,
                qtype: 2
            },
            success: function (e) {
                if (e.length != 0) {
                    that.data.hbid = e[0].tzId
                    that.data.hbzs = e[0].qnum;
                    that.data.hbyq = e.length;
                    that.data.hbzje = e[0].qsum;
                    if (that.data.hbzs < that.data.hbyq) {
                        that.setData({
                            hbid: e[0].tzId,
                            hbdetails: e,
                            qhb: false,
                            hbzs: that.data.hbzs,
                            hbyq: that.data.hbyq
                        })
                    } else
                        var hbsum = 0;
                    for (var i = 0; i < e.length; i++) {
                        hbsum += e[i].money
                    }
                    if (hbsum >= e[0].qsum) {
                        http.request({
                            url: '/updateQhongbao',
                            data: {
                                id: that.data.hbid,
                                qstatus: 3,
                            },
                            success() {
                            }
                        })
                    }
                    if (that.data.hbzs != that.data.hbyq) {
                        var hbzs = e[0].qnum
                        var hbyq = e.length
                        // var a = hbzs == hbyq ? false : true
                        var a = true
                        for (var i = 0; i < e.length; i++) {
                            if (e[i].qopenid === app.globalData.userOpen.openid) {
                                a = false
                            }
                        }
                        that.setData({
                            hbid: e[0].tzId,
                            hbdetails: e,
                            qhb: a,
                            hbzs: hbzs,
                            hbyq: hbyq
                        });
                    } else {
                        that.setData({
                            hbid: e[0].tzId,
                        });
                    }

                } else {
                    http.request({
                        url: '/getQhongbao',
                        data: {
                            qid: that.data.tzid,
                            qstatus: 1,
                            qtype: 2
                        },
                        success: function (e) {
                            if (e.length > 0) {
                                that.data.hbzs = e[0].qnum;
                                that.data.hbzje = e[0].qsum;
                                that.data.hbyq = 0;
                                that.setData({
                                    hbid: e[0].id,
                                    hongbao: e,
                                    qhb: true
                                })
                            }
                        }
                    })
                }
            }
        })
    },

    shouye: function () {
        wx.switchTab({
            url: '/pages/index/index',
        })
    },
    dianhua: function () {
        wx.makePhoneCall({
            phoneNumber: this.data.information.userTel
        })
    },
    getPhoneNumber(e) {
        if (e.detail.errMsg === 'getPhoneNumber:ok') {
            this.setData({
                phone: true
            })
        }
    },
    daohang: function () {
        wx.openLocation({ //​使用微信内置地图查看位置。
            latitude: parseFloat(this.data.information.lat),
            longitude: parseFloat(this.data.information.lng),
            name: this.data.information.address,
            address: this.data.information.address,
        })
    },
    dz: util.throttle(function (e) {
        var that = this
        if (!that.data.dz) {
            http.request({
                url: '/insertQcollect',
                data: {
                    qopenid: app.globalData.userOpen.openid,
                    qscid: that.data.tzid,
                    qstatus: 2,
                    qtype: 2
                },
                success: function (e) {
                    wx.showToast({
                        title: '点赞成功',
                        icon: 'success',
                        duration: 2000
                    })
                    //刷新收藏数据
                    http.request({
                        url: '/getQcollect',
                        data: {
                            qscid: that.data.tzid,
                            qtype: 2,
                            qstatus: 2,
                            qdelete: 1,
                            orderstr: 'order by a.id desc'
                        },
                        success: function (e) {
                            that.data.information.givelike = parseInt(that.data.information.givelike) + 1
                            that.setData({
                                information: that.data.information,
                                dz: true,
                                collect: e,
                            })
                            http.request({
                                url: '/updateQinformation',
                                data: {
                                    id: that.data.tzid,
                                    givelike: 1
                                },
                                success: function (e) {
                                },
                            });
                        },
                    });
                },
            });
        }
    }, 1000),
    sc: util.throttle(function (e) {
        var that = this
        if (!that.data.sc) {
            http.request({
                url: '/insertQcollect',
                data: {
                    qopenid: app.globalData.userOpen.openid,
                    qscid: that.data.tzid,
                    qstatus: 1,
                    qtype: 2
                },
                success: function (e) {
                    wx.showToast({
                        title: '收藏成功',
                        icon: 'success',
                        duration: 2000
                    })
                    that.setData({
                        sc: true
                    })
                    //刷新收藏数据
                },
            });
        } else {
            wx.showModal({
                title: '系统提示',
                content: '是否取消收藏',
                success(res) {
                    if (res.confirm) {
                        http.request({
                            url: '/updateQcollect',
                            data: {
                                id: that.data.scid,
                                qdelete: 2
                            },
                            success: function (e) {
                                wx.showToast({
                                    title: '已取消收藏',
                                    icon: 'success',
                                    duration: 2000
                                })
                                // //刷新收藏数据
                                that.setData({
                                    sc: false
                                })
                            },
                        });
                    } else if (res.cancel) {
                        return
                    }
                }
            })
        }
    }, 1000),

    //抢红包
    qhb: function () {
        var that = this
        that.setData({
            qhb: true
        })
    },
    //拆红包
    chb: function () {
        var that = this
        that.setData({
            qhb: false,
        })
        var hbsum = 0
        if ((that.data.hbyq + 1) == that.data.hbzs) {
            for (var i = 0; i < that.data.hbdetails.length; i++) {
                hbsum = hbsum + that.data.hbdetails[i].money
            }
            that.data.hbje = that.data.hbzje - hbsum

        } else {
            that.data.hbje = util.sjhb(that.data.hbzje - hbsum, that.data.hbzs, that.data.hbyq + 1)
        }
        if (that.data.hbzs - that.data.hbyq == 1) {
            that.data.hbje = that.data.hbzje - hbsum
        }
        var n = 0;
        while (that.data.hbje < 0.01 && n < 10) {
            that.data.hbje = util.sjhb(that.data.hbzje - hbsum, that.data.hbzs, that.data.hbyq + 1)
            n++
        }
        if (that.data.hbje > 0) {
            http.request({
                url: '/insertQhbdetails',
                data: {
                    userId: wx.getStorageSync('user').id,
                    tzId: that.data.hbid,
                    money: Number(that.data.hbje).toFixed(2),
                    uniacid: 1
                },
                success: function (e) {
                    that.setData({
                        qhb: false,
                    })
                    wx.navigateTo({
                        url: '/pages/shangjhb/hongbaoxq?qtype=2&qid=' + that.data.tzid + '&logo=' + that.data.information.logo + '&storeName=' + that.data.information.storeName,
                    })
                },
            });
        } else {
            http.request({
                url: '/updateQhongbao',
                data: {
                    id: that.data.hbid,
                    qstatus: 3,
                },
                success() {
                }
            })
            wx.showToast({
                title: '红包已被抢完',
                icon: "none"
            })
        }
    },
    //加微信
    addwx: function () {
        wx.setClipboardData({
            data: 'wx520131400',
            success(res) {
                wx.showToast({
                    title: '已复制微信',
                    icon: 'success',
                    duration: 2000
                })
            }
        })


    },
    lxsj: function () {
        this.dianhua()
    },
    fx: function () {
        this.setData({
            fenxiang: true
        })
    },
    gb: function () {
        this.setData({
            qhb: false
        })
    },

    /**
     * 点击取消
     */
    modalCandel: function () {
        this.setData({
            modalHidden: true
        })
    },
    //评论
    pinglun: function () {
        this.setData({
            modalHidden: false
        })
    },
    /**
     *  点击确认
     */
    modalConfirm: function (e) {
        var that = this
        if (that.data.qtitle == '') {
            wx.showToast({
                title: '请输入评论详情',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        //检测表单是否包含敏感词
        if (sensitive.indexOf(that.data.qtitle) != -1) {
            util.showFailToast({
                title: '评论包含特殊字符'
            });
            return
        }
        http.request({
            url: '/textChecking',
            data: {
                content: that.data.qtitle
            },
            success(res) {
                http.request({
                    url: '/insertQcomment',
                    data: {
                        qopenid: app.globalData.userOpen.openid,
                        qicon: app.globalData.userInfo.avatarUrl,
                        qname: app.globalData.userInfo.nickName,
                        qidd: that.data.tzid,
                        qnote: 1,
                        qcontent: that.data.qtitle,
                    },
                    success: function (e) {
                        wx.showToast({
                            title: '评论成功',
                            icon: 'success',
                            duration: 2000
                        })
                        //店铺信息评论
                        http.request({
                            url: '/getQcomment',
                            data: {
                                qnote: 1,
                                qidd: that.data.tzid,
                                orderstr: 'order by qdate desc'
                            },
                            success: function (e) {
                                for (var i = 0; i < e.length; i++) {
                                    e[i].qdate = time.timeStamp(e[i].qdate)
                                }
                                that.setData({
                                    comment: e,
                                    qtitle: ''
                                })
                            },
                        });

                    }
                });
                that.setData({
                    modalHidden: true
                })
            }
        })
    },

    hxm: function (e) {
        var that = this
        that.setData({
            hxm: e.detail.value
        })
    },
    jubao: function (e) {
        wx.navigateTo({
            url: `/pages/shangjhb/report?information= ${JSON.stringify(e.currentTarget.dataset.information)}`,
        })
    },

})
//index.js
var village_LBS = function (that) {
    wx.getLocation({
        type: 'gcj02', //返回可以用于wx.openLocation的经纬度
        success: function (res) {
            that.getCity(res.latitude, res.longitude);
            wx.setStorageSync('latitude', res.latitude); //存储latitude
            wx.setStorageSync('longitude', res.longitude); //存储longitude
        }
    })
}
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
const timeStamp = require("../../utils/time.js");
var app = getApp();
var village_LBS = function (that) {
    wx.getLocation({
        type: 'gcj02', //返回可以用于wx.openLocation的经纬度
        success: function (res) {
            wx.setStorageSync('latitude', res.latitude); //存储latitude
            wx.setStorageSync('longitude', res.longitude); //存储longitude
            that.getCity(wx.getStorageSync('latitude'), wx.getStorageSync('longitude'));
        }
    })
}
Page({
    data: {
        statusBarHeight: app.globalData.statusBarHeight,
        toView: 'green',
        scrollTop: 100,
        scrollLeft: 0,
        window_width: app.globalData.window_width,
        circular: true,
        vertical: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        luntan: 1,
        dongtai: 1,
        // nameList: ['欢迎光临本店!', '欢迎光临本店!'],
        topNum: 0,
        kaopu: false,
        sc: false,
        djtc: true,
        tzid: 0, //商铺id
        hbid: 0, //红包ID
        hbje: 0, //随机金有
        hbzs: 0, //红包总数
        hbyq: 0, //已领数量
        hbzje: 0, //红包金额
        qhb: false,
        hbdetails: [],
        hongbao: [],
        host: constant.imghost,
        width: app.systemInfo.windowWidth,
        height: app.systemInfo.windowHeight,
        countDownList: [],
        // business: [],
        banner: [],
        imghost: constant.imghost,
        sjopenid: '',
        dianhua: false,
        floorstatus: false,
        indexL: 0,
        //商品未加载出来时显示的转圈圈动画
        load: true,
        //是否显示加载动画
        isLoading: true,
        //当前展示是掌柜推荐还是商品的分类
        luntan: 1,
//设置数据加载状态组件的状态  1加载中  2自己内容  
        //-1加载错误  0数据为空   默认就是2  自定义图片和文字3
        empty: 2,
        //请求错误提示的图片
        imgLayouSrc: app.globalData.imgLayouSrc,
        //请求错误时提示的文字
        titleLayou: app.globalData.titleLayou,
        dataNow:Date.now()
    },
    // 获取滚动条当前位置
    onPageScroll: function (e) {
        this.data.timer()
        if (e.scrollTop > 50) {
            if (this.data.floorstatus) {
                return
            }
            this.setData({
                floorstatus: true
            });
        } else {
            this.setData({
                floorstatus: false
            });
        }
    },
    fanhui() {
        if (this.data.pagesList.length > 1) {
            wx.navigateBack()
        } else {
            wx.switchTab({
                url: '/pages/index/index'
            })
        }
    },
    daodianmaidan(e) {
        wx.navigateTo({
            url: `/pages/pics/gdal/gdal?business=` + e.currentTarget.dataset.business + '&id=' + e.currentTarget.dataset.id + '&logo=' + e.currentTarget.dataset.logo,
        })
    },
    /**
     *监听分享
     */
    onShareAppMessage(res) {
        if (res.from === 'button') {
            var record = {};
            record.qbusinessid = this.data.tzid
            record.qmiaoshu = '分享了你的店铺首页'
            record.qtype = 4;
            http.insertUserRecord(record);
        }
        return {
            title: '您的好友向您推荐了店铺[' + this.data.business.storeName + ']点击查看',
            path: 'pages/shangjzy/shangjzy?id=' + this.data.tzid + '&sjopenid=' + app.globalData.userOpen.openid
        }
    },
    //emptyCallback回调函数
    emptyCallback(e) {
        this.onLoad({id: this.data.tzid})
    },
    onLoad: function (option) {

        var pages = getCurrentPages();
        console.log(pages, '页面栈')
        // option={id: "31122"}
        //设置图片懒加载函数
        console.log(option)
        this.setData({
            timer: this.showImg(),
            pagesList: pages.splice(0, 2)
        })
        var that = this;
        that.setData({
            tzid: option.id
        })
        if (option.sjopenid != undefined) {
            that.setData({
                sjopenid: option.sjopenid
            })
        }
        wx.getSetting({
            success: (res) => {
                if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) { //非初始化进入该页面,且未授权
                    wx.showModal({
                        title: '是否授权当前位置',
                        content: '需要获取您的地理位置，请确认授权，否则地图功能将无法使用',
                        success: function (res) {
                            if (res.cancel) {
                            } else if (res.confirm) {
                                village_LBS(that);
                                wx.openSetting({
                                    success: function (data) {
                                        if (data.authSetting["scope.userLocation"] == true) {
                                            wx.showToast({
                                                title: '授权成功',
                                                icon: 'success',
                                                duration: 2000
                                            })
                                            //再次授权，调用getLocationt的API
                                            village_LBS(that);
                                        } else {
                                            wx.showToast({
                                                title: '授权失败',
                                                image: '/image/info.png',
                                                duration: 2000
                                            })
                                        }
                                    }
                                })
                            }
                        }
                    })
                } else if (res.authSetting['scope.userLocation'] == undefined) { //初始化进入
                    village_LBS(that);
                }
            }
        })
    },
    previewImg: function (e) {
        var srcs = e.currentTarget.dataset.srcs
        for (var i = 0; i < srcs.length; i++) {
            srcs[i] = this.data.imghost + srcs[i]
        }
        wx.previewImage({
            current: e.currentTarget.dataset.src,
            urls: srcs,
        })
    },
    shuju(e) {
        var that = this
        var record = {};
        record.qbusinessid = that.data.tzid;
        record.qmiaoshu = '查看了你的店铺首页';
        record.qtype = 1;
        http.insertUserRecord(record);
        http.request({
            url: '/getQbusiness',
            data: {
                id: that.data.tzid,
                state: 2,
                coordinates: wx.getStorageSync('latitude') + ',' + wx.getStorageSync('longitude'),
            },
            success: function (e) {
                if (e.length == 0) {
                    wx.showModal({
                        title: '系统提示',
                        content: '当前店铺已失效',
                        showCancel: false,
                        success(res) {
                            if (res.confirm) {
                                wx.switchTab({
                                    url: '/pages/index/index',
                                })
                            }
                        }
                    })
                } else {
                    var time = util.getNowDate().substring(11, 13);
                    if (e[0].yyzzImg != '') {
                        e[0].yyzzImg = e[0].yyzzImg.split(",")
                    }
                    if (e[0].img) {
                        e[0].img = e[0].img.split(",")
                    }
                    if (e[0].views > 10000) {
                        e[0].views = (e[0].views / 10000).toFixed(2) + '万'
                    }
                    var date = new Date()
                    //  为了准确获取到商家是否在营业时间
                    if (Number(date.getHours() + '.' + date.getMinutes()) > Number(e[0].startTime.replace(':', '.')) && Number(date.getHours() + '.' + date.getMinutes()) < Number(e[0].endTime.replace(':', '.'))) {
                        e[0].orderstr = true
                    } else {
                        e[0].orderstr = false
                    }
                    that.setData({
                        business: e[0],
                    });
                    http.request({
                        url: '/getQcoupons',
                        data: {
                            storeId: that.data.tzid,
                            del: 1

                        },
                        success: function (e) {
                            var yhqs = [];
                            var djqs = [];
                            for (var i = 0; i < e.length; i++) {
                                if (e[i].typeId == 2 && e[i].number > 0) {
                                    e[i].percent = e[i].number / e[i].surplus * 100
                                    yhqs.push(e[i]);
                                } else if (e[i].typeId == 1 && e[i].number > 0) {
                                    // e[i].number = e[i].number / e[i].surplus * 100
                                    djqs.push(e[i])
                                }
                                if (e[i].number === 0) {
                                    http.request({
                                        url: '/updateQcoupons',
                                        data: {
                                            id: e[i].id,
                                            del: 2
                                        },
                                        success: function (e) {
                                        }
                                    }, true)
                                }
                            }
                            that.setData({
                                yhqs: yhqs,
                                djqs: djqs,
                            });
                        }
                    }, true)

                    http.request({
                        url: '/getQprocedure',
                        data: {
                            storeId: that.data.tzid,
                            qstatus: 1,
                            state: 2,
                            isShow: 1,
                            orderstr: 'limit 0, 16'

                        },
                        success: function (e) {
                            for (var i = 0; i < e.length; i++) {
                                e[i].lbImgs = e[i].lbImgs.split(',')
                                e[i].imgs = e[i].imgs.split(',')
                            }
                            that.setData({
                                procedure: e,
                                load: false
                                //商户的商品数据请求回来后就让加载动画层消失
                            });
                        },
                        fail: function (err) {
                        }
                    }, true);
                    http.request({
                        url: '/getQprocedureType',
                        data: {
                            qshopid: that.data.tzid,
                            qposition: 2, //
                            qdelete: 1,
                            qsjid: 1
                        },
                        success: function (e) {
                            that.setData({
                                procedureType: e,
                                isLoading: false
                            })
                        }
                    }, true);
                    http.request({
                        url: '/getQcollect',
                        data: {
                            qscid: that.data.tzid,
                            qstatus: 2,
                            qdelete: 1,
                            orderstr: 'order by a.id desc'
                        },
                        success: function (e) {
                            for (var i = 0; i < e.length; i++) {
                                if (e[i].qopenid == app.globalData.userOpen.openid) {
                                    that.data.kaopu = true
                                    e[i].qicon = e[0].qicon
                                    e[0].qicon = wx.getStorageSync('userInfo').avatarUrl
                                }
                            }
                            that.setData({
                                kaopu: that.data.kaopu,
                                collects: e,
                                collectsNum: e.length,
                                isLoading: false
                            })
                        }
                    }, true)
                    http.request({
                        url: '/getQcollect',
                        data: {
                            qscid: that.data.tzid,
                            qopenid: app.globalData.userOpen.openid,
                            qstatus: 1,
                            qdelete: 1,
                        },
                        success: function (e) {
                            if (e.length != 0) {
                                that.setData({
                                    sc: true
                                })
                            }
                        }
                    }, true)
                    http.request({
                        url: '/getQinformation',
                        data: {
                            storeId: that.data.tzid,
                            state: 2
                        },
                        success: function (e) {
                            for (var i = 0; i < e.length; i++) {
                                e[i].img = e[i].img.split(",")
                                e[i].time = timeStamp.timeStamp(e[i].time)
                            }
                            that.setData({
                                information: e,
                            })
                        },
                    }, true);

                }

            }
        }, true)
    },
    leix(e) {
        var that = this
        let id = e.currentTarget.dataset.id
        let index = e.currentTarget.dataset.index
        this.setData({
            indexL: index
        })
        http.request({
            url: '/getQprocedure',
            data: {
                storeId: that.data.tzid,
                specId: id,
                qstatus: 1,
                state: 2,
            },
            success: function (e) {
                for (var i = 0; i < e.length; i++) {
                    e[i].lbImgs = e[i].lbImgs.split(',')
                    e[i].imgs = e[i].imgs.split(',')
                }
                that.setData({
                    procedures: e
                });
            }
        })

    },
    bindGetUserInfo: function (e) {
        var that = this;
        wx.getSetting({
            success: function (res) {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称
                    that.getCity(wx.getStorageSync('latitude'), wx.getStorageSync('longitude'));
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
                                                        wx.setStorageSync('user', e[0]); //存储user
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
                                                that.shuju()
                                            },

                                        })
                                    } else {
                                        wx.setStorageSync('user', e[0]); //存储user
                                        that.shuju()
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
                //获取类名未img的元素距离顶部的高度
                wx.createSelectorQuery().selectAll('.wddd').boundingClientRect((ret) => {
                    // 页面的可视高度
                    let height = that.data.height
                    //懒加载图片的总数
                    var arr = that.data.luntan == 1 ? that.data.procedure : that.data.procedures;
                    //计录上一次懒加载的索引，下次就可以从记录当中取出作为循环判断的条件
                    var num = 0;
                    ret.forEach((item, index) => {
                        if (item.top <= height) {
                            // 判断是否在显示范围内
                            num++;
                            //让当前的懒加载图片显示
                            arr[index].show = true
                        }
                    })
                    //如果当前的选项卡选中掌柜推荐则让掌柜推荐商品图片懒加载
                    if (that.data.luntan == 1) {
                        that.setData({
                            procedure: arr,
                            defaultNum: num
                        })
                        //如果当前的选项卡选中商品分类则让商品分类图片懒加载
                    } else if (that.data.luntan == 2) {
                        that.setData({
                            procedures: arr,
                            defaultNum: num
                        })
                    }
                }).exec()
            }, 150)
        }
    },
    //获取城市信息
    getCity: function (latitude, longitude) {
        var that = this
        var nowDate = util.getNowDate().substring(0, 10);
        var weekday = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
        var week = weekday[new Date(nowDate).getDay()]; //注意此处必须是先new一个Date
        var url = "https://api.map.baidu.com/geocoder/v2/";
        var params = {
            ak: "fxRrD1bFYROpGoBTYHCrD9QAP40TK5CK",
            output: "json",
            location: wx.getStorageSync('latitude') + ',' + wx.getStorageSync('longitude'),
        }
        wx.request({
            url: url,
            data: params,
            success: function (res) {
                var city = res.data.result.addressComponent.city;
                wx.setStorageSync('province', res.data.result.addressComponent.province);
                wx.setStorageSync('city', city);
                wx.setStorageSync('district', res.data.result.addressComponent.district);
                wx.setStorageSync('address', res.data.result.formatted_address);
                var district = res.data.result.addressComponent.district;
                var street = res.data.result.addressComponent.street;

                that.setData({
                    city: city,
                    district: district,
                    street: street,
                    nowDate: nowDate, //日期
                    week: week //周几
                })
                var descCity = city.substring(0, city.length - 1);
                //  that.getWeahter(descCity);
            },
            fail: function (res) {
            },
            complete: function (res) {
            },
        })
    },
    onReady: function () {
        var that = this;
    },
    luntan: function (e) {
        var that = this;
        this.setData({
            procedureType: that.data.procedureType
        })
        this.setData({
            luntan: e.currentTarget.dataset.luntan
        });
        var luntan = e.currentTarget.dataset.luntan;
        if (luntan == 2) {
            if (that.data.procedureType.length != 0) {
                http.request({
                    url: '/getQprocedure',
                    data: {
                        storeId: that.data.tzid,
                        specId: that.data.procedureType[0].id,
                        qstatus: 1,
                        state: 2,
                    },
                    success: function (e) {
                        for (var i = 0; i < e.length; i++) {
                            e[i].lbImgs = e[i].lbImgs.split(',')
                            e[i].imgs = e[i].imgs.split(',')
                        }
                        that.setData({
                            luntan: 2,
                            procedures: e,
                            indexL: 0
                        });
                    }
                }, true, "商家信息加载失败")
            }
        } else {
            that.setData({
                luntan: luntan
            })
        }

    },
    dongtai: function (e) {
        this.setData({
            dongtai: e.currentTarget.dataset.dongtai
        })
    },
    gutc() {
        this.setData({
            qhb: false,
        })
    },
    //拆红包
    chb: function () {
        var that = this;
        //每次点击领取的时候首先判断一下红包是否被删除，如果被删除的情况下就不再插入红包明细
        http.request({
            url: '/getQhongbao',
            data: {
                qid: that.data.business.id,
                id: that.data.hbid
            }, success(e) {
                //判断红包的状态是否为手动删除或者自动删除
                //手动删除：商家在红包未有人领取的情况下删除红包需要把红包的金额返回给商户
                //自动删除：商家中查看店铺红包或者红包记录的时候，进入页面就判断该店铺红包是否被领取完
                //如果该红包是被领取完的状态的话，就调用接口更改该红包的状态为(删除)
                if (e[0].qstatus == 3 || e[0].qstatus == 4) {
                    wx.showToast({
                        title: '红包已删除',
                        icon: "none"
                    })
                    that.setData({
                        qhb: false,
                    })
                } else {
                    that.setData({
                        qhb: false,
                    })
                    if ((that.data.hbyq + 1) == that.data.hbzs) {
                        console.log('进入一')
                        var hbsum = 0
                        for (var i = 0; i < that.data.hbdetails.length; i++) {
                            hbsum = hbsum + that.data.hbdetails[i].money
                        }
                        that.data.hbje = that.data.hbzje - hbsum
                    }
                    var sum = 0
                    for (var i = 0; i < that.data.hbdetails.length; i++) {
                        sum = sum + that.data.hbdetails[i].money
                    }
                    console.log('进入四', sum)
                    that.data.hbje = util.sjhb(that.data.hbzje - sum, that.data.hbzs, that.data.hbyq + 1)
                    var n = 0;
                    while (that.data.hbje < 0.01 && n < 10) {
                        that.data.hbje = util.sjhb(that.data.hbzje - sum, that.data.hbzs, that.data.hbyq + 1)
                        n++
                    }
                    if (that.data.hbzs - that.data.hbyq == 1) {
                        that.data.hbje = that.data.hbzje - sum
                    }
                    // }
                    console.log(that.data.hbje, 2)
                    if (e[0].qnum == 1) {
                        console.log('进入三')
                        that.data.hbje = e[0].qsum
                    }
                    console.log(that.data.hbje, 3)
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
                                    url: '/pages/shangjhb/hongbaoxq?qtype=1&qid=' + that.data.hbid + '&logo=' + that.data.business.logo + '&storeName=' + that.data.business.storeName,
                                })
                            },
                        });
                    } else {
                        wx.showToast({
                            title: '红包已被抢完',
                            icon: "none"
                        })
                    }
                }
            }
        })
    },

    daohang: function () {
        var arr = this.data.business.coordinates.split(',');
        wx.openLocation({ //​使用微信内置地图查看位置。
            latitude: parseFloat(arr[0]),
            longitude: parseFloat(arr[1]),
            name: this.data.business.storeName,
            address: this.data.business.address,
        })
    },
    dianhua: function () {
        wx.makePhoneCall({
            phoneNumber: this.data.business.tel
        })
    },
    dianhuatc() {
        this.setData({
            dianhua: this.data.dianhua ? false : true
        })
    },
    onShow: function () {
        var that = this
        // 查看是否授权
        wx.getSetting({
            success: function (res) {
                if (res.authSetting['scope.userInfo']) {
                    that.getCity(wx.getStorageSync('latitude'), wx.getStorageSync('longitude'));
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称
                    wx.getUserInfo({
                        lang: 'zh_CN',
                        success: function (res) {
                            var objz = {};
                            objz.avatarUrl = res.userInfo.avatarUrl;
                            objz.nickName = res.userInfo.nickName;
                            app.globalData.userInfo = res.userInfo;
                            wx.setStorageSync('userInfo', objz); //存储userInfo
                        }
                    });

                    that.setData({
                        phone: wx.getStorageSync('user').qphone,
                        canIUse: false
                    })
                    // that.shuju()
                } else {
                    that.setData({
                        canIUse: true
                    })
                }
            }
        })
        http.request({
            url: '/getQhbdetails',
            data: {
                qid: that.data.tzid,
                qstatus: 1,
                qtype: 1
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
                    }
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
                    console.log(hbsum, e[0].qsum)
                    if (that.data.hbzs != that.data.hbyq) {
                        var hbzs = e[0].qnum
                        var hbyq = e.length
                        var a = true
                        for (var i = 0; i < e.length; i++) {
                            if (e[i].qopenid === app.globalData.userOpen.openid) {
                                a = false
                            }
                        }
                        //如果以前的红包领取超出的时候删除店铺的红包
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
                            qtype: 1
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
                    }, true)
                }
            }
        }, true, that)
        this.shuju()
    },
    gmdjq(e) {
        var id = e.currentTarget.dataset.id
        var qshopid = e.currentTarget.dataset.qshopid
        wx.navigateTo({
            url: '/pages/logs/logs?id=' + id + '&qshopid=' + qshopid,
        })
    },
    gocart() {
        wx.navigateTo({
            url: "/pages/shopcart/shopcart"
        })
    },
    //是否加入购物车
    icongoCart(e) {
        //e.currentTarget.dataset.p获取加入购物车商品数据
        var p = e.currentTarget.dataset.p;

        //判断是否只有一个默认的规格
        function shot() {
            wx.hideLoading()
            setTimeout(() => {
                wx.showToast({
                    title: '添加到购物车成功',
                    icon: 'none',
                })
                setTimeout(() => {
                    wx.hideToast()
                }, 1700)
            }, 0)
        }

        if (p.pcolor.length <= 1 && p.ptype.length <= 1) {
            http.request({
                url: '/insertQorder',
                data: {
                    qsubmitter: app.globalData.userOpen.openid,
                    qsubmitterName: app.globalData.userInfo.nickName,
                    qsubmitterIcon: app.globalData.userInfo.avatarUrl,
                    qprocedureId: p.id,
                    qprocedureName: p.goodsName + '【规格:' + p.ptype[0].qtypeName + ',颜色:' + p.pcolor[0].qtypeName + '】',
                    qprocedureImg: p.lbImgs[0],
                    qsum: p.ptype[0].qprice * 1,
                    qtotal: 1,
                    qstatus: 7,
                    qshopid: p.storeId,
                    qyunfei: 0,
                    cost: p.ptype[0].qprice
                },
                success: function (data) {
                    setTimeout(() => {
                        shot()
                    }, 100)
                }
            }, true)
        } else {
            wx.navigateTo({
                url: `/pages/goods/goods?id=${p.id}&qshopid=${p.storeId}`
            })
        }
    },
    qyhq: function (e) {
        var that = this;
        var yhjid = e.currentTarget.dataset.id
        var qshopid = that.data.tzid
        http.request({
            url: '/getQuserCoupon',
            data: {
                quserid: wx.getStorageSync('user').id,
                qcouponid: yhjid
            },
            success: function (e) {
                if (e.length != 0) {
                    setTimeout(function () {
                        util.showFailToast({
                            title: '已经领过了'
                        })
                    }, 200);
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
                            //获取当前的优惠卷列表
                            var yhjs = that.data.yhqs;
                            for (var i = 0; i < yhjs.length; i++) {
                                console.log(yhjs[i], yhjid)
                                if (yhjs[i].id == yhjid) {
                                    if (yhjs[i].number - 1 === 0) {
                                        http.request({
                                            url: '/updateQcoupons',
                                            data: {
                                                id: yhjs[i].id,
                                                del: 2
                                            }
                                        }, true)
                                    }
                                    yhjs[i].percent = (yhjs[i].number - 1) / yhjs[i].surplus * 100;
                                    console.log(yhjs[i].percent)
                                    if (yhjs[i].percent <= 0) {
                                        yhjs.splice(i, 1)
                                    }
                                    break;
                                }
                            }
                            that.setData({
                                yhqs: yhjs
                            })
                            console.log(that.data.yhqs)
                            // e[i].percent = e[i].number / e[i].surplus * 100
                            setTimeout(() => {
                                util.showFailToast({
                                    title: '领取成功'
                                })
                            }, 10)
                        },
                    }, true);
                }
            },
        });
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
                                that.setData({
                                    phone: wx.getStorageSync('user').qphone,
                                })
                                http.request({
                                    url: '/getQuser',
                                    data: {
                                        id: wx.getStorageSync('user').id,
                                    },
                                    success: function (data) {
                                        wx.setStorageSync('user', data[0])
                                        that.setData({
                                            phone: wx.getStorageSync('user').qphone,
                                        })
                                    }
                                })
                            }
                        });
                    }
                }
            });
        }
    },
    shoucang: function (e) {
        var that = this;
        if (e.currentTarget.dataset.tp == 1) {
            http.request({
                url: '/getQcollect',
                data: {
                    qscid: e.currentTarget.dataset.qscid,
                    qopenid: app.globalData.userOpen.openid,
                    qstatus: 1,
                    qdelete: 1,
                    orderstr: 'order by a.id desc'
                },
                success: function (ee) {
                    if (ee.length != 0) {
                        wx.showModal({
                            title: '系统提示',
                            content: '是否取消收藏',
                            success(res) {
                                if (res.confirm) {
                                    http.request({
                                        url: '/updateQcollect',
                                        data: {
                                            id: ee[0].id,
                                            qdelete: 2,
                                        },
                                        success: function (data) {
                                            that.setData({
                                                sc: false
                                            })
                                            wx.showToast({
                                                title: '取消成功',
                                                duration: 2000
                                            })

                                        }
                                    })
                                } else if (res.cancel) {
                                    return
                                }
                            }
                        })

                    } else {
                        http.request({
                            url: '/insertQcollect',
                            data: {
                                qscid: e.currentTarget.dataset.qscid,
                                qopenid: app.globalData.userOpen.openid,
                                qtype: 1,
                                qstatus: 1,
                            },
                            success: function (data) {
                                that.setData({
                                    sc: true
                                })
                                wx.showToast({
                                    title: '收藏成功',
                                    duration: 2000
                                })

                            }
                        })
                    }
                }
            })
        } else {
            http.request({
                url: '/getQcollect',
                data: {
                    qscid: e.currentTarget.dataset.qscid,
                    qopenid: app.globalData.userOpen.openid,
                    qstatus: 2,
                    qdelete: 1,
                    orderstr: 'order by a.id desc'
                },
                success: function (ee) {
                    if (ee.length != 0) {
                        http.request({
                            url: '/updateQcollect',
                            data: {
                                id: ee[0].id,
                                qdelete: 2,
                            },
                            success: function (data) {
                                wx.showToast({
                                    title: '取消成功',
                                    duration: 2000
                                })
                                http.request({
                                    url: '/getQcollect',
                                    data: {
                                        qscid: e.currentTarget.dataset.qscid,
                                        qstatus: 2,
                                        qdelete: 1,
                                        orderstr: 'order by a.id desc'
                                    },
                                    success: function (e) {
                                        that.setData({
                                            kaopu: false,
                                            collects: e
                                        })
                                    }
                                })
                            }
                        })
                        return
                    } else {
                        http.request({
                            url: '/insertQcollect',
                            data: {
                                qscid: e.currentTarget.dataset.qscid,
                                qopenid: app.globalData.userOpen.openid,
                                qtype: 1,
                                qstatus: 2,
                            },
                            success: function (data) {
                                wx.showToast({
                                    title: '点赞成功',
                                    duration: 2000
                                })
                                that.setData({
                                    collectsNum: that.data.collectsNum + 1
                                })
                                http.request({
                                    url: '/getQcollect',
                                    data: {
                                        qscid: e.currentTarget.dataset.qscid,
                                        qdelete: 1,
                                        qstatus: 2,
                                        orderstr: 'order by a.id desc'
                                    },
                                    success: function (e) {
                                        that.setData({
                                            kaopu: true,
                                            collects: e
                                        })
                                    }
                                }, true)
                            }
                        }, true)
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
            },
            success: () => {
                getApp().globalData.imuserInfo.userId = app.globalData.userOpen.openid;
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
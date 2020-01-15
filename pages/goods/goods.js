const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
const time = require("../../utils/time.js");
var app = getApp();
var timer = ''
var village_LBS = function (that) {
    wx.getLocation({
        type: 'gcj02', //返回可以用于wx.openLocation的经纬度
        success: function (res) {
            wx.setStorageSync('latitude', res.latitude); //存储latitude
            wx.setStorageSync('longitude', res.longitude); //存储longitude
            that.getCity(wx.getStorageSync('latitude'), wx.getStorageSync('longitude'));
        }
    })
};
Page({
    data: {
        statusBarHeight: app.globalData.statusBarHeight,
        width: app.systemInfo.windowWidth,
        height: app.systemInfo.windowHeight,
        imghost: constant.imghost,
        yanse: '',
        guige: '',
        goods: [],
        bannerApp: true,
        winWidth: 0,
        winHeight: 0,
        currentTab: 0, //tab切换
        productId: 0,
        itemData: false,
        scid: 0,
        bannerItem: [],
        buynum: 1,
        buycost: 0,
        // 产品图片轮播， 支持视频
        indicatorDots: true,
        autoplay: false, // 因为支持视频，图片轮播不自动进行
        interval: 5000,
        duration: 1000,
        // 属性选择
        firstIndex: -1,
        //准备数据
        //数据结构:以一组一组来进行设定
        commodityAttr: [],
        attrValueList: [{
            attrKey: '规格:',
            attrValues: [],
        }, {
            attrKey: '颜色:',
            attrValues: [],
        }],
        index: 0,
        attrIndex: 0,
        yhj: {},
        jmnum: 0,
        syid: 0,
        yj: false,
        tzid: 0,
        qshopid: 0,
        sjopenid: '',
        plgs: 1,
        floorstatus: false,
        //是否显示遮罩层
        isLoading: true,
        //设置数据加载状态组件的状态  1加载中  2自己内容
        //-1加载错误  0数据为空   默认就是2  自定义图片和文字3
        empty: app.globalData.content,
        //请求错误提示的图片
        imgLayouSrc: app.globalData.imgLayouSrc,
        //请求错误时提示的文字
        titleLayou: app.globalData.titleLayou,
        //购物车中的商品数量
        goodsNum: 0,
        videoStartTime: 0,    // 视频的播放起始时间, 浮点型，单位秒？
        hasVideo: false,      // 是否在轮播图加上视频
        // 以下字段不绑定到view
        currentTime: 0,      // 当前播放位置
        playing: false,      // 是否播放中
        currentSwiperIndex: 0, // 当前banner的index 从0开始
        timeout: 800,          // 视频播放时，滑动轮播图，再滑动回来，
                               // 等待timeout后再恢复视频播放，
                               // 因为真机测试，短时间恢复视频播放，
                               // 视频组件的位置不对。
        fxx: false,
        //是否显示视频播放的弹出层
        videoIstrue: false,
        fxNum: 0,
    },
    //点击遮罩层的重新加载按钮
    emptyCallback(e) {
        this.onLoad()
    },
    // 获取滚动条当前位置
    scrolltoupper: function (e) {
        if (e.detail.scrollTop > 50) {
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
        wx.navigateBack({
            delta: 1
        })
    },
    godp() {
        wx.navigateTo({
            url: "/pages/shangjzy/shangjzy?id=" + this.data.qshopid
        })
    },
    liebiao(e) {
        wx.navigateTo({
            url: `/pages/goods/recordss?orderlist= ${JSON.stringify(e.currentTarget.dataset.orderlist)}`,
        })
    },
    qyhq: function (e) {
        var that = this;
        var yhjid = e.currentTarget.dataset.id
        var qshopid = that.data.qshopid
        http.request({
            url: '/getQuserCoupon',
            data: {
                quserid: wx.getStorageSync('user').id,
                qcouponid: yhjid
            },
            success: function (e) {
                if (e.length != 0) {
                    that.setData({
                        showModalStatus2: false,
                    })
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
                            that.setData({
                                showModalStatus2: false,
                            })
                            wx.showToast({
                                title: '领取成功',
                                image: '/images/search_no.png',
                                duration: 2000
                            })
                        }
                    })
                }
            }
        })
    },
    plgs() {
        this.setData({
            plgs: this.data.plgs == 1 ? 5 : 1
        })
    },
    //当点击视频层的推出播放按钮的时候
    //获取商品的二维码
    getewm() {
        this.setData({
            usertx: wx.getStorageSync('userInfo').avatarUrl,
            usern: wx.getStorageSync('userInfo').nickName
        })
        var that = this
        var requestData = {
            json: '{"path": "/pages/goods/goods?qshopid=' + that.data.business.id + '&id=' + that.data.procedure.id + '", "width":1280}',
            sellerId: that.data.business.logo // 'tu0.jpg'//
        };
        wx.request({
            url: constant.host + '/imagetocode',
            data: requestData,
            method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            success: (res) => {
                if (res.statusCode != 500) {
                    var mUrl = constant.imghost + res.data.url;
                    that.setData({
                        tym: mUrl
                    }, () => {
                        that.drawPoster()
                    })
                }
            },
            fail: function (err) {
            }
        })
    },
    changefxx() {
        this.setData({
            fxx: false
        })
    },
    drawPoster() {
        var that = this;
        //创建canvas绘画区域进行绘画
        var oPimg = ''
        var tym = ''
        var avatarUrl = ''
        var context = wx.createCanvasContext('mycanvas');
        var rpx;
        //请求商品的图片
        var promis1 = new Promise((resolve, reject) => {
            wx.downloadFile({
                url: that.data.imghost + that.data.procedure.lbImgs[0],//网络路径
                success: res => {
                    oPimg = res.tempFilePath //临时本地路径
                    resolve()
                }
            })
        })
        //请求头像
        var promis2 = new Promise((resolve, reject) => {
            wx.downloadFile({
                url: getApp().globalData.userInfo.avatarUrl.toString(),//网络路径
                success: res => {
                    avatarUrl = res.tempFilePath //临时本地路径
                    resolve()
                }
            })
        })
        //请求商户的太阳码
        var promis3 = new Promise((resolve, reject) => {
            wx.downloadFile({
                url: that.data.tym,//网络路径
                success: res => {
                    tym = res.tempFilePath //临时本地路径
                    resolve()
                }
            })
        })
        //获取当前的屏幕
        var promis4 = new Promise((resolve, reject) => {
            wx.getSystemInfo({
                success: function (res) {
                    rpx = res.windowWidth / 375;
                    resolve()
                }
            })
        })
        //当所有的异步请求都请求完成的时候
        Promise.all([promis1, promis2, promis3, promis4]).then(() => {
            getA()
        })

        //绘制分享商品的海报
        function getA() {
            context.fillStyle = "white";  // 设置或返回用于填充绘画的颜色、渐变或模式
            roundRectColor2(context, 0, 0, 547 * rpx, 900 * rpx, 16)
            //绘制产品的图片
            context.drawImage(oPimg, 0.5, 0, 300 * rpx, 260 * rpx);
            //绘制圆角矩形
            roundRectColor(context, 70, 20, 160 * rpx, 36 * rpx, 16);
            //绘制圆头像
            drawCircular(context, 32 * rpx, 32 * rpx, 76, 23, avatarUrl)
            //绘制用户名字
            context.font = '13rpx Arial';
            context.fillStyle = '#fff';
            if (getApp().globalData.userInfo.nickName.length >= 9) {
                context.fillText(getApp().globalData.userInfo.nickName.slice(0, 9) + '...', 112, 37);
            } else {
                context.fillText(getApp().globalData.userInfo.nickName, 112, 37);
            }
            context.fillText('邀你一起共享优惠', 112, 52);
            //绘制商品的名称
            context.font = '16rpx Arial';
            context.fillStyle = '#000';
            if (that.data.procedure.goodsName.length >= 18) {
                context.fillText(that.data.procedure.goodsName.slice(0, 16), 10, 278 * rpx);
                context.fillText(that.data.procedure.goodsName.slice(16), 10, 296 * rpx);
            } else {
                context.fillText(that.data.procedure.goodsName, 10, 288 * rpx);
            }
            //绘制商品的详情
            context.font = '14rpx Arial';
            context.fillStyle = '#9b9b9b';
            if (that.data.procedure.goodsDetails.length >= 18) {
                context.fillText(that.data.procedure.goodsDetails.slice(0, 16) + '...', 10, 320 * rpx);
            } else {
                context.fillText(that.data.procedure.goodsDetails, 10, 320 * rpx);
            }
            //绘制商品的价格
            context.font = '16rpx Arial';
            context.fillStyle = '#F72F1A';
            context.fillText('￥', 10 * rpx, 360 * rpx);
            context.font = '24rpx Arial';
            context.fillText(that.data.procedure.goodsCost, 23, 360 * rpx);
            //绘制商品的优惠卷
            if (that.data.yhqs.length) {
                context.drawImage('/images/yhj.png', 14 * rpx, 390 * rpx, 100 * rpx, 21 * rpx);
                context.font = '15rpx Arial';
                context.fillStyle = '#fff';
                context.fillText(`满${that.data.yhqs[0].full}减${that.data.yhqs[0].reduce}元`, 25 * rpx, 406 * rpx);
            }
            //绘制太阳码
            context.drawImage(tym, 190 * rpx, 336 * rpx, 80 * rpx, 80 * rpx);
            context.draw()

            // 绘制圆角矩形
            function roundRectColor(context, x, y, w, h, r) {  //绘制圆角矩形（纯色填充）
                context.save();
                context.setFillStyle("rgba(0,0,0,.4)");
                context.setStrokeStyle('rgba(0,0,0,.4)')
                context.setLineJoin('round');  //交点设置成圆角
                context.setLineWidth(r);
                context.strokeRect(x + r / 2, y + r / 2, w - r, h - r);
                context.fillRect(x + r, y + r, w - r * 2, h - r * 2);
                context.stroke();
            }

            function roundRectColor2(context, x, y, w, h, r) {  //绘制圆角矩形（纯色填充）
                context.save();
                context.setFillStyle("#fff");
                context.setStrokeStyle('#fff')
                context.setLineJoin('round');  //交点设置成圆角
                context.setLineWidth(r);
                context.strokeRect(x + r / 2, y + r / 2, w - r, h - r);
                context.fillRect(x + r, y + r, w - r * 2, h - r * 2);
                context.stroke();
            }

            //绘制圆角头像
            function drawCircular(ctx, width, height, x, y, url) {
                var avatarurl_width = width;
                var avatarurl_heigth = height;
                var avatarurl_x = x;
                var avatarurl_y = y;
                ctx.save();
                ctx.beginPath();
                ctx.arc(avatarurl_width / 2 + avatarurl_x, avatarurl_heigth / 2 + avatarurl_y, avatarurl_width / 2, 0, Math.PI * 2, false);
                ctx.clip();
                ctx.drawImage(url, avatarurl_x, avatarurl_y, avatarurl_width, avatarurl_heigth);
                ctx.restore();
            }
        }
    },
    //点击保存图片的时候触发的事件
    saveimage: function (e) {
        var that = this;
        wx.showLoading({
            title: '正在生成',
        })
        wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            canvasId: 'mycanvas',
            success: function (res) {
                that.setData({
                    tym: res.tempFilePath
                })
                wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    type: 'image',
                    success: function (res) {
                        if (res.errMsg === "saveImageToPhotosAlbum:ok") {
                            wx.hideLoading()
                            setTimeout(() => {
                                wx.showToast({
                                    title: '已下载至相册',
                                    duration: 2000
                                })
                            }, 10)
                        } else {
                            setTimeout(() => {
                                wx.showToast({
                                    title: '网络异常',
                                    image: '/images/search_no.png',
                                    duration: 2000
                                })
                            }, 10)
                        }
                    },
                    complete(res) {
                        wx.hideLoading()
                        that.setData({
                            fxx: false
                        })
                    }
                })
            }
        })
    },
    //监听分享
    share(res) {
        var that = this
        if (this.data.tym) {
            this.setData({
                fxx: true,
                fxbox: false,
                fxNum: 2
            })
        } else {
            wx.showLoading({
                title: '加载中',
            })
            setTimeout(function () {
                wx.hideLoading()
                wx.showToast({
                    title: '稍后再试',
                    icon: 'none',
                    duration: 2000
                })
                that.setData({
                    fxbox: false,
                })
            }, 2000)
        }
    },
    // 传值//监听分享
    onShareAppMessage(res) {
        //分享的时候先把遮罩层关闭
        this.setData({
            fxbox: false
        })
        // 页面 button (open-type=share) 点击触发的分享
        // 提交 分享操作 记录 到后台服务器
        var record = {};
        record.qbusinessid = this.data.qshopid
        record.qmiaoshu = '分享了你的商品[' + this.data.procedure.goodsName + ']'
        record.qtype = 5;
        http.insertUserRecord(record);
        let sharedObj = {
            title: '您的好友向您推荐了商品[' + this.data.procedure.goodsName + ']点击查看',
            path: '/pages/goods/goods?id=' + this.data.procedure.id + '&qshopid=' + this.data.qshopid + '&sjopenid=' + app.globalData.userOpen.openid,
        }
        // 微信小程序的默认的分享图是 当前截图。
        // 如果有轮播图，且处于视频播放状态，那么用第一张图，而非截图。
        // refer: https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onShareAppMessage-Object-object
        if (this.data.hasVideo) {
            if (this.data.currentSwiperIndex == 0 && this.data.procedure.lbImgs[0]) {
                sharedObj.imageUrl = this.data.imghost + this.data.procedure.lbImgs[0]
            }
        }
        return sharedObj
    },
    changefx() {
        this.setData({
            fxbox: false
        })
    },
    fenx() {
        var that = this;
        clearTimeout(timer)
        timer = setTimeout(() => {
            if (that.data.fxNum == 0) {
                if (that.data.business) {
                    that.getewm()
                    that.setData({
                        fxbox: true,
                    })
                }
                if (!that.data.tym) {
                    return
                }
                if (that.data.fxNum != 1 && that.data.fxNum != 2) {
                    that.setData({
                        fxNum: 1
                    })
                }
            }
            that.setData({
                fxbox: true,
            })
        }, 400)
    },
    onLoad: function (options) {
        var that = this;
        that.setData({
            qshopid: options.qshopid,
            tzid: options.id
        })
        if (options.sjopenid != undefined) {
            that.setData({
                sjopenid: options.sjopenid
            })
        }
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
                    that.shuju()
                } else {
                    that.setData({
                        canIUse: true
                    })
                }
            }
        })
        this.getGoodsnum()
    },
    shuju(e) {
        var that = this
        http.request({
            url: '/getQprocedure',
            data: {
                id: that.data.tzid
            },
            success: function (e) {
                var record = {};
                record.qbusinessid = that.data.qshopid;
                record.qprocedureid = e[0].id
                record.qmiaoshu = '查看了你的商品[' + e[0].goodsName + ']';
                record.qtype = 2;
                http.insertUserRecord(record);
                e[0].lbImgs = e[0].lbImgs.split(',');
                e[0].imgs = e[0].imgs.split(',');
                that.data.buycost = e[0].goodsCost;
                that.setData({
                    procedure: e[0],
                    buycost: e[0].goodsCost,
                    sanji: false
                });
            }
        }, true, that)
        http.request({
            url: '/getQbusiness',
            data: {
                id: that.data.qshopid,
            },
            success: function (e) {
                that.setData({
                    business: e[0],
                });
            }
        }, true)
        http.request({
            url: '/getQcoupons',
            data: {
                storeId: that.data.qshopid,
                del: 1
            },
            success: function (e) {
                var yhqs = [];
                var djqs = [];
                for (var i = 0; i < e.length; i++) {
                    e[i].endTime = time.timeStamp(e[i].endTime).substr(0, 10)
                    if (e[i].typeId == 2 && e[i].number > 0) {
                        yhqs.push(e[i]);
                    } else if (e[i].typeId == 1 && e[i].number > 0) {
                        djqs.push(e[i])
                    }
                }
                that.setData({
                    yhqs: yhqs,
                    djqs: djqs
                });
            }
        }, true)
        http.request({
            url: '/getQcomment',
            data: {
                qnote: 2,
                qidd: that.data.tzid,
            },
            success: function (e) {
                e.forEach(function (item, index) {
                    item.qdate = time.timeStamp(item.qdate)
                })
                that.setData({
                    comments: e,
                    isLoading: false,
                });
            }
        }, true)
        http.request({
            url: '/getQtype',
            data: {
                qprocedureId: that.data.tzid,
                qdelete: 1,
            },
            success: function (e) {
                for (var i = 0; i < e.length; i++) {
                    that.data.attrValueList[0].attrValues.push(e[i])
                }
                http.request({
                    url: '/getQcolor',
                    data: {
                        qprocedureId: that.data.tzid,
                        qdelete: 1,
                    },
                    success: function (e) {
                        for (var i = 0; i < e.length; i++) {
                            that.data.attrValueList[1].attrValues.push(e[i])
                        }
                        that.setData({
                            includeGroup: that.data.commodityAttr
                        });
                        that.distachAttrValue(that.data.commodityAttr);
                        that.setData({
                            attrValueList: that.data.attrValueList
                        }, () => {
                            //判断是否是单个规格，单个规格只需固定规格
                            if (that.data.attrValueList[0].attrValues.length <= 1 && that.data.attrValueList[1].attrValues.length <= 1) {
                                var data = that.data.attrValueList;
                                data[0].attrValueStatus = true
                                data[1].attrValueStatus = true;
                                data[0].selectedValue = data[0].attrValues[0].qtypeName
                                data[1].selectedValue = data[1].attrValues[0].qtypeName
                                that.setData({
                                    attrValueList: data,
                                    buycost: data[0].attrValues[0].qprice,
                                    yanse: data[0].attrValues[0].qtypeName,
                                    guige: data[1].attrValues[0].qtypeName,
                                    firstIndex: 0,
                                    //判断是否默认选中规格
                                    guding: true
                                })
                            }
                        })
                    }
                }, true)
            }
        }, true)
        http.request({
            url: '/getQcollect',
            data: {
                qscid: that.data.tzid,
                qopenid: app.globalData.userOpen.openid,
                qtype: 3,
                qdelete: 1,
            },
            success: function (ee) {
                if (ee.length != 0) {
                    that.setData({
                        scid: ee[0].id,
                        itemData: true
                    })
                }
            }
        }, true)
        http.request({
            url: '/getQorder',
            data: {
                qprocedureId: that.data.tzid,
            },
            success: function (e) {
                that.setData({
                    orderlist: e
                })
            }
        }, true)
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
                                                        wx.setStorageSync('user', e); //存储user
                                                        that.shuju()
                                                    }
                                                })
                                            }
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
                                            }
                                        })
                                    } else {
                                        wx.setStorageSync('user', e); //存储user
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
            }
        })
    },
    onReady: function () {
        var that = this;
        wx.getSetting({
            success: (res) => {
                if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) { //非初始化进入该页面,且未授权
                    wx.showModal({
                        title: '是否授权当前位置',
                        content: '需要获取您的地理位置，请确认授权，否则地图功能将无法使用',
                        showCancel: false,
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
    //图片详情
    tpxq: function (e) {
        wx.previewImage({
            current: e.currentTarget.dataset.src, // 当前显示图片的http链接
            urls: e.currentTarget.dataset.srcs // 需要预览的图片http链接列表
        })
    },
    goCartnow() {
        wx.navigateTo({
            url: '/pages/shopcart/shopcart'
        })
    },
    //获取商品的数量
    getGoodsnum() {
        var that = this
        http.request({
            url: '/getQorder',
            data: {
                qsubmitter: getApp().globalData.userOpen.openid,
                qstatus: 7
            },
            success: function (e) {
                var sum = 0;
                for (var i = 0; i < e.length; i++) {
                    sum = sum + e[i].length || 0
                }
                that.setData({
                    goodsNum: sum
                })
            }
        }, true)
    },
    //选择优惠券
    radioChange(e) {
        if (e.currentTarget.dataset.zongjia < this.data.yhj[e.detail.value].qsynum) {
            this.setData({
                yhj: this.data.yhj
            })
            wx.showToast({
                title: '不满足使用金额',
                duration: 3000,
            });
        } else if (this.data.yhj[e.detail.value].qjstime < wx.getStorageSync('nowDate')) {
            this.setData({
                yhj: this.data.yhj
            })
            wx.showToast({
                title: '优惠券已过期',
                duration: 3000,
            });
        } else {
            this.data.syid = this.data.yhj[e.detail.value].id
            this.setData({
                jmnum: this.data.jmnum = this.data.yhj[e.detail.value].qnum,
                yj: true
            })
        }
    },
    // 广告栏
    photoScan(e) {
        for (var i = 0; i < e.currentTarget.dataset.imgs.length; i++) {
            e.currentTarget.dataset.imgs[i] = this.data.host + e.currentTarget.dataset.imgs[i]
        }
        wx.previewImage({
            current: this.data.host + e.currentTarget.dataset.img, // 当前显示图片的http链接
            urls: e.currentTarget.dataset.imgs // 需要预览的图片http链接列表
        })
    },
    tochat: function (e) {
        var message = {};
        message.qformId = e.detail.formId;
        message.qopenId = getApp().globalData.userOpen.openid
        http.request({
            url: '/insertQmessage',
            data: message,
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
        item.friendHeadUrl = constant.host + this.data.business.logo;
        item.friendName = this.data.business.storeName;
        item.conversationId = -1;
        item.msgUserId = app.globalData.userOpen.openid;
        item.timeStr = "19:06";
        item.timestamp = 1533294362000;
        item.type = "text";
        wx.navigateTo({
            url: `/pages/im/chat/chat?friend=${JSON.stringify(item)}`
        });
    },
    toindex() {
        wx.switchTab({
            url: '/pages/index/index'
        })
    },
    gobuy(event) {
        wx.showToast({
            title: '功能未做',
        })
    },
    callPhone(event) {
        wx.makePhoneCall({
            phoneNumber: '15912345678',
        })
    },
    location(event) {
        const that = this;
        wx.openLocation({
            latitude: that.data.latitude, // 纬度，范围为-90~90，负数表示南纬
            longitude: that.data.longitude, // 经度，范围为-180~180，负数表示西经
            scale: 28, // 缩放比例
            name: '这是那儿哦', // 位置名
            address: '当前位置定位...', // 地址的详细说明
        })
    },
    //加入购物车操作
    goCart(e) {
        var that = this;
        if (that.data.yanse == '' || that.data.guige == '') {
            util.showFailToast({
                title: '未选规格或颜色'
            });
            return;
        }
        if ((that.data.procedure.qkucun - that.data.procedure.syNum) <= 0) {
            util.showFailToast({
                title: '库存不足'
            });
            return;
        }
        //在数据库中插入一条购物车数据
        http.request({
            url: '/insertQorder',
            data: {
                qsubmitter: app.globalData.userOpen.openid,
                qsubmitterName: app.globalData.userInfo.nickName,
                qsubmitterIcon: app.globalData.userInfo.avatarUrl,
                qprocedureId: e.currentTarget.dataset.spid,
                qprocedureName: e.currentTarget.dataset.spname + '【规格:' + that.data.yanse + ',颜色:' + that.data.guige + '】',
                qprocedureImg: e.currentTarget.dataset.spimg,
                qsum: that.data.buycost * that.data.buynum,
                qtotal: that.data.buynum,
                qstatus: 7,
                qshopid: that.data.qshopid,
                qyunfei: 0,
                cost: that.data.buycost
            },
            success: function (data) {
                util.showSuccessToast({
                    title: '添加购物车成功'
                });
                setTimeout(() => {
                    that.getGoodsnum()
                }, 500)
                that.setData({
                    showModalStatus: false,
                })
            }
        })
    },
    // 弹窗
    setModalStatus: function (e) {
        //确保商品的信息加载完成和商品的规格加载完成
        if (!this.data.procedure && !this.data.attrValueList) {
            return
        }
        var animation = wx.createAnimation({
            duration: 200,
            timingFunction: "linear",
            delay: 0
        });
        this.animation = animation
        animation.translateY(300).step();
        var that = this
        this.setData({
            buynum: 1,
            animationData: animation.export()
        })
        if (e.currentTarget.dataset.status == 1) {
            this.setData({
                showModalStatus: true,
                gwc: true
            });
        } else if (e.currentTarget.dataset.status == 2) {
            this.setData({
                showModalStatus: true,
                gwc: false
            });
        }
        if (e.currentTarget.dataset.type == 2) {
            this.setData({
                cart: true
            })
        } else {
            this.setData({
                cart: false
            })
        }
        setTimeout(function () {
            animation.translateY(0).step()
            this.setData({
                animationData: animation,
            })
            if (e.currentTarget.dataset.status == 0) {
                this.setData({
                    showModalStatus: false,
                    jmnum: 0,
                    yj: false,
                });
            }
        }.bind(this), 200)
    },
    setModalStatus2: function (e) {
        var animation = wx.createAnimation({
            duration: 200,
            timingFunction: "linear",
            delay: 0
        })
        this.animation = animation
        animation.translateY(300).step();
        this.setData({
            animationData: animation.export()
        })
        if (e.currentTarget.dataset.status == 1) {
            this.setData({
                showModalStatus2: true,
                gwc: true
            });
        } else if (e.currentTarget.dataset.status == 2) {
            this.setData({
                showModalStatus2: true,
                gwc: false
            });
        }
        setTimeout(function () {
            animation.translateY(0).step()
            this.setData({
                animationData: animation
            })
            if (e.currentTarget.dataset.status == 0) {
                this.setData({
                    showModalStatus2: false,
                    jmnum: 0,
                    yj: false,
                });
            }
        }.bind(this), 200)
    },
    // 加减
    changeNum: function (e) {
        var that = this;
        if (e.currentTarget.dataset.alphaBeta == 1) {
            if (this.data.buynum <= 1) {
                buynum = 1
            } else {
                this.setData({
                    buynum: this.data.buynum - 1,
                    sum: (this.data.buycost * (this.data.buynum - 1)).toFixed(2),
                })
            }
        } else if (e.currentTarget.dataset.alphaBeta == 2) {
            //判断库存
            if (this.data.buynum >= e.currentTarget.dataset.num) {
                wx.showToast({
                    title: '库存不足',
                    image: '/images/search_no.png',
                    duration: 2000
                })
                return
            }
            this.setData({
                buynum: this.data.buynum + 1,
                sum: (this.data.buycost * (this.data.buynum + 1)).toFixed(2),
            })
        }
    },
    // 商品详情数据获取
    loadProductDetail: function () {
        var that = this;
    },
    // 属性选择
    onShow: function () {
        if (this.data.loadnum === 2) {
            this.onLoad({qshopid: this.data.qshopid, id: this.data.tzid})
            this.setData({
                attrValueList: [{
                    attrKey: '规格:',
                    attrValues: [],
                }, {
                    attrKey: '颜色:',
                    attrValues: [],
                }]
            })
        }
        this.setData({
            loadnum: 2
        })
    },
    /* 获取数据 */
    distachAttrValue: function (commodityAttr) {
        // 把数据对象的数据（视图使用），写到局部内
        var attrValueList = this.data.attrValueList;
        // 遍历获取的数据
        for (var i = 0; i < commodityAttr.length; i++) {
            for (var j = 0; j < commodityAttr[i].attrValueList.length; j++) {
                var attrIndex = this.getAttrIndex(commodityAttr[i].attrValueList[j].attrKey, attrValueList);
                // 如果还没有属性索引为-1，此时新增属性并设置属性值数组的第一个值；索引大于等于0，表示已存在的属性名的位置
                if (attrIndex >= 0) {
                    // 如果属性值数组中没有该值，push新值；否则不处理
                    if (!this.isValueExist(commodityAttr[i].attrValueList[j].attrValue, attrValueList[attrIndex].attrValues)) {
                        attrValueList[attrIndex].attrValues.push(commodityAttr[i].attrValueList[j].attrValue);
                    }
                } else {
                    attrValueList.push({
                        attrKey: commodityAttr[i].attrValueList[j].attrKey,
                        attrValues: [commodityAttr[i].attrValueList[j].attrValue]
                    })
                }
            }
        }
        for (var i = 0; i < attrValueList.length; i++) {
            for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
                if (attrValueList[i].attrValueStatus) {
                    attrValueList[i].attrValueStatus[j] = true;
                } else {
                    attrValueList[i].attrValueStatus = [];
                    attrValueList[i].attrValueStatus[j] = true;
                }
            }
        }
        this.setData({
            attrValueList: attrValueList
        });
    },
    getAttrIndex: function (attrName, attrValueList) {
        // 判断数组中的attrKey是否有该属性值
        for (var i = 0; i < attrValueList.length; i++) {
            if (attrName == attrValueList[i].attrKey) {
                break;
            }
        }
        return i < attrValueList.length ? i : -1;
    },
    isValueExist: function (value, valueArr) {
        // 判断是否已有属性值
        for (var i = 0; i < valueArr.length; i++) {
            if (valueArr[i] == value) {
                break;
            }
        }
        return i < valueArr.length;
    },
    /* 选择属性值事件 */
    selectAttrValue: function (e) {
        /*点选属性值，联动判断其他属性值是否可选*/
        this.data.buycost = e.currentTarget.dataset.value.qprice;
        this.setData({
            buycost: e.currentTarget.dataset.value.qprice
        })
        var attrValueList = this.data.attrValueList;
        var index = e.currentTarget.dataset.index; //属性索引
        var key = e.currentTarget.dataset.key;
        var value = e.currentTarget.dataset.value;
        if (e.currentTarget.dataset.status || index == this.data.firstIndex) {
            if (e.currentTarget.dataset.selectedvalue == e.currentTarget.dataset.value) {
                // 取消选中
                this.disSelectValue(attrValueList, index, key, value);
            } else {
                // 选中
                this.selectValue(attrValueList, index, key, value);
            }
        }
        this.setData({
            sum: (this.data.buycost * (this.data.buynum)).toFixed(2),
        })
    },
    selectAttrValue1: function (e) {
        var attrValueList = this.data.attrValueList;
        var index = e.currentTarget.dataset.index; //属性索引
        var key = e.currentTarget.dataset.key;
        var value = e.currentTarget.dataset.value;
        if (e.currentTarget.dataset.status || index == this.data.firstIndex) {
            if (e.currentTarget.dataset.selectedvalue == e.currentTarget.dataset.value) {
                // 取消选中
                this.disSelectValue(attrValueList, index, key, value);
            } else {
                // 选中
                this.selectValue(attrValueList, index, key, value);
            }
        }
    },
    /* 选中 */
    selectValue: function (attrValueList, index, key, value, unselectStatus) {
        var includeGroup = [];
        if (index == this.data.firstIndex && !unselectStatus) { // 如果是第一个选中的属性值，则该属性所有值可选
            var commodityAttr = this.data.commodityAttr;
            // 其他选中的属性值全都置空
            for (var i = 0; i < attrValueList.length; i++) {
                for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
                    attrValueList[i].selectedValue = '';
                }
            }
        } else {
            var commodityAttr = this.data.includeGroup;
        }

        if (index == 0) {
            this.setData({
                yanse: value.qtypeName
            })
            this.data.yanse = value.qtypeName
        } else if (index == 1) {
            this.setData({
                guige: value.qtypeName
            })
            this.data.guige = value.qtypeName
        }
        for (var i = 0; i < commodityAttr.length; i++) {
            for (var j = 0; j < commodityAttr[i].attrValueList.length; j++) {
                if (commodityAttr[i].attrValueList[j].attrKey == key && commodityAttr[i].attrValueList[j].attrValue == value) {
                    includeGroup.push(commodityAttr[i]);
                }
            }
        }
        attrValueList[index].selectedValue = value.qtypeName;
        // 判断属性是否可选
        this.setData({
            attrValueList: attrValueList,
            includeGroup: includeGroup
        });
        var count = 0;
        for (var i = 0; i < attrValueList.length; i++) {
            for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
                if (attrValueList[i].selectedValue) {
                    count++;
                    break;
                }
            }
        }
        if (count < 2) { // 第一次选中，同属性的值都可选
            this.setData({
                firstIndex: index
            });
        } else {
            this.setData({
                firstIndex: -1
            })
        }
    },
    /* 取消选中 */
    disSelectValue: function (attrValueList, index, key, value) {
        var commodityAttr = this.data.commodityAttr;
        attrValueList[index].selectedValue = '';
        // 判断属性是否可选
        for (var i = 0; i < attrValueList.length; i++) {
            for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
                attrValueList[i].attrValueStatus[j] = true;
            }
        }
        this.setData({
            includeGroup: commodityAttr,
            attrValueList: attrValueList
        });
        for (var i = 0; i < attrValueList.length; i++) {
            if (attrValueList[i].selectedValue) {
                this.selectValue(attrValueList, i, attrValueList[i].attrKey, attrValueList[i].selectedValue, true);
            }
        }
    },
    initProductData: function (data) {
        data["LunBoProductImageUrl"] = [];
        var imgs = data.LunBoProductImage.split(';');
        for (let url of imgs) {
            url && data["LunBoProductImageUrl"].push(app.d.hostImg + url);
        }
        data.Price = data.Price / 100;
        data.VedioImagePath = app.d.hostVideo + '/' + data.VedioImagePath;
        data.videoPath = app.d.hostVideo + '/' + data.videoPath;
    },
    //添加到收藏
    addFavorites: function (e) {
        var that = this;
        var id = e.currentTarget.dataset.id
        if (!that.data.itemData) {
            http.request({
                url: '/insertQcollect',
                data: {
                    qscid: id,
                    qtype: 3,
                    qstatus: 1,
                    qopenid: wx.getStorageSync('userOpen').openid,
                },
                success: function (e) {
                    wx.showToast({
                        title: '收藏成功！',
                        duration: 2000
                    });
                    http.request({
                        url: '/getQcollect',
                        data: {
                            qscid: that.data.tzid,
                            qopenid: app.globalData.userOpen.openid,
                            qstatus: 1,
                            qtype: 3,
                            qdelete: 1,
                        },
                        success: function (ee) {
                            if (ee.length != 0) {
                                that.setData({
                                    scid: ee[0].id,
                                    itemData: true
                                })
                            }
                        }
                    })
                }
            })
        } else {
            wx.showModal({
                title: '提示',
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
                                    title: '取消成功！',
                                    duration: 2000
                                });
                                //变成已收藏，但是目前小程序可能不能改变图片，只能改样式
                                that.setData({
                                    itemData: false
                                })
                            }
                        })
                    }
                }
            })
        }
    },
    maimaimai: function (e) {
        var that = this;
        if (that.data.yanse == '' || that.data.guige == '') {
            util.showFailToast({
                title: '未选规格或颜色'
            });
            return;
        }
        if ((that.data.procedure.qkucun - that.data.procedure.syNum) <= 0) {
            util.showFailToast({
                title: '库存不足'
            });
            return;
        }
        app.globalData.spid = e.currentTarget.dataset.spid;
        http.request({
            url: '/insertQorder',
            data: {
                qsubmitter: app.globalData.userOpen.openid,
                qsubmitterName: app.globalData.userInfo.nickName,
                qsubmitterIcon: app.globalData.userInfo.avatarUrl,
                qprocedureId: e.currentTarget.dataset.spid,
                qprocedureName: e.currentTarget.dataset.spname + '【规格:' + that.data.yanse + ',颜色:' + that.data.guige + '】',
                qprocedureImg: e.currentTarget.dataset.spimg,
                qsum: this.data.buycost * this.data.buynum,
                qtotal: this.data.buynum,
                qstatus: 1,
                qshopid: this.data.qshopid,
                qyunfei: 0,
                cost: that.data.buycost
            },
            success: function (data) {
                wx.navigateTo({
                    url: '/pages/order/check?id=' + data + '&xiadan=1',
                })
                that.setData({
                    showModalStatus: false,
                });
            }
        }, true);
    },
    addShopCart: function (e) { //添加到购物车
        var that = this;
        if ((that.data.procedure.qkucun - that.data.procedure.syNum) <= 0) {
            util.showFailToast({
                title: '库存不足'
            });
            return;
        }
        http.request({
            url: '/insertQorder',
            data: {
                qsubmitter: app.globalData.userOpen.openid,
                qsubmitterName: app.globalData.userInfo.nickName,
                qsubmitterIcon: app.globalData.userInfo.avatarUrl,
                qprocedureId: e.currentTarget.dataset.spid,
                qprocedureName: e.currentTarget.dataset.spname + '【规格:' + that.data.yanse + ',颜色:' + that.data.guige + '】',
                qprocedureImg: e.currentTarget.dataset.spimg,
                qsum: this.data.buycost * this.data.buynum,
                qtotal: this.data.buynum,
                qstatus: 1,
                qshopid: this.data.qshopid,
                cost: that.data.buycost
            },
            success: function (data) {
                util.showSuccessToast({
                    title: '添加成功'
                });
                that.setData({
                    showModalStatus: false,
                })
            }
        })
    },
    bindChange: function (e) { //滑动切换tab
        var that = this;
        that.setData({
            currentTab: e.detail.current
        });
    },
    initNavHeight: function () { ////获取系统信息
        var that = this;
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    winWidth: res.windowWidth,
                    winHeight: res.windowHeight
                })
            }
        })
    },
    bannerClosed: function () {
        this.setData({
            bannerApp: false,
        })
    },
    swichNav: function (e) { //点击tab切换
        var that = this;
        if (that.data.currentTab === e.target.dataset.current) {
            return false;
        } else {
            that.setData({
                currentTab: e.target.dataset.current
            })
        }
    },
    // 视频播放
    play: function (e) {
        var that = this
        this.setData({
            videoStartTime: this.data.currentTime
        }, () => {
            that.setData({
                videoIstrue: true
            }, () => {
                wx.createVideoContext('video-in-carousel').play();
            })
        })
    },
    exitVideo() {
        var that = this
        that.setData({
            videoIstrue: false
        }, () => {
            wx.createVideoContext('video-in-carousel').pause();
        })
    },
    // 轮播图图片滑动的回调
    bannerChange: function (e) {
        // 如果播放中，滑动后又回来，需要继续播放
        if (this.isLogEnabled()) ;
        this.data.currentSwiperIndex = e.detail.current
        // 对于播放着滑动在划回，先切回图，然后定时再切回视频
        var that = this
    },
    // 播放进度变化时触发，event.detail = {currentTime, duration} 。触发频率 250ms 一次
    onVideoTimeUpdate: function (e) {
        // if (this.isDebugEnabled()) onsole.debug("page swipperhidden/index.js - onVideoTimeUpdate: " + JSON.stringify(e.detail));
        if (e.detail.currentTime >= 0) {
            this.data.currentTime = e.detail.currentTime
        }
    },
    onVideoEnded: function (e) {
        if (this.isDebugEnabled()) ;
        this.data.currentTime = 0
    },
    onVideoProgress: function (e) {
        if (this.isDebugEnabled()) ;
    },
    isDebugEnabled: function () {
        return true;
    },
    isLogEnabled: function () {
        return true;
    }
})
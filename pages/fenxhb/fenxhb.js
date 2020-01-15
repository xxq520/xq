const constant = require("../../utils/constant.js");
const http = require("../../utils/http.js");
var util = require('../../utils/util.js')
var app = getApp();
// view/fenxhb/fenxhb.js
Page({
    /*** 页面的初始数据*/
    data: {
        statusBarHeight: app.globalData.statusBarHeight,
        posterData: {},
        canvasW: app.globalData.window_width - 20, //320,
        canvasH: (app.globalData.window_width - 20) * 776 / 568, // 560,
    },
    previewImg: function () {
        wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: this.data.canvasW,
            height: this.data.canvasH,
            destWidth: 4 * this.data.canvasW,
            destHeight: 4 * this.data.canvasH,
            canvasId: 'poster',
            success: (res) => {
                wx.previewImage({
                    urls: [res.tempFilePath],
                })
            }
        })
    },
    // 下载二维码
    downloadImg: function (url, fn) {
        wx.downloadFile({
            url: url,
            success: (res) => {
                console.log(res)
                fn && fn(res.tempFilePath)
            },
            fail: () => {
                util.showFailToast({
                    title: '操作失败'
                })
                wx.hideLoading()
            }
        })
    },
    // 画图
    draw: function (data) {
        console.log('画图', data)
        const ctx = wx.createCanvasContext('poster')
        ctx.drawImage(data.bj, 0, 0, this.data.canvasW, this.data.canvasH)
        // 把我发的两个方法放到util.js中
        util.getImgFromSize(data.posterImg, this.data.canvasW - 20, 240).then((size) => {
            ctx.drawImage(data.posterImg, 10, this.data.canvasH - 90, 70, 70)
            ctx.save();
            ctx.beginPath();
            ctx.arc(55, 36, 15, 0, Math.PI * 2, false);
            ctx.clip();
            ctx.drawImage(data.qicon, 40, 21, 30, 30);
            ctx.restore();
            ctx.setFillStyle('#FFFFFF')
            ctx.setFontSize(16)
            ctx.fillText(data.text0.substr(0, 28), 80, 43)
            ctx.setFontSize(16)
            var text = data.text.substr(0, 7)
            text = data.text.length > 7 ? text + '...' : text + ''
            ctx.fillText(text, 90, 430)
            ctx.setFontSize(12)
            ctx.fillText(data.text1, 90, 450)
            ctx.save();
            ctx.beginPath();
            ctx.arc(290, this.data.canvasH - 70, 60, 0, Math.PI * 2, false);
            ctx.clip();
            ctx.drawImage(data.qrcode, 230, this.data.canvasH - 130, 120, 120);
            ctx.restore();
            ctx.draw()
            wx.hideLoading()
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this
        var date = util.getNowDate();
        console.log("我想要的", options)
        var id = options.id;
        var requestData = {
            json: '{"path": "/pages/shangjzy/shangjzy?id=' + id + '", "width":430}',
            sellerId: 1
        };
        wx.request({
            url: constant.host + '/imagetocode',
            data: requestData,
            method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            success: (res) => {
                //二维码地址是服务器地址+'/img/+res.data.url
                var qrcode = constant.host + '/img/' + res.data.url;
                that.data.posterData.qrcode = qrcode;
                util.showLoading({
                    title: '生成中'
                })
                that.data.posterData.posterImg = options.posterImg
                http.request({
                    url: '/getQuser',
                    data: {
                        qopenid: app.globalData.userOpen.openid,
                    },
                    success: function (e) {
                        console.log('用户信息', e[0]);
                        if (e.length != 0) {
                            var qrcode = constant.host + '/img/' + e[0].qqrcode
                            that.data.posterData.text = options.qtitle
                            that.data.posterData.text0 = e[0].qnick + ' 分享了店铺'
                            that.data.posterData.text1 = options.start_time + '-' + options.end_time + '营业'
                            that.data.posterData.text2 = '一群人正赶来接龙扫码参与'
                            that.data.posterData.qnick = e[0].qnick
                            that.data.posterData.date = date + '发布了一个群接龙'
                            that.data.posterData.qicon = e[0].qicon
                            let bj = constant.host + '/img/dpmb.png'
                            let posterImg = that.data.posterData.posterImg
                            qrcode = that.data.posterData.qrcode
                            let qicon = that.data.posterData.qicon
                            that.downloadImg(bj, (img) => {
                                that.data.posterData.bj = img
                                that.downloadImg(posterImg, (img) => {
                                    that.data.posterData.posterImg = img
                                    that.downloadImg(qrcode, (img) => {
                                        that.data.posterData.qrcode = img
                                        that.downloadImg(qicon, (img) => {
                                            that.data.posterData.qicon = img
                                            that.draw(that.data.posterData)
                                        })
                                    })
                                })
                            })
                        }
                    }
                });
            }
        })
    }
})
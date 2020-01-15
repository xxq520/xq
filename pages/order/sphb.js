const constant = require("../../utils/constant.js");
const http = require("../../utils/http.js");
var util = require('../../utils/util.js')
var app = getApp();
Page({
    data: {
        posterData: {},
        canvasW: 320,
        canvasH: 560,
        product: {}
    },
    //点击放大功能
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
        console.log(data)
        const ctx = wx.createCanvasContext('poster')
        ctx.setFillStyle('#333')
        ctx.drawImage(data.bj, 0, 0, this.data.canvasW, this.data.canvasH)

        // 把我发的两个方法放到util.js中
        util.getImgFromSize(data.posterImg, this.data.canvasW - 20, 370).then((size) => {
            ctx.drawImage(data.posterImg, size.dx, size.dy, size.maxWidth, size.maxHeight, 10, 10, this.data.canvasW - 20, 370)
            //  ctx.drawImage(data.qwxicon, 26, 20, 50, 50)
            ctx.save();
            ctx.beginPath();
            ctx.arc(30, 415, 15, 0, Math.PI * 2, false);
            ctx.clip();
            ctx.drawImage(data.qwxicon, 10, 395, 40, 40);
            ctx.restore();
            ctx.setFontSize(14)
            ctx.fillText(data.qwxname, 55, 412)
            ctx.fillText('好物与您共分享', 55, 432)
            ctx.fillText('原价：' + this.data.product.goodsCost + '元', 10, 472)
            ctx.fillText('好友送优惠' + this.data.product.qbenefit + '元', 10, 492)
            ctx.fillText(this.data.product.goodsName, 10, 522)
            ctx.fillText('', 10, 542)
            ctx.fillText('长按识别二维码', 198, 522)
            ctx.fillText('进入喜钱领券购买', 192, 542)
            ctx.save();
            ctx.beginPath();
            ctx.arc(250, this.data.canvasH - 100, 50, 0, Math.PI * 2, false);
            ctx.clip();
            ctx.drawImage(data.qrcode, 200, this.data.canvasH - 150, 100, 100);
            ctx.restore();
            ctx.draw()
            wx.hideLoading()
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options);
        this.data.product = JSON.parse(options.product);
        this.data.product.lbImgs = this.data.product.lbImgs.split(',');
        var that = this
        var date = util.getNowDate();
        console.log("我想要的", app.globalData)
        util.showLoading({
            title: '生成中'
        })
        var sjid = app.globalData.userOpen.openid;
        var requestData = {
            json: '{"path": "/pages/index/index?sjopenid=' + sjid + '&proid=' + that.data.product.id + '", "width":430}',
            sellerId: 1
        };
        wx.request({
            url: constant.host + '/imagetocode',
            data: requestData,
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            success: (res) => {
                var posterData = {}
                var qrcode = constant.imghost + res.data.url;
                that.data.posterData.posterImg = constant.imghost + that.data.product.lbImgs[0];
                that.data.posterData.qwxname = app.globalData.userInfo.nickName;
                that.data.posterData.qrcode = qrcode;
                let bj = constant.imghost + 'fff.png';
                var qwxicon = app.globalData.userInfo.avatarUrl;
                that.downloadImg(bj, (img) => {
                    that.data.posterData.bj = img
                    that.downloadImg(qrcode, (img) => {
                        that.data.posterData.qrcode = img
                        that.downloadImg(qwxicon, (img) => {
                            that.data.posterData.qwxicon = img
                            that.draw(that.data.posterData)
                        })
                    })
                })
            }
        })
    }
})
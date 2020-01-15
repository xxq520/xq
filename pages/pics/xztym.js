Page({
    data: {
        posterData: {},
        canvasW: 320,
        canvasH: 560,
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
        ctx.setFillStyle('white')
        ctx.drawImage(data.bj, 0, 0, this.data.canvasW, this.data.canvasH)
        // 把我发的两个方法放到util.js中
        util.getImgFromSize(data.posterImg, this.data.canvasW - 20, 240).then((size) => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(85, 49, 15, 0, Math.PI * 2, false);
            ctx.clip();
            ctx.drawImage(data.qwxicon, 65, 29, 40, 40);
            ctx.restore();
            ctx.setFontSize(10)
            ctx.fillText(data.qwxname, 108, 45)
            ctx.save();
            ctx.beginPath();
            ctx.arc(95, this.data.canvasH - 105, 50, 0, Math.PI * 2, false);
            ctx.clip();
            ctx.drawImage(data.qrcode, 45, this.data.canvasH - 155, 100, 100);
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
        console.log("我想要的", app.globalData)
        util.showLoading({
            title: '生成中'
        })
        var qrcode = app.globalData.userOpen.qrcode;
        that.data.posterData.posterImg = options.posterImg;
        that.data.posterData.qwxname = app.globalData.userInfo.nickName;
        that.data.posterData.qrcode = qrcode;
        let bj = options.posterImg;
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
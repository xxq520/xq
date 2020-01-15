const constant = require("../../utils/constant.js");
const http = require("../../utils/http.js");
var util = require('../../utils/util.js')
var app = getApp();
// view/fenxhb/fenxhb.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    posterData: {},
    canvasW: app.globalData.window_width - 20, //320,
    canvasH: (app.globalData.window_width - 20) * 776 / 568, // 560,
  },
  //点击放大功能
  previewImg: function() {
    console.log('预览')
    var that = this
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: this.data.canvasW,
      height: this.data.canvasH,
      destWidth: 4 * this.data.canvasW,
      destHeight: 4 * this.data.canvasH,
      canvasId: 'poster',
      success: (res) => {
        console.log('预览', res)
        var mUrl = res.tempFilePath;
        // that.saveimage(mUrl)
        wx.previewImage({
          urls: [res.tempFilePath],
        })
      }
    })
  },
  saveimage: function(mUrl) {

    wx.saveImageToPhotosAlbum({
      filePath: mUrl,
      success(res) {
        console.log('下载图片', res)
        wx.showToast({
          title: '已下载至相册',
          duration: 2000
        })
        console.log("下载成功")
      }
    })

    // wx.downloadFile({
    //   url: mUrl,
    //   type: 'image',
    //   success: function (res) {

    //     if (res.statusCode === 200) {
    //       wx.saveImageToPhotosAlbum({
    //         filePath: res.tempFilePath,
    //         success(res) {
    //           console.log('下载图片', res)
    //           wx.showToast({
    //             title: '已下载至相册',
    //             duration: 2000
    //           })
    //           console.log("下载成功")
    //         }
    //       })
    //     } else {
    //       wx.showToast({
    //         title: '网络异常',
    //         image: '/images/search_no.png',
    //         duration: 2000
    //       })

    //     }

    //   },
    // })
  },
  // 下载二维码
  downloadImg: function(url, fn) {
    wx.downloadFile({
      url: url,
      success: (res) => {
        console.log(res)
        // this.data.qrcode = res.tempFilePath
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
  draw: function(data) {
    var that = this
    new Promise((resolve, inject) => {

      console.log(data)
      const ctx = wx.createCanvasContext('poster')
      ctx.setFillStyle('white')
      ctx.setStrokeStyle("#ffffff")
      ctx.drawImage(data.bj, 0, 0, that.data.canvasW, that.data.canvasH)
      // 把我发的两个方法放到util.js中
      util.getImgFromSize(data.posterImg, that.data.canvasW - 20, 240).then((size) => {
        //ctx.drawImage(data.posterImg, size.dx, size.dy, size.maxWidth, size.maxHeight, 10, 140, this.data.canvasW - 20, 240)
        //  ctx.drawImage(data.qwxicon, 26, 20, 50, 50)
        //   ctx.save();
        // ctx.beginPath();
        //  ctx.arc(85, 49, 15, 0, Math.PI * 2, false);
        //  ctx.clip();
        //  ctx.drawImage(data.qwxicon, 65, 29, 40, 40);
        //  ctx.restore();
        //  ctx.setFontSize(12)
        //  ctx.fillText(data.qwxname, 108, 55)
        // ctx.fillText(data.text0, 55, 115)
        //ctx.fillText(data.date, 80, 70)
        // ctx.setFontSize(17.5)
        // ctx.setTextAlign('center')
        //ctx.fillText(data.text.substr(0, 15), 10, 400)
        //ctx.fillText(data.text.substr(15, 29), 10, 422)
        // ctx.setFontSize(12)
        //ctx.fillText(data.text2.substr(0, 8), 100, this.data.canvasH-90)
        //ctx.fillText(data.text2.substr(8, 14), 110, this.data.canvasH - 70)
        // ctx.fillText(data.text.substr(28, 14), 30, 390)
        // ctx.fillText(data.text.substr(42, 14), 30, 420)
        // ctx.setFontSize(23)
        // ctx.fillText(data.text1, 10, 450)

        // ctx.drawImage(data.qrcode,30, this.data.canvasH - 100,80, 80)

        ctx.save();
        ctx.beginPath();
        ctx.stroke()
        ctx.arc(275, that.data.canvasH - 75, 50, 0, Math.PI * 2, false);
        ctx.clip();
        ctx.drawImage(data.qrcode, 225, that.data.canvasH - 125, 100, 100);
        ctx.restore();
        ctx.draw();
        ctx.save();
        wx.hideLoading()
        // resolve(res)
      }).then((res) => {
        setTimeout(function() {
          that.previewImg();
        }, 1000);

      })

    });

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    var date = util.getNowDate();
    console.log("我想要的", options)
    util.showLoading({
      title: '生成中'
    })
    var posterData = {}
    var qrcode = constant.imghost + options.qrcode;
    that.data.posterData.posterImg = options.posterImg;
    that.data.posterData.qwxname = app.globalData.userInfo.nickName;
    that.data.posterData.qrcode = qrcode;
    let bj = options.posterImg;
    var qwxicon = app.globalData.userInfo.avatarUrl;
    that.downloadImg(bj, (img) => {
      that.data.posterData.bj = img
      that.downloadImg(qrcode, (img) => {
        that.data.posterData.qrcode = img
        //that.downloadImg(qwxicon, (img) => {
        // that.data.posterData.qwxicon = img
        that.draw(that.data.posterData)
        // })
      })
    })
  },

  /**
   * 
   *  
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // }
})
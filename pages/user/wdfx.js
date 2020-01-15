const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
var app = getApp();
//  view/fenxhb/fenxhb.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    posterData: {},
    canvasW: app.globalData.window_width, //320,
    canvasH: (app.globalData.window_width - 100) * 776 / 568, // 560,
    h: app.globalData.window_height2,
    hh: app.globalData.window_height*0.9,
    swiperH: '', //swiper高度
    nowIdx: 0, //当前swiper索引
    imgList: [],
    host: constant.imghost,
    qrcode: ''
  },
  onLoad: function(options) {
    var that = this
    http.request({
      url: '/getQbanner',
      data: {
        type: 7,
      },
      success: function(e) {
        that.setData({
          imgList: e
        })

        /*       
                var date = util.getNowDate();
                var id = app.globalData.userOpen.openid;

                e.forEach(item => {
                  var requestData = {
                    json: '{"path": "/pages/index/index?sjopenid=' + id + '", "width":430}',
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
                      var posterData = {}
                      var qrcode = constant.imghost + res.data.url;
                      posterData.qrcode = qrcode;
                      posterData.id = item.id
                      util.showLoading({
                        title: '生成中'
                      })
                      var user = wx.getStorageSync('user')[0]
                      posterData.posterImg = user.qicon // that.data.imgList[0]
                      posterData.text = '一群人正赶来接龙扫码参与一群人正赶来接龙扫码参与一群人正赶来接龙扫码参与一群人正赶来接龙扫码参与'
                      posterData.text0 = user.qnick + ', 分享了好货'
                      posterData.text1 = '￥100'
                      posterData.text2 = '一群人正赶来接龙扫码参与'
                      posterData.qnick = user.qnick
                      posterData.date = date + '发布了一个群接龙'
                      posterData.qicon = user.qicon
                      let bj = constant.imghost + 'yqmb1.png' //constant.imghost + that.data.imgList[0]
                      let posterImg = posterData.posterImg
                      let qicon = posterData.qicon
                      that.data.posterData.push(posterData)
                      that.downloadImg(bj, (img) => {
                        posterData.bj = img
                        that.downloadImg(posterImg, (img) => {
                          posterData.posterImg = img
                          that.downloadImg(qrcode, (img) => {
                            posterData.qrcode = img
                            that.downloadImg(qicon, (img) => {
                              posterData.qicon = img
                              that.draw(posterData)
                            })
                          })

                        })
                      })
                    }
                  })
                })
        */
      },

    });
    var id = wx.getStorageSync('user').id;
    // var selmb = this.data.host + this.data.imgList[this.data.nowIdx].logo;  //e.currentTarget.dataset.img
    var requestData = {
      json: '{"path": "/pages/index/index?sjid=' + id + '", "width":430}',
      sellerId: '1'
    };
    wx.request({
      url: constant.host + '/imagetocode',
      data: requestData,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        this.setData({
          qrcode: res.data.url
        })
        // wx.navigateTo({
        //   url: '/pages/user/yqhb?posterImg=' + selmb + '&qrcode=' + res.data.url
        // })
      }
    })

  },
  onShareAppMessage(res) {
    return {
      title: '您的好友向您推荐了喜钱小程序点击查看',
      // path:'/pages/index/index'
      path: 'pages/index/index?sjopenid=' + app.globalData.userOpen.openid
    }
  },
  tohaibao: function(e) {
    var selmb = this.data.host + this.data.imgList[this.data.nowIdx].logo; //e.currentTarget.dataset.img
    var that = this
    var date = util.getNowDate();
  
    util.showLoading({
      title: '生成中'
    })
    var posterData = {}
    var qrcode = constant.imghost + that.data.qrcode;
    that.data.posterData.posterImg = selmb;
    that.data.posterData.qwxname = app.globalData.userInfo.nickName;
    that.data.posterData.qrcode = qrcode;
    let bj = selmb;
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




    // var id = wx.getStorageSync('user')[0].id;
    // var selmb = this.data.host + this.data.imgList[this.data.nowIdx].logo;  //e.currentTarget.dataset.img
    // var requestData = {
    //   json: '{"path": "/pages/index/index?sjid=' + id + '", "width":430}',
    //   sellerId: '1'
    // };
    // wx.request({
    //   url: constant.host + '/imagetocode',
    //   data: requestData,
    //   method: 'POST',
    //   header: {
    //     'content-type': 'application/x-www-form-urlencoded'
    //   },
    //   success: (res) => {
    //     wx.navigateTo({
    //       url: '/pages/user/yqhb?posterImg=' + selmb + '&qrcode=' + res.data.url
    //     })
    //   }
    // })




  },
  //点击放大功能
  previewImg: function () {
    console.log('预览')
    var that = this
    wx.canvasToTempFilePath({
      // x: 0,
      // y: 0,
      // width: this.data.canvasW,
      // height: this.data.canvasH,
      // destWidth: 4 * this.data.canvasW,
      // destHeight: 4 * this.data.canvasH,
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
  saveimage: function (mUrl) {

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
  downloadImg: function (url, fn) {
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
  draw: function (data) {
    var that = this
    new Promise((resolve, inject) => {

      console.log(data)
      const ctx = wx.createCanvasContext('poster')
      ctx.setFillStyle('white')
      ctx.setStrokeStyle("#ffffff")
      ctx.drawImage(data.bj, 0, 0, that.data.canvasW, that.data.hh)
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
        ctx.arc(275, that.data.hh - 75, 50, 0, Math.PI * 2, false);
        ctx.clip();
        ctx.drawImage(data.qrcode, 225, that.data.hh - 125, 100, 100);
        ctx.restore();
        ctx.draw();
        ctx.save();
        wx.hideLoading()
        // resolve(res)
      }).then((res) => {
        setTimeout(function () {
          that.previewImg();
        }, 500);

      })

    });

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
  //获取swiper高度
  getHeight: function(e) {
    var winWid = wx.getSystemInfoSync().windowWidth - 2 * 50; //获取当前屏幕的宽度
    var imgh = e.detail.height; //图片高度
    var imgw = e.detail.width;
    var sH = winWid * imgh / imgw + "px"
    this.setData({
      swiperH: sH //设置高度
    })
  },
  //swiper滑动事件
  swiperChange: function(e) {
    this.setData({
      nowIdx: e.detail.current
    })
  },

  //滑动获取选中商品
  // getSelectItem: function (e) {
  //   var that = this;
  //   var itemWidth = e.detail.scrollWidth / that.data.proList.length;//每个商品的宽度
  //   var scrollLeft = e.detail.scrollLeft;//滚动宽度
  //   var curIndex = Math.round(scrollLeft / itemWidth);//通过Math.round方法对滚动大于一半的位置进行进位
  //   for (var i = 0, len = that.data.proList.length; i < len; ++i) {
  //     that.data.proList[i].selected = false;
  //   }
  //   that.data.proList[curIndex].selected = true;
  //   that.setData({
  //     proList: that.data.proList,
  //     giftNo: this.data.proList[curIndex].id
  //   });
  // },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // }
})
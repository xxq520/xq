// pages/user/shoucang.js
const notification = require('../../utils/notification.js');
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
var app = getApp()
Page({
  data: {
    luntan: 1,
    struts: 1,
    imghost: constant.imghost,
    qrcode: '',
    page: 1,
    productData: [],
    is_select: false,
    qshopid: 0,
    qsum: 0
  },


  onLoad: function(options) {
    console.log(options);
    if (options.qshopid) {
      this.data.qshopid = options.qshopid;
      this.data.qsum = options.qsum;
    }
    // 页面显示
    this.shuju()
  },
  xq(e) {
    wx.navigateTo({
      url: '/pages/logs/logs?id=' + e.currentTarget.dataset.id + '&qshopid=' + e.currentTarget.dataset.shopid + '&tp=2',
    })
  },
  shuju() {
    var that = this;
    http.request({
      url: '/getQuserCoupon',
      data: {
        // quserid: wx.getStorageSync('user')[0].id,
        qstoreId: wx.getStorageSync('shop').id,
        qstatus: 2
      },
      success: function(e) {
        console.log('我的优惠劵', e)
        that.setData({
          productData: e,
        })
      },
    })
  },
  onShow: function(options) {

  },
  // ewm(e) {
  //   if (this.data.qshopid != 0) {
  //     if ((e.currentTarget.dataset.typeid == 2) && (this.data.qsum < e.currentTarget.dataset.full)) {

  //       wx.showToast({
  //         title: "满减金额不够",
  //         image: '/images/tksh.png',
  //         duration: 2000,
  //       });
  //     }
  //     var yhq = {};
  //     yhq.id = e.currentTarget.dataset.id;
  //     yhq.money = e.currentTarget.dataset.money
  //     notification.emit('notification_order_check_yhq', yhq);
  //     setTimeout(function() {
  //       wx.navigateBack();
  //     }, 500);

  //   } else {
  //     var that = this
  //     console.log('用户优惠券id', e.currentTarget.dataset.id)
  //     var requestData = {
  //       json: '{"path": "/view/index/index?id=' + e.currentTarget.dataset.id + '", "width":430}',
  //       sellerId: 1
  //     };
  //     wx.showLoading({
  //       title: '二维码加载中',
  //     })
  //     wx.request({
  //       url: constant.host + '/imagetocode',
  //       data: requestData,
  //       method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT    
  //       header: {
  //         'content-type': 'application/x-www-form-urlencoded'
  //       },
  //       success: (res) => {
  //         //二维码地址是服务器地址+'/img/+res.data.url
  //         wx.hideLoading()
  //         that.setData({
  //           qrcode: constant.host + '/img/' + res.data.url
  //         })
  //         console.log('二维码地址', that.data.qrcode)
  //       }
  //     })
  //   }
  // },
  // gbewm() {
  //   this.shuju()
  //   this.setData({
  //     qrcode: ''
  //   })
  // },
  ylq: function() {
    wx.showToast({
      title: "已领取",
      image: '/images/tksh.png',
      duration: 2000,
    });
  },
  struts(data) {
    console.log('点击参数', data.currentTarget.dataset.struts);
    var that = this;
    that.setData({
      struts: data.currentTarget.dataset.struts
    })
  },
  luntan: function(data) {
    console.log('点击参数', data.currentTarget.dataset.luntan);
    var that = this;
    that.setData({
      luntan: data.currentTarget.dataset.luntan
    })
    // if (data.currentTarget.dataset.luntan == 1) {
    //   that.loadProductData();
    // } else if (data.currentTarget.dataset.luntan == 2) {
    //   var nowDates = util.getNowDate();
    //   http.request({
    //     url: '/getQusgift',
    //     data: {
    //       qopenid: app.globalData.userOpen.openid
    //     },
    //     success: function(e) {
    //       console.log('我的优惠劵', e)
    //       for (var i = 0; i < e.length; i++) {
    //         if (e[i].qjstime < nowDates) {
    //           e[i].qnote = 3
    //         }
    //       }
    //       that.setData({
    //         productData: e,
    //       })
    //     },
    //   })
    // }
  },
  handleClick: function(e) {
    console.log(event);
    var yhq = event.currentTarget.id;
    if (this.data.is_select) {
      notification.emit('notification_order_check_yhq', yhq);
      setTimeout(function() {
        wx.navigateBack();
      }, 500);
    } else {
      wx.navigateTo({
        url: '../delivery/detail?delivery_id=' + delivery_id
      });
    }
  }
});
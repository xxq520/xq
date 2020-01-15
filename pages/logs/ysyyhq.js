const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
//const Quantity = require('../../component/quantity/index');
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
const timeStamp = require("../../utils/time.js");
var app = getApp();
Page({
  data: {
    num: 1,
    logs: [],
    gou: true,
    modalHidden: true,
    fenxiang: false,
    imghost: constant.imghost,
    coupon: {},
    business: {}
  },
  onLoad: function (options) {
    var that = this;
    console.log('页面参数', options)
 
    http.request({
      url: '/getQcoupons',
      data: {
        id: options.id,
      },
      success: function (e) {
        that.data.coupon = e[0];
        e[0].time=timeStamp.timeStamp(e[0].time).substr(0,10)
        e[0].endTime=timeStamp.timeStamp(e[0].endTime).substr(0,10)
        that.setData({
          phone: wx.getStorageSync('user').qphone,
          coupon: e[0]
        })
      },
    });

    http.request({
      url: '/getQbusiness',
      data: {
        id: options.qshopid,
      },
      success: function (e) {
       
        that.setData({
          business: e[0],
        });
      }
    })
  },

  
  
})
//index.js
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
//const Quantity = require('../../component/quantity/index');
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
const time = require("../../utils/time.js");
var app = getApp();
Page({
  data: {
    window_width: app.globalData.window_width,
    host: constant.imghost,
    width: app.systemInfo.windowWidth,
    height: app.systemInfo.windowHeight,
    information: []
  },


  onLoad: function() {
    var that = this;
    that.shuju();

  },
  del(e) {
    var that = this
    var dataset = e.currentTarget.dataset

    wx.showModal({
      title: '此操作不返还红包余额',
      content: '确定删除吗?',
      success(res) {
        if (res.confirm) {
          http.request({
            url: '/updateQinformation',
            data: {
              id: e.currentTarget.dataset.id,
              state: 3
            },
            success: function (e) {
              that.data.information.splice(dataset.index, 1)

              that.setData({
                information: that.data.information
              })
            }
          })
        }
      }
    })


  },

  onShow: function() {
    // this.goTop();
  },
  shuju: function() {
    var that = this;
    //红包信息
    http.request({
      url: '/getQinformation',
      data: {
        storeId: wx.getStorageSync('shop').id,
        orderstr: "and a.state in (1,2)"
      },
      success: function(e) {
        for (var i = 0; i < e.length; i++) {
          e[i].img = e[i].img.split(",")
        }
        for(var i=0;i<e.length;i++){
          e[i].time= time.timeStamp(e[i].time)
        }
        that.setData({
          information: e
        })
      },
    });

  },




})
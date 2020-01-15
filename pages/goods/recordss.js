// pages/goods/recordss.js
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
var app = getApp();
Page({
  /*** 页面的初始数据*/
  data: {
    orderlist: {},
    imghost: constant.imghost
  },
  /*** 生命周期函数--监听页面加载*/
  onLoad: function(e) {
    if (e.orderlist != undefined) {
      const orderlist = JSON.parse(e.orderlist);
      orderlist.forEach((item, index) => {
        item.qcreateTime = item.qcreateTime.substring(0, 10)
        item.qprocedureName = item.qprocedureName.split("【")[0]
      })
      this.setData({
        orderlist: orderlist
      })
    }
  }
})
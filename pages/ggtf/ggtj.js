// pages/shangpgl/shangpfb.js
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
var app = getApp();
Page({
  /*** 页面的初始数据*/
  data: {
    invest: {}
  },
  /*** 生命周期函数--监听页面加载*/
  qtitle(e) {
    this.data.invest.qtitle = e.detail.value
  },
  qtext(e) {
    this.data.invest.qtext = e.detail.value
  },
  /*** 生命周期函数--监听页面初次渲染完成*/
})
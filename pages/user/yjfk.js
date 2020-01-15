// pages/user/yjfk.js
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
const sensitive = require('../../utils/sensitive')
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    yijianinfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  yijian(e) {
    console.log('意见',e)
    this.data.yijianinfo.yijian = e.detail.value
  },
  phone(e) {
    this.data.yijianinfo.phone = e.detail.value
  },
  tijiao(e) {
    var that = this
    if (!this.data.yijianinfo.yijian) {
      wx.showToast({
        title: '意见内容未填写',
        image: '/images/search_no.png',
        duration: 2000
      })
      return
    }
    if (!this.data.yijianinfo.phone) {
      wx.showToast({
        title: '联系电话未填写',
        image: '/images/search_no.png',
        duration: 2000
      })
      return
    }
    if (!util.isPhone(this.data.yijianinfo.phone )) {
      wx.showToast({
        title: '电话号码格式错误',
        image: '/images/search_no.png',
        duration: 2000
      })
      return
    }
    //判断反馈的内容是否包含特殊字符
    var arr=sensitive.split('，');
    for(var i=0;i<arr.length;i++){
      if(this.data.yijianinfo.yijian.indexOf(arr[i])!=-1){
        wx.showToast({
          title: '反馈内容不允许有特殊字符！',
          icon:'none',
          duration: 2000
        })
        return
      }
    }
    http.request({
      url: '/insertQfeedback',
      data: {
        qopenid: app.globalData.userOpen.openid,
        qwxicon: app.globalData.userInfo.avatarUrl,
        qwxname: app.globalData.userInfo.nickName,
        qcontent: that.data.yijianinfo.yijian,
        qphone: that.data.yijianinfo.phone
      },
      success: function(e) {
        wx.showToast({
          title: '反馈成功',
          icon: 'success',
          duration: 2000
        })
        setTimeout(function () {
          wx.hideLoading()
          wx.switchTab({
            url: '/pages/user/user',
          })
        }, 1000);
      },
    });

  },
  /**
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
  onShareAppMessage: function() {

  }
})
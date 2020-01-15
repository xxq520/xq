// pages/index/fenxyl.js
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
var app = getApp();
Page({
  /*** 页面的初始数据*/
  data: {
    host: constant.imghost,
    canIUse:false
  },
  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    var that=this
    wx.getSetting({
      success: function (res) {
        console.log('os授权信息：', res);
        if (res.authSetting['scope.userInfo']) {
        }else{
          that.setData({
            canIUse:true
          })
        }
      }
    })
  },
  bindGetUserInfo: function(e) {
    var that = this;
    wx.getSetting({
      success: function(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            lang: 'zh_CN',
            success: function(res) {
              var objz = {};
              objz.avatarUrl = res.userInfo.avatarUrl;
              objz.nickName = res.userInfo.nickName;
              app.globalData.userInfo = res.userInfo;
              wx.setStorageSync('userInfo', objz); //存储userInfo
              http.request({
                url: '/getQuser',
                data: {
                  qopenid: app.globalData.userOpen.openid
                },
                success: function(e) {
                  console.log('用户信息', e);
                  if (e.length == 0) {
                    http.request({
                      url: '/insertQuser',
                      data: {
                        qopenid: app.globalData.userOpen.openid,
                        qnick: app.globalData.userInfo.nickName,
                        qicon: app.globalData.userInfo.avatarUrl,
                        qsjopenid: that.data.sjopenid == '' ? '' : that.data.sjopenid,
                        qnum: 0,
                        qxin: 0
                      },
                      success: function(e) {
                        http.request({
                          url: '/getQuser',
                          data: {
                            qopenid: app.globalData.userOpen.openid
                          },
                          success: function(e) {
                            wx.setStorageSync('user', e); //存储user
                            that.shuju()
                          }
                        })
                      },
                    })
                  } else if (that.data.sjopenid != '') {
                    http.request({
                      url: '/updateQuser',
                      data: {
                        id: e[0].id,
                        qopenid: app.globalData.userOpen.openid,
                        qnick: app.globalData.userInfo.nickName,
                        qicon: app.globalData.userInfo.avatarUrl,
                        qsjopenid: that.data.sjopenid == '' ? '' : that.data.sjopenid,
                      }
                    })
                  } else {
                    wx.setStorageSync('user', e); //存储user
                  }
                }
              })
            }
          });
          that.setData({
            canIUse: false
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '请重新授权登录！',
            showCancel: false
          });
          that.setData({
            canIUse: true
          })
        }
      }
    })
  },
  onShareAppMessage: function () {
      return {
        title:"一起来领券吧",
        path: 'pages/index/index?sjopenid=' + app.globalData.userOpen.openid,
      }
  }
})
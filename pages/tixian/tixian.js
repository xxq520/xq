// pages/tixian/tixian.js
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
var app = getApp();
Page({
  /*** 页面的初始数据*/
  data: {
    tp: 0,
    money: 0,
    txmoney: '',
    xiane: 20,
    shouxu: '10%',
    tijiao: false
  },
  /*** 生命周期函数--监听页面加载*/
  onLoad: function(options) {
    console.log('页面参数', options)
    if (options.money != undefined) {
      this.setData({
        money: options.money
      })
    }
    if (options.tp != undefined) {
      this.data.tp = options.tp;
      this.data.xiane = options.tp == 1 ? 20 : 100;
      this.data.shouxu = options.tp == 1 ? (app.globalData.sysinfo.qscale + '%') : (app.globalData.sysinfo.qbscale + '%');
      this.setData({
        tp: options.tp,
        xiane: this.data.xiane,
        shouxu: this.data.shouxu
      })
    }
  },
  quanbu(e) {
    this.setData({
      txmoney: this.data.money
    })
  },
  money(e) {
    console.log('提现金额', e.detail.value)
    this.data.txmoney = e.detail.value
  },
  tixian(e) {
    var that = this
    if (this.data.txmoney == '' || this.data.txmoney == 0) {
      wx.showToast({
        title: '金额未填写',
        image: '/images/search_no.png',
        duration: 2000
      })
      return
    }
    if (isNaN(this.data.txmoney)) {
      wx.showToast({
        title: '提现金额有误',
        image: '/images/search_no.png',
        duration: 2000
      })
      return
    }
    //判断用户的提现的金额是否符合规格
    if (parseFloat(this.data.txmoney) < this.data.xiane) {
      wx.showToast({
        title: '至少提现' + this.data.xiane + '元',
        image: '/images/search_no.png',
        duration: 2000
      })
      return
    }
    //判断用户的余额是否充足
    if (parseFloat(this.data.txmoney) > parseFloat(this.data.money)) {
      wx.showToast({
        title: '账户余额不足',
        image: '/images/search_no.png',
        duration: 2000
      })
      return
    }
    //防止用户二次点击
    if (that.data.tijiao) {
      wx.showToast({
        title: '请勿重复提交',
        image: '/images/search_no.png',
        duration: 2000
      })
      return
    } else {
      that.setData({
        tijiao: true
      })

      http.request({
        url: '/insertQhongbao',
        data: {
          qtype: that.data.tp == 1 ? 4 : 8,
          qstatus: 1,
          qid: that.data.tp == 1 ? wx.getStorageSync('user').id : wx.getStorageSync('shop').id,
          qstore: that.data.tp == 1 ? wx.getStorageSync('user').qnick : wx.getStorageSync('shop').storeName,
          qicon: that.data.tp == 1 ? wx.getStorageSync('user').qicon : wx.getStorageSync('shop').logo,
          qsum: that.data.txmoney,
          qnum: 1,
        },
        success: function(e) {
          if (that.data.tp == 1) {
            http.request({
              url: '/updateUserBanlance',
              data: {
                id: wx.getStorageSync('user').id,
                qnum: that.data.txmoney
              },
              success: function(data) {
                wx.showToast({
                  title: '申请成功',
                  icon: 'success',
                  duration: 2000
                })
                setTimeout(function() {
                  wx.reLaunch({
                    url: '/pages/tixian/tixiants?tp=1',
                  })
                  wx.hideLoading()
                }, 2000)
              }
            })
          } else {
            //更改商户的余额
            http.request({
              url:'/updateQbusinessWithdraw',
              data:{
                id: wx.getStorageSync('shop').id,
                money:that.data.txmoney.toString()
              },
              success: function(data) {
                wx.showToast({
                  title: '申请成功',
                  icon: 'success',
                  duration: 2000
                })
                setTimeout(function() {
                  wx.reLaunch({
                    url: '/pages/tixian/tixiants?tp=2',
                  })
                  wx.hideLoading()
                }, 2000)
              }
            })
          }
        }
      })
    }
  }
})
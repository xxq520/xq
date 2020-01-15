//index.js
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
//const Quantity = require('../../component/quantity/index');
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
var app = getApp();
Page({
  data: {
    statusBarHeight: app.globalData.statusBarHeight,
    window_width: app.globalData.window_width,
    circular: true,
    vertical: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    luntan: 1,
    topNum: 0,
    modalHidden: true,
    djtc: true,
    typeid: 0,
    host: constant.imghost,
    width: app.systemInfo.windowWidth,
    height: app.systemInfo.windowHeight,
    banner: [],
    functions: [],
    information: []
  },

  onLoad: function(e) {
    console.log('跳转参数', e)
    wx.setNavigationBarTitle({
      title: e.name
    })
    var that = this;
    // that.data.typeid=e.id
    that.setData({
      typeid: e.id,
      timer:this.showImg()
    })
    that.shuju();
  },

  luntan: function(e) {
    this.setData({
      luntan: e.currentTarget.dataset.luntan
    })
    var that = this
    //附近商家
    if (that.data.luntan == 1) {
      http.request({
        url: '/getQinformation',
        data: {
          lat: wx.getStorageSync('latitude'),
          lng: wx.getStorageSync('longitude'),
          state: 2
        },
        success: function(e) {
          for (var i = 0; i < e.length; i++) {
            e[i].img = e[i].img.split(",")
            e[i].splice(6)
          }
          console.log('附近商家', e)
          that.setData({
            information: e
          })
        },
      });
      //信息红包
    } else if (that.data.luntan == 2) {
      http.request({
        url: '/getQinformation',
        data: {
          state: 2,
          hbType: 1
        },
        success: function(e) {
          for (var i = 0; i < e.length; i++) {
            e[i].img = e[i].img.split(",")
            e[i].splice(6)
          }
          console.log('红包信息', e)
          that.setData({
            //信息红包展示的信息
            information: e
          })
        },
      });
      //商家推荐
    } else if (that.data.luntan == 3) {
      http.request({
        url: '/getQbusiness',
        data: {
          hb: 1
        },
        success: function(e) {
          console.log('商家推荐', e)
          for (var i = 0; i < e.length; i++) {
            if (e[i].views > 10000) {
              e[i].views = (e[i].views / 10000).toFixed(2) + '万'
            }
          }
          that.setData({
            //商家推荐的商品数据
            business: e,
          });
        }
      })
      // http.request({
      //   url: '/getQinformation',
      //   data: {
      //     hbType: 2
      //   },
      //   success: function (e) {

      //     for (var i = 0; i < e.length; i++) {
      //       e[i].img = e[i].img.split(",")
      //     }
      //     console.log('红包信息', e)
      //     that.setData({
      //       information: e
      //     })
      //   },
      // });
    }

  },
  //图片懒加载
  showImg() {
    var that=this;
    var timer;
    return function(){
      //每次滚动条触发事件就先清除定时器，让最后一次执行的事件才生效
      if(timer){clearTimeout(timer)}
      timer=setTimeout(function(){
        //获取类名未img的元素距离顶部的高度
        wx.createSelectorQuery().selectAll('.img').boundingClientRect((ret) => {
          // 页面的可视高度
          let height = that.data.height  
          //懒加载图片的总数
          var arr=that.data.information;
          //计录上一次懒加载的索引，下次就可以从记录当中取出作为循环判断的条件
          var num=0;
          ret.forEach((item, index) => {
            if (item.top <= height) {
              // 判断是否在显示范围内
              num++;
              //让当前的懒加载图片显示
              arr[index].show= true 
            }
          })
          that.setData({
            information:arr,
            defaultNum:num
          })
        }).exec()
      },400)
    }
  },
  onShow: function() {
    // this.setData({
    //   typeid:0,
    //   luntan: 1
    // })
    // this.shuju()
    // this.goTop();
  },
  shuju: function() {
    var that = this;

    //红包信息
    http.request({
      url: '/getQinformation',
      data: {
        lat: wx.getStorageSync('latitude'),
        lng: wx.getStorageSync('longitude'),
        state: 2,
        typeId: that.data.typeid
      },
      success: function(e) {
        for (var i = 0; i < e.length; i++) {
          e[i].img = e[i].img.split(",")
        }
        console.log('红包信息', e)
        that.setData({
          information: e
        })
      },
    });

  },



  stopPageScroll() {
    return
  },


  // 获取滚动条当前位置
  scrolltoupper: function(e) {
    //触发图片懒加载
    this.data.timer()
    // console.log(e)
    if (e.detail.scrollTop > 100) {
      this.setData({
        floorstatus: true
      });
    } else {
      this.setData({
        floorstatus: false
      });
    }
  },



  //回到顶部
  goTop: function(e) { // 一键回到顶部
    this.setData({
      topNum: this.data.topNum = 0
    });
  },




})
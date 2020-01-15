//app.js
import AppIMDelegate from "./delegate/app-im-delegate";
const constant = require("./utils/constant.js");
const http = require("./utils/http.js");
//引入加载失败重新加载层组件
const empty = require("./components/empty/constant/EmptyConstant")
App({
  globalData: {
    empty:empty,
    admin: false,
    cxcity: 1,
    rzmoney: 0, //入驻费用
    shoplogin: false, //商户登录状态
    userInfo: {},
    imuserInfo: {},
    window_width: 0,
    window_height: 0,
    window_height2: 0,
    userOpen: {},
    logonCode: '',
    tuiGuangID: 0,
    spid: 0,
    delivery_list: {},
    sysinfo: {},
    statusBarHeight: wx.getSystemInfoSync()['statusBarHeight'],//导航栏高度
    //是否首次进入tabbar我的页面
    userIsTrue:0,
    //请求错误的提示图片
    imgLayouSrc:"../empty/res/image/icon_empty_error.png",

    titleLayou:"网络加载失败"
  },
  getIMHandler() {
    return this.appIMDelegate.getIMHandlerDelegate();
  },
  onLaunch: function(options) {
    this.appIMDelegate = new AppIMDelegate(this);
    this.appIMDelegate.onLaunch(options);
    //调用API从本地缓存中获取数据
    var that = this
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs);
    wx.setStorageSync('phone', '');
    wx.getSystemInfo({
      success: function(res) {
        //this.globalData.window_width = res.windowWidth
        //this.globalData.window_height = res.windowHeight
        that.systemInfo = res;
      }
    });
    wx.getSystemInfo({
      success: function(res) {
        this.globalData.window_width = res.windowWidth;
        this.globalData.window_height = res.windowHeight;
        this.globalData.window_height2 = res.screenHeight;
      }.bind(this)
    });

    this.globalData.userOpen = wx.getStorageSync('userOpen') || {};
    this.globalData.userInfo = wx.getStorageSync('userInfo') || {};
    wx.login({
      success: function(res) {
        if (res.code) {
          that.globalData.logonCode = res.code;
          var l = constant.host + '/getOpenid';
          wx.request({
            url: l,
            data: {
              json: res.code
            },
            method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT    
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: function(res) {
              var obj = {};
              obj.openid = res.data.data.openid;
              obj.expires_in = Date.now() + res.data.data.expires_in;
              that.globalData.userOpen = res.data.data;
              wx.setStorageSync('userOpen', obj); //存储openid
              //获取到用户的openid的时候就去请求后台返回用户的数据
              //如果用户的信息在缓存中已经存在则不再请求接口查询用户信息，触发数据发生变动
              if(!wx.getStorageSync('user')){
                http.request({
                  url: '/getQuser',
                  data: {
                    qopenid: that.globalData.userOpen.openid,
                  },
                  success: function(e) {
                    if (e.length != 0) {
                      wx.setStorageSync('user', e[0]); //存储user
                    }
                  }
                })
              }
            }
          })
        }
      }
    });
   // setTimeout(()=>{
   //   if(that.globalData.userOpen.openid){
   //     wx.request({
   //       url: constant.host + '/getQaddress',
   //       data: {
   //         qopenId: that.globalData.userOpen.openid,
   //         qdefault: 1
   //       },
   //       success: function(data) {
   //         that.globalData.delivery_list = data.data.data
   //       }
   //     })
   //   }
   // },4000)
  },
  onHide() {
    this.appIMDelegate.onHide();
  },
  onShow(options) {
    this.appIMDelegate.onShow(options);
    wx.getStorageInfo({
      success (res) {
      }
    })
  },
  getUserInfo: function(cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function() {
          wx.getUserInfo({
            success: function(res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  systemInfo: null,
})
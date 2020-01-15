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
    information: [],
    page: 0,
    limit: 10,
    noinfo: false,
    load: true,
    //设置数据加载状态组件的状态  1加载中  2自己内容  
    //-1加载错误  0数据为空   默认就是2  自定义图片和文字3
    empty:app.globalData.content,
    //请求错误提示的图片
    imgLayouSrc:app.globalData.imgLayouSrc,
    //请求错误时提示的文字
    titleLayou:app.globalData.titleLayou,
    showGetUser:false
  },
  //点击附近商家、信息红包、商家红包事件
  luntan: function(e) {
    this.setData({
      luntan: e.currentTarget.dataset.luntan,
      noinfo:false
    })
    var that = this
    //是否点击附近商家
    if (that.data.luntan == 1) {
      that.data.page=0
      http.request({
        url: '/getQinformation',
        data: {
          lat: wx.getStorageSync('latitude'),
          lng: wx.getStorageSync('longitude'),
          state: 2,
          orderstr: 'order by id desc ' +'limit ' + that.data.page * that.data.limit + ',' + that.data.limit
        },
        success: function(e) {
          for (var i = 0; i < e.length; i++) {
            e[i].img = e[i].img.split(",")
            e[i].time=time.timeStamp(e[i].time)
          }
          that.setData({
            information: e,
            page:0
          })
        },
      },false,"附近商家加载失败");
    } else if (that.data.luntan == 2) {
      that.data.page=0
      http.request({
        url: '/getQinformation',
        data: {
          state: 2,
          hbType: 1,
          orderstr: 'order by id desc ' + 'limit ' + that.data.page * that.data.limit + ',' + that.data.limit
        },
        success: function(e) {
          for (var i = 0; i < e.length; i++) {
            e[i].img = e[i].img.split(",")
            e[i].time=time.timeStamp(e[i].time)
          }
          that.setData({
            information: e,
            page:1
          })
        },
      },false,"红包信息加载失败");
    } else if (that.data.luntan == 3) {
      that.data.page=0
      http.request({
        url: '/getQbusiness',
        data: {
          state: 2,
          hb: 1,
          orderstr: 'order by id desc ' + 'limit ' + that.data.page * that.data.limit + ',' + that.data.limit
        },
        success: function(e) {
          for (var i = 0; i < e.length; i++) {
            e[i].time=time.timeStamp(e[i].time)
            if (e[i].views > 10000) {
              e[i].views = (e[i].views / 10000).toFixed(2) + '万'
            }
          }
          that.setData({
            business: e,
            page:1
          });
        }
      },false,"商户信息加载失败")
    }
  },
  getUser(e){
    if(e.detail.errMsg==='getUserInfo:ok'){
      this.setData({
        showGetUser:false
      })
      this.onLoad()
      this.onShow()
    }
    this.bindGetUserInfo()
  },
  onLoad: function() {
    var that = this;
    that.shuju();
    this.setData({
      timer:this.showImg()
    })
    wx.getSetting({
      success: function(res) {
        if (res.authSetting['scope.userInfo']) {
          that.setData({
            showGetUser:false
          })
        }else{
          that.setData({
            showGetUser:true
          })
        }
      }
    })
  },
  fucClick(e) {
    let id = e.currentTarget.dataset.id
    let name = e.currentTarget.dataset.name
    wx.navigateTo({
      url: '/pages/xinxfll/xinxfl?id=' + id + '&name=' + name,
    })
  },
  onShow: function() {
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
        wx.createSelectorQuery().selectAll('.row-xx').boundingClientRect((ret) => {
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
      },150)
    }
  },
  emptyCallback(e){
    this.onLoad()
  },
  bindGetUserInfo: function(e) {
    var that = this;
    wx.getSetting({
      success: function(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function(res) {
              that.onLoad()
              var objz = {};
              objz.avatarUrl = res.userInfo.avatarUrl;
              objz.nickName = res.userInfo.nickName;
              app.globalData.userInfo = res.userInfo;
              wx.setStorageSync('userInfo', objz); //存储userInfo
              that.setData({
                userInfo: res.userInfo,
                canIUse: false
              })
              http.request({
                url: '/getQuser',
                data: {
                  qopenid: app.globalData.userOpen.openid,
                },
                success: function(data) {
                  if (data.length == 0) {
                    http.request({
                      url: '/insertQuser',
                      data: {
                        qopenid: app.globalData.userOpen.openid,
                        qnick: res.userInfo.nickName,
                        qicon: res.userInfo.avatarUrl,
                        qnum: 0,
                        qxin: 0
                      },
                      success: function(data) {
                      }
                    })
                  } else {
                    wx.setStorageSync('user', data[0]);
                    that.setData({
                      user: wx.getStorageSync('user')
                    })
                  }
                }
              })
            }
          });
        } else {
          wx.showModal({
            title: '提示',
            content: '请重新授权登录！',
            showCancel: false
          });
        }
      }
    })
  },
  scroll:function(){this.showImg()},
  onScroll: util.throttle(function(e) {
    var that = this
    that.showImg()
    that.setData({
      //noinfo: false,
      load: true
    })
    if (that.data.luntan == 1) {
      http.request({
        url: '/getQinformation',
        data: {
          lat: wx.getStorageSync('latitude'),
          lng: wx.getStorageSync('longitude'),
          state: 2,
          orderstr: 'order by id desc ' +'limit ' + (that.data.page+1) * that.data.limit + ',' + that.data.limit
        },
        success: function(e) {
          for (var i = 0; i < e.length; i++) {
            e[i].img = e[i].img.split(",")
            e[i].time=time.timeStamp(e[i].time)
          }
          that.setData({
            information: that.data.information.concat(e),
            page:that.data.page+1,
            noinfo: e.length < that.data.limit ? true : false,
            load: false
          })
        },
      },false,"附近商家加载失败");
    } else if (that.data.luntan == 2) {
      http.request({
        url: '/getQinformation',
        data: {
          state: 2,
          hbType: 1,
          orderstr: 'order by id desc ' + 'limit ' + that.data.page * that.data.limit + ',' + that.data.limit
        },
        success: function(e) {
          for (var i = 0; i < e.length; i++) {
            e[i].img = e[i].img.split(",")
            e[i].time=time.timeStamp(e[i].time)
          }
          that.setData({
            information: that.data.information.concat(e),
            page:that.data.page+1,
            noinfo: e.length < that.data.limit ? true : false,
            load: false
          })
        },
      },false,"红包信息加载失败");
    } else if (that.data.luntan == 3) {
      http.request({
        url: '/getQbusiness',
        data: {
          state: 2,
          hb: 1,
          orderstr: 'order by id desc ' + 'limit ' + that.data.page * that.data.limit + ',' + that.data.limit
        },
        success: function(e) {
          for (var i = 0; i < e.length; i++) {
            e[i].time=time.timeStamp(e[i].time)
            if (e[i].views > 10000) {
              e[i].views = (e[i].views / 10000).toFixed(2) + '万'
            }
          }
          that.setData({
            business:that.data.business.concat(e),
            page:that.data.page+1,
            noinfo: e.length < that.data.limit ? true : false,
            load: false
          });
        }
      },false,"商户信息加载失败")
    }
  }, 2000),
  shuju: function() {
    var that = this;
    //轮播图
    http.request({
      url: '/getQbanner',
      data: {
        state: 1,
        type: 5
      },
      success: function(e) {
        that.setData({
          banner: e
        })
      },
    },false,that);
    //菜单栏
    // http.request({
    //   url: '/getQbusinessType',
    //   data: {
    //     uniacid: 2
    //   },
    //   success: function(e) {
    //     that.setData({
    //       functions: e.data,
    //       system: e.data1
    //     })
    //   },
    // },false,that);
    //红包信息
    http.request({
      url: '/getQinformation',
      data: {
        lat: wx.getStorageSync('latitude'),
        lng: wx.getStorageSync('longitude'),
        state: 2,
        orderstr:'order by id desc '+'limit ' + that.data.page * that.data.limit + ',' + that.data.limit
      },
      success: function(e) {
        for (var i = 0; i < e.length; i++) {
          e[i].img = e[i].img.split(",")
          e[i].time=time.timeStamp(e[i].time)
          e[i].img.splice(6)
        }
        console.log(e.length < that.data.limit ? true : false)
        that.setData({
          load: false,
          noinfo: e.length < that.data.limit ? true : false,
          information: e
        })
      },
    },false,that);
  },
  bannertz: function(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.appid,
    })
  },
  ruzhu: function() {
    ///
    var that = this
    if (wx.getStorageSync('user').qnote == 99) {
      wx.navigateTo({
        url: '/pages/user/zhuczc',
      })
    } else {
      http.request({
        url: '/getQbusiness',
        data: {
          userId: wx.getStorageSync('user').id,
        },
        success: function(data) {
          if (data.length != 0) {
            wx.showModal({
              title: '系统提示',
              content: '当前微信已注册商户，是否登录？',
              success(res) {
                if (res.confirm) {
                  wx.setStorageSync('shop', data[0])
                  wx.showLoading({
                    title: '正在登录',
                  })
                  setTimeout(function() {
                    wx.reLaunch({
                      url: '/pages/booszy/booszy',
                    })
                  }, 1000);
                }
              }
            })
          } else if (wx.getStorageSync('user').qnote == 2) {
            wx.navigateTo({
              url: '/pages/user/zhuczc',
            })
          } else {
            wx.navigateTo({
              url: '/pages/user/shangjrz',
            })
          }
        }
      });
    }
  },
  stopPageScroll() {
    return
  },
  // 获取滚动条当前位置
  scrolltoupper: function(){
    this.data.timer()
    util.throttle(function(e) {
      if (e.detail.scrollTop > 100) {
        this.setData({
          floorstatus: true
        });
      } else {
        this.setData({
          floorstatus: false
        });
      }
    }, 10000)
  },
  //回到顶部
  goTop: function(e) { // 一键回到顶部
    this.setData({
      topNum: this.data.topNum = 0
    });
  },
})
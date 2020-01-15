const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
// 覆盖baidu返回的城市位置
var DEBUG_OVERRIDE_CITY = false;
var app = getApp();
var isLoadCity=false
var village_LBS = function(that) {
  wx.getLocation({
    type: 'gcj02', //返回可以用于wx.openLocation的经纬度
    success: function(res) {
      that.getCity(res.latitude, res.longitude);
      wx.setStorageSync('latitude', res.latitude); //存储latitude
      wx.setStorageSync('longitude', res.longitude); //存储longitude
    }
  })
}
Page({
  data: {
    statusBarHeight: app.globalData.statusBarHeight,
    circular: true,
    vertical: true,
    autoplay: true,
    interval: 4000,
    duration: 1000,
    paixu: ['人气最多', '最新入驻', '最低消费'],
    pxid: 99,
    sjid: '',
    headLineList: [],
    headLineList2: [],
    topNum: -1,
    page: 0,
    limit: 20,
    tpid: 0,
    modalHidden: false,
    djtc: true,
    luntan: 1,
    location: '',
    goodsList: [{
      actEndTime: '2018-12-14 18:00:00.0'
    }],
    actEndTime: [],
    actEndTimeList: [],
    host: constant.imghost,
    width: app.systemInfo.windowWidth,
    height: app.systemInfo.windowHeight,
    countDownList: [],
    banner: [],
    functions: [],
    business: [],
    goods: [],
    noinfo: false,
    load: true,
    zsyhj: false,
    zsyhjid: 0,
    alertBox:false,
    canIUse:false,
    //定义骨架屏是否显示
    showSkeleton:true,
    //定义骨架屏是否显示
    skeletonisTrue:true,
    //懒加载图片的默认索引
    //设置数据加载状态组件的状态  1加载中  2自己内容
    //-1加载错误  0数据为空   默认就是2  自定义图片和文字3
    empty:app.globalData.content,
    //请求错误提示的图片
    imgLayouSrc:app.globalData.imgLayouSrc,
    //请求错误时提示的文字
    titleLayou:app.globalData.titleLayou,
    userIsTrue:false,
    lazyImg:[]
  },
  onShareAppMessage(res) {
  },
  onPageScroll(){
    this.data.timer()
  },
  //图片懒加载
  showImg() {
    var that=this;
    var timer;
    //已懒加载图片的数量
    var layNum=0
    return function(){
      //每次滚动条触发事件就先清除定时器，让最后一次执行的事件才生效
      if(timer){clearTimeout(timer)}
      timer=setTimeout(function(){
        //获取类名未img的元素距离顶部的高度
        wx.createSelectorQuery().selectAll('.img').boundingClientRect((ret) => {
          // 页面的可视高度
          let height = that.data.height  
          //懒加载图片的总数
          var lazyImg=that.data.lazyImg;
          //计录上一次懒加载的索引，下次就可以从记录当中取出作为循环判断的条件
          ret.forEach((item, index) => {
            if (item.top <= height) {
              // 判断是否在显示范围内
              //让当前的懒加载图片显示
              // arr[index].show= true
              lazyImg[index]=true
            }
          })
          that.setData({
            lazyImg:lazyImg,
          })
        }).exec()
      },100)
    }
  },
  onPullDownRefresh() {
    // wx.showNavigationBarLoading()
    var that = this
    // that.shuju();
    that.headLineLoad();
    this.onLoad()
    this.onScroll()
    //  wx.hideNavigationBarLoading()
    wx.stopPullDownRefresh()
  },
  // handleLoading() {
  //   $Toast({
  //     content: '加载中',
  //     type: 'loading'
  //   });
  // },
  zsyhj(e) {
    this.setData({
      zsyhj: this.data.zsyhj ? false : true,
      zsyhjid: e.currentTarget.dataset.zsyhjid == this.data.zsyhjid ? 0 : e.currentTarget.dataset.zsyhjid
    })
  },
  getUserIsTrue(e){
    var that=this
    if(that.data.userIsTrue){
      wx.navigateTo({
        url: e.currentTarget.dataset.url||e.dataset.url,
      })
    }else{
      wx.getSetting({
        success: function(res) {
          if (res.authSetting['scope.userInfo']) {
            that.setData({
              showGetUser:false,
              userIsTrue:true
            })
            if(e.currentTarget.dataset.url||e.dataset.url){
              wx.navigateTo({
                url: e.currentTarget.dataset.url||e.dataset.url,
              })
            }
          }else{
            that.setData({
              showGetUser:true
            })
          }
        }
      })
    }
  },
  getUser(e){
    if(e.detail.errMsg==='getUserInfo:ok'){
      this.setData({
        showGetUser:false,
        page:0
      })
      //当用户重新授权完成就重新请求第一页数据
    }
    this.bindGetUserInfo(e)
  },
  onReachBottom() {
    if (!this.data.noinfo) {
      this.onScroll()
    }
  },
  shaixuan() {
    this.setData({
      modalHidden: true

    })
  },
  gbtc() {
    this.setData({
      modalHidden: false
    })
  },
  shuax: util.throttle(function(e) {
    //wx.hideLoading()
    wx.startPullDownRefresh()
  }, 1000),

  ruzhu: function() {
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
          //  state:3,
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
                    wx.redirectTo({
                      url: '/pages/booszy/booszy',
                    })
                  }, 2000);
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
      },false,that);
    }

  },
  catchTouchMove: function(res) {
    return false
  },
  /**
   *  点击确认
   */

  map: function() {
    var that = this;
    var name = '';
    wx.openLocation({ //​使用微信内置地图查看位置。
      latitude: 22.5542080000, //要去的纬度-地址
      longitude: 113.8878770000, //要去的经度-地址
      name: "宝安中心A地铁口",
      address: '宝安中心A地铁口'
    })
  },
  sptype(e) {
    this.setData({
      tpid: e.currentTarget.dataset.tpid
    })
  },
  chongzhi() {
    this.setData({
      tpid: 0
    })
  },
  bindPickerChange(e) {
    var that = this;
    var tp = e.currentTarget.dataset.tp
    that.setData({
      pxid: tp,
      page: 0,
    })
    //商户列表
    http.request({
      url: '/getQbusiness',
      data: {
        state: 2,
        hb: tp == 1 ? 1 : '',
        coordinates: wx.getStorageSync('latitude') + ',' + wx.getStorageSync('longitude'),
        otherterm: "and cityname like '%" + (app.globalData.cxcity == 2 ? wx.getStorageSync('city') + wx.getStorageSync('district') : wx.getStorageSync('city')) + "%'" + 'order by ' + (tp == 0 ? 'views desc' : (tp == 1 ? 'id desc' : 'id desc')),
        orderstr: 'limit ' + that.data.page * that.data.limit + ',' + that.data.limit
      },
      success: function(e) {
        setTimeout(()=>{
          that.data.timer()
        },100)
        that.setData({
          modalHidden: false,
          noinfo: e.length < that.data.limit ? true : false,
          business: e,
        });
      }
    },false,that,1)
  },

  bannertz: function(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.appid,
    })
  },
  onReady: function() {
    this.getNewCity()
  },
  getNewCity(){
    var that = this;
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) { //非初始化进入该页面,且未授权
          wx.showModal({
            title: '是否授权当前位置',
            content: '需要获取您的地理位置，请确认授权，否则地图功能将无法使用',
            success: function(res) {
              console.log(res)
              if (res.cancel) {
                wx.showModal({
                  title: '请授权位置信息',
                  content: '无法获取您的地理位置，请重新授权，否则地图功能将无法使用',
                  success: function(res) {
                    if (res.cancel) {
                      that.getNewCity()
                    } else if (res.confirm) {
                      that.getNewCity()
                    }
                  }
                })
              } else if (res.confirm) {
                village_LBS(that);
                wx.openSetting({
                  success: function(data) {
                    if (data.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 2000
                      })

                      //再次授权，调用getLocationt的API
                      village_LBS(that);
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        image: '/image/info.png',
                        duration: 2000
                      })
                    }
                  }
                })
              }
            },fail(res) {
              wx.showModal({
                title: '请授权位置信息',
                content: '无法获取您的地理位置，请重新授权，否则地图功能将无法使用',
                success: function(res) {
                  if (res.cancel) {
                    that.getNewCity()
                  } else if (res.confirm) {
                    that.getNewCity()
                  }
                }
              })
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) { //初始化进入
          village_LBS(that);
        }
      }
    })
  },
  toyhq: function() {
    wx.navigateTo({
      url: '/pages/user/shangjrz',
    })
  },
  emptyCallback(e){
    this.onLoad()
  },
  getPhone(e){
    console.log(e)
  },
  onLoad: function(options) {
    this.getCity(wx.getStorageSync('latitude')||22.93772, wx.getStorageSync('longitude')||113.38424)
    wx.setStorageSync('first',false)
    this.setData({
      //设置懒加载图片
      timer:this.showImg()
      //设置请求加载失败时的遮罩层状态
      // empty:2
    })
    var that = this;
    //菜单栏
    http.request({
      url: '/getQbusinessType',
      data: {
        uniacid: 2339
      },
      success: function(e) {
        app.globalData.sysinfo = e.data1[0];
        app.globalData.rzmoney = e.data1[0].qmoney
        app.globalData.cxcity = e.data1[0].qcity //过滤省市区1市 2区
        for(var i=0;i<e.data.length;i++){
          for(var j=0;j<e.data.length-1;j++){
            if(e.data[j].num<e.data[j+1].num){
              var temp=e.data[j];
              e.data[j]=e.data[j+1]
              e.data[j+1]=temp
            }
          }
        }
        that.setData({
          // array: that.data.array,
          functions: e.data,
          system: e.data1,
          showSkeleton: false
        })
        //数据请求成功隐藏骨架屏
        setTimeout(()=>{
          that.setData({
            skeletonisTrue:false,
          })
        },300)
      }
    },'',that);
    if (options.sjid != undefined) {
      that.data.sjid = options.sjid;
      that.setData({
        sjid: options.sjid
      })
    }
    // 查看是否授权
    wx.getSetting({
      success: function(res) {
        if (res.authSetting['scope.userInfo']) {
          village_LBS(that);
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            lang: 'zh_CN',
            success: function(res) {
              var objz = {};
              objz.avatarUrl = res.userInfo.avatarUrl;
              objz.nickName = res.userInfo.nickName;
              app.globalData.userInfo = res.userInfo;
              wx.setStorageSync('userInfo', objz); //存储userInfo  
              if (that.data.sjid != '') {
                http.request({
                  url: '/getQuserRecord',
                  data: {
                    qprocedureid: wx.getStorageSync('user').id,
                    qbusinessid: 1,
                    qtype: 7
                  },
                  success: function(data) {
                    if (data.length == 0) {
                      var record = {};
                      record.qbusinessid = 1;
                      record.qmiaoshu = '用户的分享'
                      record.qprocedureid = that.data.sjid;
                      record.qtype = 7;
                      http.insertUserRecord(record);
                    }
                  }
                },false,'分享失败')
              }
            }
          })
        }
      }
    })
    that.shuju();
    this.setData({
      page:0
    })
    that.headLineLoad();
    this.logonIM();
  },
  logonIM() {
    getApp().globalData.imuserInfo.myHeadUrl = getApp().globalData.userInfo.avatarUrl;
    getApp().globalData.imuserInfo.nickName = getApp().globalData.userInfo.nickName;
    getApp().getIMHandler().sendMsg({
      content: {
        type: 'first',
        userId: getApp().globalData.imuserInfo.userId,
        friendId: app.globalData.userOpen.openid,
        nickName: getApp().globalData.userInfo.nickName,
        myHeadUrl: getApp().globalData.userInfo.avatarUrl
      },
      success: () => {
        getApp().globalData.imuserInfo.userId = app.globalData.userOpen.openid;
      },
      fail: (res) => {
      }
    })
  },
  headLineLoad: function() {
    var that = this;
    http.request({
      url: '/getQbanner',
      data: {
        state: 1
      },
      success: function(e) {
        var headLineList = [];
        var headLineList2 = [];
        var yhq = [];
        var banner = [];
        if (e.length > 0) {
          for (var i = 0; i < e.length - 1; i++) {
            if (e[i].type == 2) {
              headLineList.push(e[i]);
            } else if (e[i].type == 3) {
              headLineList2.push(e[i]);
            } else if (e[i].type == 4) {
              yhq.push(e[i]);
            }
          }
        }
        that.setData({
          headLineList: headLineList,
          headLineList2: headLineList2,
          yhq: yhq,
        })
      }
    })
  },
  onShow: function() {
    this.setData({
      city: wx.getStorageSync('city'),
      district: wx.getStorageSync('district'),
      address: wx.getStorageSync('address'),
    })
    var that = this;
    // wx.getSetting({
    //   success: (res) => {
    //     if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) { //非初始化进入该页面,且未授权
    //       wx.showModal({
    //         title: '是否授权当前位置',
    //         content: '需要获取您的地理位置，请确认授权，否则地图功能将无法使用',
    //         success: function(res) {
    //           if (res.cancel) {
    //           } else if (res.confirm) {
    //             village_LBS(that);
    //             wx.openSetting({
    //               success: function(data) {
    //                 if (data.authSetting["scope.userLocation"] == true) {
    //                   wx.showToast({
    //                     title: '授权成功',
    //                     icon: 'success',
    //                     duration: 2000
    //                   })
    //                   //再次授权，调用getLocationt的API
    //                   village_LBS(that);
    //                 } else {
    //                   wx.showToast({
    //                     title: '授权失败',
    //                     image: '/image/info.png',
    //                     duration: 2000
    //                   })
    //                 }
    //               }
    //             })
    //           }
    //         }
    //       })
    //     } else if (res.authSetting['scope.userLocation'] == undefined) { //初始化进入
    //       village_LBS(that);
    //     }
    //   }
    // })
  },
  shuju: function(e) {
    console.log('进入首页')
    var that = this;
    if (e != undefined) {
      if (e.currentTarget.dataset.tp != undefined) {
        that.data.tpid = 0
      }
    }
    if (DEBUG_OVERRIDE_CITY) {
      wx.setStorageSync('city', '广州市')
      wx.setStorageSync('district', '番禺区');
      wx.setStorageSync('latitude', '22.93772')
      wx.setStorageSync('longitude', '113.38424')
    }
    that.setData({
      pxid: 99,
      page: 0,
      tpid: that.data.tpid,
      modalHidden: false,
      city: wx.getStorageSync('city'),
      district: wx.getStorageSync('district'),
    })
    let nowDate = util.getNowDate();
    //轮播图
    if(!that.data.banner[0]){
      http.request({
        url: '/getQbanner',
        data: {
          state: 1,
          type: 1,
          cityname: wx.getStorageSync('city')
        },
        success: function(e) {
          that.setData({
            banner: e
          })
        },
      },false,that);
    }
    //商户列表
    http.request({
      url: '/getQbusiness',
      data: {
        state: 2,
        storetypeId: that.data.tpid == 0 ? '' : that.data.tpid,
        coordinates: wx.getStorageSync('latitude') + ',' + wx.getStorageSync('longitude'),
        cityname: app.globalData.cxcity == 2 ? wx.getStorageSync('city') + wx.getStorageSync('district') : wx.getStorageSync('city'),
        orderstr: 'order by id desc limit ' + that.data.page * that.data.limit + ',' + that.data.limit
      },
      success: function(e) {
        setTimeout(()=>{
          that.data.timer()
        },100)
        that.setData({
          businessLoad:1,
          noinfo: e.length < that.data.limit ? true : false,
          load: false,
          business: e,
        });
      }
    },false,'',1)
  },
  bindGetUserInfo: function(e) {
    var that = this;
    wx.getSetting({
      success: function(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          that.getCity(wx.getStorageSync('latitude'), wx.getStorageSync('longitude'));
          wx.getUserInfo({
            lang: 'zh_CN',
            success: function(res) {
              that.shuju()
              var objz = {};
              objz.avatarUrl = res.userInfo.avatarUrl;
              objz.nickName = res.userInfo.nickName;
              app.globalData.userInfo = res.userInfo;
              wx.setStorageSync('userInfo', objz); //存储userInfo  
              if (that.data.sjid != '') {
                var record = {};
                record.qbusinessid = 1;
                record.qmiaoshu = '用户的分享'
                record.qprocedureid = that.data.sjid;
                record.qtype = 7;
                http.insertUserRecord(record);
              }
              http.request({
                url: '/getQuser',
                data: {
                  qopenid: app.globalData.userOpen.openid
                },
                success: function(e) {
                  if (e.length == 0) {
                    http.request({
                      url: '/insertQuser',
                      data: {
                        qopenid: app.globalData.userOpen.openid,
                        qnick: app.globalData.userInfo.nickName,
                        qicon: app.globalData.userInfo.avatarUrl,
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
                          }
                        })
                      }
                    })
                  } else {
                    wx.setStorageSync('user', e); //存储user
                  }
                }
              })
            }
          })
          that.setData({
            showGetUser: false
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '请重新授权登录！',
            showCancel: false
          });
          that.setData({
            showGetUser: true
          })
        }
      }
    })
  },
  stopPageScroll() {
    return
  },
  //获取城市信息
  getCity: function(latitude, longitude) {
    var that = this
    var nowDate = util.getNowDate().substring(0, 10);
    var weekday = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    var week = weekday[new Date(nowDate).getDay()]; //注意此处必须是先new一个Date
    var url = "https://api.map.baidu.com/geocoder/v2/";
    var params = {
      ak: "fxRrD1bFYROpGoBTYHCrD9QAP40TK5CK",
      output: "json",
      location: latitude + ',' + longitude,
    }
    wx.request({
      url: url,
      data: params,
      success: function(res) {
        if (DEBUG_OVERRIDE_CITY) {
          wx.setStorageSync('city', '广州市')
          wx.setStorageSync('district', '番禺区');
          wx.setStorageSync('latitude', '22.93772')
          wx.setStorageSync('longitude', '113.38424')
          return;
        }
        //当请求完地理位置的时候就重新加载商家列表的信息
        if(!that.data.business[0]){
          that.shuju();
        }
        var city = res.data.result.addressComponent.city;
        var district = res.data.result.addressComponent.district;
        var province = res.data.result.addressComponent.province;
        var address = res.data.result.formatted_address;
        if (wx.getStorageSync('district') != '' && wx.getStorageSync('district') != district) {
          wx.showModal({
            title: '位置变更',
            content: '是否切换到' + res.data.result.addressComponent.district,
            success(res) {
              if (res.confirm) {
                wx.setStorageSync('province', province);
                wx.setStorageSync('city', city);
                wx.setStorageSync('district', district);
                wx.setStorageSync('address', address);
                that.setData({
                  city: city,
                  district: district,
                  nowDate: nowDate, //日期
                  week: week //周几
                })
                if(!that.data.business[0]){
                  that.shuju();
                }
              } else if (res.cancel) {
                return
              }
            }
          })
        } else {
          wx.setStorageSync('province', province);
          wx.setStorageSync('city', city);
          wx.setStorageSync('district', district);
          wx.setStorageSync('address', address);
          that.setData({
            city: city,
            district: district,
            nowDate: nowDate, //日期
            week: week //周几
          })
        }
        setTimeout(function() {
          //定时获取当前用户位置//
          village_LBS(that);
        }, 600000);
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  //获取天气信息
  getWeahter: function(city) {
    var that = this
    that.shuju();
  },
  pxid(e) {
    this.setData({
      pxid: e.currentTarget.dataset.id
    })
  },
  onScroll: util.throttle(function(e) {
    var that = this
    that.setData({
      load: true
    })
    //判断是否加载过置顶店铺的数据，防止用户数据未加载完成就加载第二页数据
    if(!that.data.businessLoad){
      return
    }
    that.data.page++
      http.request({
        url: '/getQbusiness',
        data: {
          state: 2,
          isTop: 2,
          hb: that.data.pxid == 1 ? 1 : '',
          storetypeId: that.data.tpid == 0 ? '' : that.data.tpid,
          coordinates: wx.getStorageSync('latitude') + ',' + wx.getStorageSync('longitude'),
          orderstr: "and cityname like '%" + (app.globalData.cxcity == 2 ? wx.getStorageSync('city') + wx.getStorageSync('district') : wx.getStorageSync('city')) + "%'" + ' order by id desc limit ' + that.data.page * that.data.limit + ',' + that.data.limit
        },
        success: function(e) {
          if (e.length == 0) {
            that.setData({
              noinfo: true,
              load: false
            })
            return
          } else {
            setTimeout(function() {
              that.setData({
                business: that.data.business.concat(e),
                noinfo: e.length < that.data.limit ? true : false,
                load: false
              })
            }, 1000);
          }
        }
      },true)
  }, 1001),
  // 获取滚动条当前位置
  scrolltoupper: util.throttle(function(e) {
    if (e.detail.scrollTop > 100) {
      this.setData({
        floorstatus: true
      });
    } else {
      this.setData({
        floorstatus: false
      });
    }
  }, 10000),
  top682: function(e) { // 一键回到顶部
    this.setData({
      topNum: this.data.topNum = this.data.height
    });
  },
  //回到顶部
  goTop: function(e) { // 一键回到顶部
    this.setData({
      topNum: this.data.topNum = 0,
      floorstatus: false
    });
  },
  timeFormat(param) { //小于10的格式化函数
    return param < 10 ? '0' + param : param;
  },
  countDown() { //倒计时函数
    // 获取当前时间，同时得到活动结束时间数组
    let newTime = new Date().getTime();
    let endTimeList = this.data.actEndTimeList;
    let countDownArr = [];
    // 对结束时间进行处理渲染到页面
    endTimeList.forEach(o => {
      let endTime = new Date(o).getTime();
      let obj = null;
      // 如果活动未结束，对时间进行处理
      if (endTime - newTime > 0) {
        let time = (endTime - newTime) / 1000;
        // 获取天、时、分、秒
        let day = parseInt(time / (60 * 60 * 24));
        let hou = parseInt(time % (60 * 60 * 24) / 3600);
        let min = parseInt(time % (60 * 60 * 24) % 3600 / 60);
        let sec = parseInt(time % (60 * 60 * 24) % 3600 % 60);
        obj = {
          day: this.timeFormat(day),
          hou: this.timeFormat(hou),
          min: this.timeFormat(min),
          sec: this.timeFormat(sec)
        }
      } else { //活动已结束，全部设置为'00'
        obj = {
          day: '00',
          hou: '00',
          min: '00',
          sec: '00'
        }
      }
      countDownArr.push(obj);
    })
    // 渲染，然后每隔一秒执行一次倒计时函数
    this.setData({
      countDownList: countDownArr
    })
    setTimeout(this.countDown, 1000);
  },
  fucClick(event) {
    const id = event.currentTarget.dataset.id;
    const name = event.currentTarget.dataset.name;
    wx.navigateTo({
      url: '../storelist/storelist?typeid=' + id + '&name=' + name,
    })
  },
  sousuo(e) {
    wx.navigateTo({
      url: '../storelist/storelist?typeid=999&name=搜索店铺',
    })
  }
})
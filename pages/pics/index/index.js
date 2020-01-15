const storage = require("../../../utils/storage.js");
const http = require("../../../utils/http.js");
//const Quantity = require('../../component/quantity/index');
const constant = require("../../../utils/constant.js");
var app = getApp();
// pages/index/index.js
Page({
  data: {
    host: constant.host + '/img/',
    bannerList: [],
    headLineList: [],
    baikeList: [],
    baikeCount: 2,
    artisanList: [],
    travelList: [{
      picture: 'https://imgsa.baidu.com/news/q%3D100/sign=eb59ab7544540923ac69677ea259d1dc/8694a4c27d1ed21b681c7bb3a06eddc450da3f8a.jpg',
      title: '百度Apollo入选乌镇峰会全球领先科技成果',
      context: '小米雷军：同行都太强大 行业竞争白热化高通第四财季净亏损4.93亿美元 同比转亏吴亦凡新专辑遭iTunes下架？环球否认蔚来和特斯拉的差距 量产难倒英雄汉'
    }],
    indicatorDots: false,
    circular: true,
    vertical: true,
    autoplay: true,
    interval: 5000,
    duration: 1000
    // scrollLeft: 0
  },
  search: function() {
    console.log('搜索')
    wx.navigateTo({
      url: '/pages/storelistss/storelist?type=2&name=搜索方案',
    })
  },
  // 获取滚动条当前位置
  onPageScroll: function(e) {
    console.log(e)
    if (e.scrollTop > 100) {
      this.setData({
        floorstatus: true
      });
    } else {
      this.setData({
        floorstatus: false
      });
    }
  },
kgd:function(e){
  console.log('更多',e)
  wx.navigateTo({
    url: '/pages/pics/gdal/index?type=' + e.currentTarget.dataset.type,
  })
},
  //回到顶部
  goTop: function(e) { // 一键回到顶部
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  bannertz: function(e) {
    const id = e.currentTarget.dataset.spid;
    if (id != null) {
      wx.navigateTo({
        url: '/pages/goods/goods?id=' + id,
      })
    }
    //  else {
    //   wx.navigateTo({
    //     url: '/pages/storelist/storelist',
    //   })
    // }
  },
  onLoad: function(e) {
    // 页面初始化 options为页面跳转所带来的参数
    // console.log(e);
    this.bannerLoad(); //加载轮播
    this.baikeLoad(); //加载百科数据
    this.artisanLoad();
    this.traveLoad();
    // this.tab();
  },
  bannerLoad: function() {
    var that = this;
    http.request({
      url: '/getQbanner',
      data: {
        qtype:2
      },
      success: function(e) {
        // for (var i = 0; i < e.length; i++) {
        //   that.data.banner.push(e[i].url)
        // }
        console.log('轮播', e)
       // that.headLineLoad();
        that.setData({
          bannerList: e
        })
      },

    })
    // wx.request({
    //     url: 'https://bobtrip.com/newtj/menu/port/getPicture.action', //仅为示例，并非真实的接口地址
    //     header: {
    //         'content-type': 'application/json'
    //     },
    //     success: function (res) {
    //         console.log("请求成功");
    //         var li = res.data.picturelist;
    //         that.setData({
    //             bannerList: li
    //         })

    //     },
    //     fail: function () {
    //         console.log("请求失败");
    //     },
    //     complete: function () {
    //         that.headLineLoad();
    //     }
    // })
  },
  headLineLoad: function() {
    var that = this;
    http.request({
      url: '/getQanli',
      data: {
        qtype: 99,
      },
      success: function(e) {
        console.log('公告', e)
        that.setData({
          headLineList: e
        })
      },

    })
    // wx.request({
    //     url: 'https://bobtrip.com/newtj/menu/port/getRecommend.action', //仅为示例，并非真实的接口地址
    //     header: {
    //         'content-type': 'application/json'
    //     },
    //     success: function (res) {
    //         console.log("请求成功");
    //         var li = res.data.reclist;
    //          console.log('公告',li);
    //         that.setData({
    //             headLineList: li
    //         })
    //     },
    //     fail: function () {
    //         console.log("请求失败");
    //     }
    // })
  },
  baikeLoad: function() {
    var that = this;
    http.request({
      url: '/getQanli',
      data: {
        qtype: 1
      },
      success: function(e) {
        console.log('案例', e)
        const baikeList = e.slice(0, 5)
        that.setData({
          baikeList: baikeList
        })
      },

    })
    //var reg = /&nbsp;/g;
    //var reg1 = /。[^\u0000-\u00FF]*/g;
    // wx.request({
    //     url: 'https://bobtrip.com/newtj/menu/port/getTaste.action', //仅为示例，并非真实的接口地址
    //     header: {
    //         'content-type': 'application/json'
    //     },
    //     success: function (res) {
    //         console.log("请求成功");
    //         var li = res.data.tastlist.slice(0, that.data.baikeCount);
    //         li.forEach(function (value, index, array) {
    //             value.context = value.context.replace(reg, "");//去掉空格
    //             value.context = value.context.replace(reg1, "。");//截取到第一个句号
    //         })
    //         console.log(li);
    //         that.setData({
    //             baikeList: li
    //         })
    //     },
    //     fail: function () {
    //         console.log("请求失败");
    //     }

    // })
  },
  artisanLoad: function() {
    var that = this;
    http.request({
      url: '/getQanli',
      data: {
        qtype: 2,
      },
      success: function(e) {
        console.log('案例2', e)
        const artisanList = e.slice(0, 5)
        that.setData({
          artisanList: artisanList
        })
      },

    })
    //var reg = /&nbsp;/g;
    // var reg1 = /。[^\u0000-\u00FF]*/g;
    // wx.request({
    //     url: "https://bobtrip.com/newtj/menu/port/getArt.action",
    //     header: {
    //         'content-type': 'application/json'
    //     },
    //     success: function (res) {
    //         console.log("请求成功");
    //         var li = res.data.artlist;
    //         li.forEach(function (value, index, array) {
    //             value.content = value.content.replace(reg, "");
    //             value.content = value.content.replace(reg1, "。");
    //         })
    //         that.setData({
    //             artisanList: li
    //         })
    //     },
    //     fail: function () {
    //         console.log("请求失败");
    //     }
    // })
  },
  traveLoad: function() {
    var that = this;
    http.request({
      url: '/getQanli',
      data: {
        qtype: 3,
      },
      success: function(e) {
        console.log('案例3', e)
        const travelList = e.slice(0, 5)
        that.setData({
          travelList: travelList
        })
      },
    })
    // var reg = /&nbsp;/g;
    // var reg1 = /。[^\u0000-\u00FF]*/g;
    // wx.request({
    //     url: "https://bobtrip.com/newtj/menu/port/getTakeWork.action",
    //     header: {
    //         'content-type': 'application/json'
    //     },
    //     success: function (res) {
    //         console.log("请求成功");
    //         var li = res.data.takelist;
    //         li.forEach(function (value, index, array) {
    //             value.context = value.context.replace(reg, "");
    //             value.context = value.context.replace(reg1, "。");
    //         })
    //         that.setData({
    //             travelList: li
    //         })
    //     },
    //     fail: function () {
    //         console.log("请求失败");
    //     }
    // })
  },
  jumpHeadLineList: function() {
    // wx.navigateTo({
    //     url: '../headLineList/headLineList'
    // })//跳转到头条列表
  },
  jumpbaikeList: function(e) {
    var type = e.currentTarget.dataset.type;
    // wx.navigateTo({
    //     url: '../lists/lists?type=' + type
    // })//判断跳转目标并跳转，实际名称应为jumpList
  },
  jumpdetails: function(e) {
    var id = e.currentTarget.dataset.id;
    var qtype = e.currentTarget.dataset.type == 99 ? '99&name=公告详情' : e.currentTarget.dataset.type;
    if (id != null) {
      wx.navigateTo({
        url: '../details/details?id=' + id + '&type=' + qtype
      })
    }
    
  },
  scrollmove: function(e) {
    if (e.detail.scrollLeft < 380 && e.detail.deltaX > 0) {
      this.setData({
        scrollLeft: 0
      })
    } else if (e.detail.scrollLeft < 380 && e.detail.deltaX < 0) {
      this.setData({
        scrollLeft: 390
      })
    } else if (e.detail.scrollLeft > 500 && e.detail.scrollLeft < 750 && e.detail.deltaX > 0) {
      this.setData({
        scrollLeft: 390
      })
    }
    // } else if (e.detail.scrollLeft > 380 && e.detail.scrollLeft < 790 && e.detail.deltaX < 0) {
    //     this.setData({
    //         scrollLeft: 780
    //     })
    // }else if (e.detail.scrollLeft > 770 && e.detail.scrollLeft < 1000 && e.detail.deltaX > 0) {
    //     this.setData({
    //         scrollLeft: 390
    //     })
    // } 
    console.log(e.detail);
  }

})

/*"tabBar": {
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "img/home.png",
        "selectedIconPath": "img/home-hover.png"
      },
      {
        "pagePath": "pages/user/user",
        "text": "我的",
        "iconPath": "img/user.png",
        "selectedIconPath": "img/user-hover.png"
      }
    ],
    "borderStyle": "white"
  }*/
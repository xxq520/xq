const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
var app = getApp();
Page({
  data: {
    address: '',
    region: [],
    lishi: [],
    city: '',
    district: '',
    search_falg: false,

  },
  changeParentData: function() {
    var pages = getCurrentPages(); //当前页面栈
    if (pages.length > 1) {
      var beforePage = pages[pages.length - 2]; //获取上一个页面实例对象
      beforePage.shuju(); //触发父页面中的方法
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      lishi: wx.getStorageSync('lishi'),
      address: wx.getStorageSync('address'),
      city: wx.getStorageSync('city'),
      district: wx.getStorageSync('district'),
      region: [wx.getStorageSync('province'), wx.getStorageSync('city'), wx.getStorageSync('district')],
    })
  },
  /**
   * 重新定位
   */
  dw: function() {
    var that = this
    wx.chooseLocation({
      type: 'wgs84', //'gcj02',
      success: function(res) {
        console.log('定位信息', res);
        if (res.address != '') {
          var lishi = wx.getStorageSync('lishi') || []
          var ls = {}
          if (lishi.length < 10) {
            ls.name = res.name
            ls.latitude = res.latitude
            ls.longitude = res.longitude
            lishi.push(ls)
            wx.setStorageSync('lishi', lishi);
          }
          wx.setStorageSync('latitude', res.latitude); //存储latitude
          wx.setStorageSync('longitude', res.longitude); //存储longitude
          that.getCity(res.latitude, res.longitude);
          wx.setStorageSync('address', res.name);
          //  that.changeParentData()
          that.setData({
            address: res.name
          })
        }
      }
    })
  },
  //获取城市信息
  getCity: function(latitude, longitude) {
    var that = this
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
        var city = res.data.result.addressComponent.city;
        var district = res.data.result.addressComponent.district;
        var province = res.data.result.addressComponent.province;
        var street = res.data.result.addressComponent.street;
        //  var city = res.data.result.addressComponent.city;
        wx.setStorageSync('province', res.data.result.addressComponent.province);
        wx.setStorageSync('city', city);
        wx.setStorageSync('district', res.data.result.addressComponent.district);
        wx.setStorageSync('address', res.data.result.formatted_address);
        that.setData({
          city: city,
          district: district,
          street: street,
        })
        setTimeout(function() {
          console.log('地址信息', res.data.result)
          that.changeParentData()
          wx.switchTab({
            url: '/pages/index/index',
          })
        }, 200);
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  bindRegionChange(e) {
    console.log('选择地区', e.detail.value)
    wx.setStorageSync('province', e.detail.value[0])
    wx.setStorageSync('city', e.detail.value[1])
    wx.setStorageSync('district', e.detail.value[2])
    this.setData({
      region: e.detail.value
    })
  },
  qd: function() {
    var that = this
    wx.setStorageSync('province', this.data.region[0]);
    wx.setStorageSync('city', this.data.region[1]);
    wx.setStorageSync('district', this.data.region[2]);
    that.changeParentData()
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  lishi(e) {
    var that = this
    var index = e.currentTarget.dataset.index
    wx.setStorage({ //异步取出缓存的值
      key: 'latitude',
      data: wx.getStorageSync('lishi')[index].latitude,
      success: function(res) {
        wx.setStorage({ //异步取出缓存的值
          key: 'longitude',
          data: wx.getStorageSync('lishi')[index].longitude,
          success: function(res) {
            that.getCity(wx.getStorageSync('latitude'), wx.getStorageSync('longitude'));
            setTimeout(function() {
              wx.setStorage({ //异步取出缓存的值
                key: 'address',
                data: wx.getStorageSync('lishi')[index].name,
                success: function(res) {

                  that.setData({
                    address: wx.getStorageSync('lishi')[index].name
                    // region: [province, city, district],
                  })
                  that.changeParentData()
                  wx.switchTab({
                    url: '/pages/index/index',
                  })
                }
              })
            }, 200);
          }
        })
      }
    })
  },
  deletels(e) {
    var index = e.currentTarget.dataset.deleteid;
    var lishi = this.data.lishi.filter((v, i) => {
      return (i != index)
    })
    this.setData({
      lishi,
    })
    wx.setStorageSync("lishi", lishi);
  },
  search(e) {
    console.log(e);
    var that = this;
    if (e.detail.value != "") {
      this.setData({
        search_falg: true,
      })
      var a = encodeURI(e.detail.value)
      http.request({
        url: '/getQbusiness',
        data: {
          state: 2,
          orderstr: "and storeName like '%" + a + "%' limit 0,20",
          coordinates: wx.getStorageSync('latitude') + ',' + wx.getStorageSync('longitude'), // 
        },
        success: function(e) {
          console.log('商户信息', e)
          that.setData({
            business: e,
          });
        }
      })
    } else {
      this.setData({
        search_falg: false,
      })
    }
  },
})
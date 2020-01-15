const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
var app = getApp();
var timer=''
// pages/xxfb/xxfb.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    information: {},
    shop: {},
    imagesData2: [],
    images2: [],
    imgLimit2: 9,
    xuzhi: false,
    xuzhitc: false,
    fhb: false,
    money: 0,
    num: 0,
    functions: [],
    // typeId: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      shop: wx.getStorageSync('shop'),
    })
    this.data.information.userName = this.data.shop.userName
    this.data.information.userId = this.data.shop.userId
    this.data.information.storeId = this.data.shop.id
    this.data.information.userTel = this.data.shop.tel
    this.data.information.address = this.data.shop.address
    this.data.information.state = 1
    this.data.information.givelike = 0
    this.data.information.views = 0
    this.data.information.hot = 2
    this.data.information.top = 2
    this.data.information.hbType = 2
    // this.data.information.hbMoney = 100
    // this.data.information.hbNum = 100
    this.data.information.lat = this.data.shop.coordinates.split(',')[0]
    this.data.information.lng = this.data.shop.coordinates.split(',')[1]
    this.shuju()
  },
  shuju(e) {
    var that = this
    http.request({
      url: '/getQbusinessType',
      data: {
        uniacid: 2
      },
      success: function(e) {
        that.setData({
          functions: e.data,
        })

      },
    });
    http.request({
      url: '/getQinformation',
      data: {
        storeId: that.data.shop.id,
        orderstr: 'and a.state in (1,2)'
      },
      success: function(e) {
        that.setData({
          infow: e,
        })
      },
    });
  },
  bindPickerChange(e) {
    this.data.information.typeId = this.data.functions[e.detail.value].id,
      this.setData({
        //  typeId: this.data.functions[e.detail.value].id,
        typeName: this.data.functions[e.detail.value].typeName
      })
  },
  /**
   * 发布信息
   */
  //防止用户秒内点击多次
  fb(e){
      var that=this
      clearTimeout(timer)
      timer=setTimeout(()=>{
          that.qrfb(e)
      },400)
  },
  qrfb(e) {
      var that = this
      var information = that.data.information;
      if(!information.details){
          wx.showToast({
              title: '内容描述未填写',
              icon:"none",
              duration: 2000
          })
          return
      }
      if(util.expression.test(information.details)){
          wx.showToast({
              title: '内容包含非法字符',
              icon:"none",
              duration: 2000
          })
          return
      }

      http.request({
          url: '/getQinformation',
          data: {
              storeId: that.data.shop.id,
              orderstr: 'and a.state in (1,2)'
          },
          success: function(e) {
              var nowdata=Date.now();
              for(var i=0;i<e.length;i++){
                  var time=e[i].time
                  if(nowdata-time<24*60*60*1000){
                      wx.showToast({
                          title: '一天只能发一条',
                          icon:"none",
                          duration: 2000
                      })
                      setTimeout(function() {
                          wx.hideLoading()
                      }, 2000)
                      return;
                  }
              }
              information.details=information.details.replace(/\s/g,'');
              if (!information.typeId) {
                  wx.showToast({
                      title: '分类未选择',
                      image: '/images/search_no.png',
                      duration: 2000
                  })
                  setTimeout(function() {
                      wx.hideLoading()
                  }, 2000)
                  return
              }
              if (!information.userName) {
                  wx.showToast({
                      title: '联系人未填写',
                      image: '/images/search_no.png',
                      duration: 2000
                  })
                  setTimeout(function() {
                      wx.hideLoading()
                  }, 2000)
                  return
              }
              if (!information.details) {
                  wx.showToast({
                      title: '信息详情未填写',
                      image: '/images/search_no.png',
                      duration: 2000
                  })
                  setTimeout(function() {
                      wx.hideLoading()
                  }, 2000)
                  return
              }
              if (!information.userTel) {
                  wx.showToast({
                      title: '联系方式未填写',
                      image: '/images/search_no.png',
                      duration: 2000
                  })
                  setTimeout(function() {
                      wx.hideLoading()
                  }, 2000)
                  return
              }
              if (that.data.imagesData2.length == 0) {
                  wx.showToast({
                      title: '图片未上传',
                      image: '/images/search_no.png',
                      duration: 2000
                  })
                  setTimeout(function() {
                      wx.hideLoading()
                  }, 2000)
                  return
              }
              information.img = that.data.imagesData2.join(',')
              if (that.data.fhb) {
                  if (that.data.money == 0) {
                      wx.showToast({
                          title: '红包金额未填写',
                          image: '/images/search_no.png',
                          duration: 2000
                      })
                      setTimeout(function() {
                          wx.hideLoading()
                      }, 2000)
                      return
                  }
                  if (that.data.num == 0) {
                      wx.showToast({
                          title: '红包个数未填写',
                          image: '/images/search_no.png',
                          duration: 2000
                      })
                      setTimeout(function () {
                          wx.hideLoading()
                      }, 2000)
                      return
                  }
                  if(that.data.money/that.data.num<0.01){
                      wx.showToast({
                          title: '红包小于0.01',
                          image: '/images/search_no.png',
                          duration: 2000
                      })
                      return
                  }
                  if (parseInt(that.data.shop.money) < parseInt(that.data.money)) {
                      wx.showToast({
                          title: '店铺余额不足',
                          image: '/images/search_no.png',
                          duration: 2000
                      })
                      setTimeout(function() {
                          wx.hideLoading()
                          wx.navigateTo({
                              url: '/pages/chongzhi/chongzhi',
                          })
                      }, 2000)
                      return
                  }
                  if (that.data.money / that.data.num < 0.01) {
                      this.setData({
                          num: that.data.money * 100
                      })
                      wx.showToast({
                          title: '最多发' + that.data.money * 100 + '个',
                          image: '/images/search_no.png',
                          duration: 2000
                      })
                      setTimeout(function() {
                          wx.hideLoading()
                      }, 2000)
                      return
                  }
                  that.data.information.hbType = 1
                  that.data.information.hbMoney = that.data.money
                  that.data.information.hbNum = that.data.num
              }
              if (!that.data.xuzhi) {
                  that.setData({
                      xuzhitc: true
                  })
                  return
              }

              http.request({
                  url: '/insertQinformation',
                  data: information,
                  success: function(e) {
                      if (that.data.fhb) {
                          http.request({
                              url: '/insertQhongbao',
                              data: {
                                  qtype: 2,
                                  qid: e,
                                  qstatus: 1,
                                  qstore: that.data.shop.storeName,
                                  qicon: that.data.shop.logo,
                                  qsum: that.data.money,
                                  qnum: that.data.num,
                              },
                              success: function(e) {
                                  wx.showToast({
                                      title: '发放成功',
                                      icon: 'success',
                                      duration: 2000
                                  });
                                  setTimeout(function() {
                                      wx.reLaunch({
                                          url: '/pages/booszy/booszy',
                                      });
                                      wx.hideLoading()
                                  }, 2000)
                              }
                          })
                      } else {
                          wx.showToast({
                              title: '发放成功',
                              icon: 'success',
                              duration: 2000
                          })
                          setTimeout(function() {
                              wx.reLaunch({
                                  url: '/pages/booszy/booszy',
                              })
                              wx.hideLoading()
                          }, 2000)
                      }
                  }
              })
          },
      });
  },

  /**
   * 信息红包
   */
  fhb(e) {
    this.setData({
      fhb: e.detail.value
    })
  },
  /**
   * 发布须知
   */
  xuzhi(e) {
    this.setData({
      xuzhi: this.data.xuzhi ? false : true
    })
  },
  /**
   * 须知弹窗
   */
  xuzhitc(e) {
    this.setData({
      xuzhitc: true
    })
  },
  /**
   * 红包金额
   */
  num(e) {
    this.setData({
      num: e.detail.value
    })
  },
  /**
   * 红包个数
   */
  money(e) {
    this.setData({
      money: e.detail.value
    })
  },
  qd(e) {
    this.setData({
      xuzhi: true,
      xuzhitc: false,
    })
  },
  details(e) {
    this.data.information.details = e.detail.value
  },
  name(e) {
    this.data.information.userName = e.detail.value
  },
  phone(e) {
    this.data.information.userTel = e.detail.value
  },

  // 预览图片
  previewImg2: function(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: this.data.images2,
    })
  },
  del2: function(e) {
    var dataset = e.currentTarget.dataset
    // 删除图片
    if (dataset.type == 'image') {
      this.data.images2.splice(dataset.index, 1)
      this.data.imagesData2.splice(dataset.index, 1)
      this.data.imagesData2 = this.data.imagesData2
      this.setData({
        images2: this.data.images2
      })
    } else if (dataset.type == 'video') {
      this.data.videoData = ''
      this.setData({
        video: ''
      })
    }
  },


  upload2: function(e) {
    if (this.data.imagesData2.length <= 9) {
      var fileType = e.currentTarget.dataset.type
      var that = this;
      if (fileType == 'image') {
        that.uploadFile2(that, 'image')
      } else if (fileType == 'video') {
        that.uploadFile2(that, 'video')
      }
    }
  },

  // 上传图片视频等文件，封装
  uploadFile2: function(page, fileType) {
    if (fileType == 'image') {
      if (page.data.imagesData2.length < page.data.imgLimit2) {
        wx.chooseImage({
          count: page.data.imgLimit2,
          success: function(res) {
            var tempFilePaths = res.tempFilePaths;
            //tempFilePaths = tempFilePaths.slice(0, page.data.imgLimit2 - page.data.imagesData2.length)
            var tempFilesSize = res.tempFiles
            tempFilePaths=tempFilePaths.splice(0,9)
            tempFilePaths.forEach((item, index) => {
              if (page.data.imagesData2.length+index < page.data.imgLimit2) {
                util.showLoading({
                  title: '上传中'
                })
                if (tempFilesSize[index].size <= 2000000) { //图片小于或者等于2M时 可以执行获取图片
                  wx.uploadFile({
                    url: constant.host + '/file/onefile2',
                    filePath: item,
                    name: 'file',
                    formData: {
                      'user': 'sgyj'
                    },
                    success: function(res) {
                      var data = res.data
                      if (data.substring(data.length - 1) == "\"") {
                        data = data.substr(1, data.length - 2)
                      }
                      page.data.imagesData2.push(data)
                      data = util.parseImgUrl(data)
                      page.data.images2.push(data)
                      page.setData({
                        images2: page.data.images2
                      })
                      wx.hideLoading()
                    }
                  })
                } else { //图片大于2M，弹出一个提示框
                  wx.showToast({
                    title: '上传图片不能大于2M!', //标题
                    icon: 'none' //图标 none不使用图标，详情看官方文档
                  })
                  return
                }

              } else {
                util.showFailToast({
                  title: '最多上传' + page.data.imgLimit2 + '张'
                })
                return
              }
            })
          }
        })
      } else {
        util.showFailToast({
          title: '最多上传' + page.data.imgLimit2 + '张'
        })
      }
    } else if (fileType == 'video') {
      wx.chooseVideo({
        success: function(res) {
          var tempFilePath = res.tempFilePath;
          util.showLoading({
            title: '上传中'
          })
          wx.uploadFile({
            url: constant.host + '/file/onefile2',
            filePath: tempFilePath,
            name: 'file',
            formData: {
              'user': 'sgyj'
            },
            success: function(res1) {
              var data = res1.data
              if (data.substring(data.length - 1) == "\"") {
                data = data.substr(1, data.length - 2)
              }
              page.data.videoData = data
              data = util.parseImgUrl(data)
              page.data.video = data
              page.setData({
                video: page.data.video,
                poster: page.data.posterImg, //视频封面图
              })
              wx.uploadFile({
                url: app.host + conf.api.uploadFile,
                filePath: page.data.posterImg, //视频封面图
                name: 'file',
                formData: {
                  'user': 'sgyj'
                },
                success: (res2) => {
                  var data = res2.data
                  if (data.substring(data.length - 1) == "\"") {
                    data = data.substr(1, data.length - 2)
                  }
                  page.data.posterData = data
                }
              })
              wx.hideLoading()
            }
          })
        }
      })
    }
    wx.hideLoading()
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
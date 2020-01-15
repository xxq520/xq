// pages/user/zhuczc.js
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    zhuce: 1, //步骤
    imagesData: [],
    images: [],
    imgLimit: 1,
    imagesData2: [],
    images2: [],
    imgLimit2: 9,
    imagesData3: [],
    images3: [],
    imgLimit3: 1,
    imagesData4: [],
    images4: [],
    imgLimit4: 2,
    imagesData5: [],
    images5: [],
    imgLimit5: 9,
    storetype: '请选择行业分类',
    // address: '请选择详细地址',
    // stime: '请选择开始时间',
    // etime: '请选择结束时间',
    tsfw1: '',
    tsfw2: '',
    tsfw3: '',
    tsfw4: '',
    tsfw: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    pwd: '',
    qrpwd: true,
    qrpwdd: '',
    functions: [],
    ruzhuinfo: {}
  },
  tsfw(e) {
    var index = e.currentTarget.dataset.index
    this.data.tsfw[index] = this.data.tsfw[index] == 2 ? 1 : 2
    this.setData({
      tsfw: this.data.tsfw
    })
    for (var i = 0; i < this.data.tsfw.length; i++) {
      if (i == 0) {
        if (this.data.tsfw[i] == 1) {
          this.data.ruzhuinfo.skzf = 1
        } else {
          this.data.ruzhuinfo.skzf = 2
        }
      } else if (i == 1) {
        if (this.data.tsfw[i] == 1) {
          this.data.ruzhuinfo.wifi = 1
        } else {
          this.data.ruzhuinfo.wifi = 2
        }

      } else if (i == 2) {
        if (this.data.tsfw[i] == 1) {
          this.data.ruzhuinfo.mftc = 1
        } else {
          this.data.ruzhuinfo.mftc = 2
        }

      } else if (i == 3) {
        if (this.data.tsfw[i] == 1) {
          this.data.ruzhuinfo.jzxy = 1
        } else {
          this.data.ruzhuinfo.jzxy = 2
        }

      } else if (i == 4) {
        if (this.data.tsfw[i] == 1) {
          this.data.ruzhuinfo.tgbj = 1
        } else {
          this.data.ruzhuinfo.tgbj = 2
        }

      } else if (i == 5) {
        if (this.data.tsfw[i] == 1) {
          this.data.ruzhuinfo.sfxx = 1
        } else {
          this.data.ruzhuinfo.sfxx = 2
        }

      } else if (i == 6) {
        if (this.data.tsfw[i] == 1) {
          this.data.ruzhuinfo.zcfp = 1
        } else {
          this.data.ruzhuinfo.zcfp = 2
        }

      } else if (i == 7) {
        if (this.data.tsfw[i] == 1) {
          this.data.ruzhuinfo.ktkf = 1
        } else {
          this.data.ruzhuinfo.ktkf = 2
        }

      } else if (i == 8) {
        if (this.data.tsfw[i] == 1) {
          this.data.ruzhuinfo.sjcd = 1
        } else {
          this.data.ruzhuinfo.sjcd = 2
        }

      } else if (i == 9) {
        if (this.data.tsfw[i] == 1) {
          this.data.ruzhuinfo.shdj = 1
        } else {
          this.data.ruzhuinfo.shdj = 2
        }

      } else if (i == 10) {
        if (this.data.tsfw[i] == 1) {
          this.data.ruzhuinfo.zcth = 1
        } else {
          this.data.ruzhuinfo.zcth = 2
        }

      } else if (i == 11) {
        if (this.data.tsfw[i] == 1) {
          this.data.ruzhuinfo.shwy = 1
        } else {
          this.data.ruzhuinfo.shwy = 2
        }

      }


    }
    wx.setStorageSync('ruzhuinfo', this.data.ruzhuinfo)

    console.log('特色服务', this.data.tsfw, '入驻信息', this.data.ruzhuinfo)
  },
  /**
   * 下一步
   */
  xyb: function() {
    if (this.data.zhuce == 1) {
      if (!this.data.ruzhuinfo.video) {
        wx.showToast({
          title: '业务员未填写',
          image: '/images/search_no.png',
          duration: 2000
        })
        return
      }
      if(util.expression.test(this.data.ruzhuinfo.video)){
        wx.showToast({
          title: '业务员有误',
          image: '/images/search_no.png',
          duration: 2000
        })
        return
      }
      if(util.expression.test(this.data.detailsAddress)){
        wx.showToast({
          title: '门牌号有误',
          image: '/images/search_no.png',
          duration: 2000
        })
        this.setData({
          detailsAddress:''
        })
        return
      }

      wx.setStorageSync('ruzhuinfo', this.data.ruzhuinfo)
      if (!this.data.ruzhuinfo.ewmLogo) {
        wx.showToast({
          title: '子公司未填写',
          image: '/images/search_no.png',
          duration: 2000
        })
        return
      }
      if(util.expression.test(this.data.ruzhuinfo.ewmLogo)){
        wx.showToast({
          title: '子公司有误',
          image: '/images/search_no.png',
          duration: 2000
        })
        return
      }
      if (!this.data.ruzhuinfo.userName) {
        wx.showToast({
          title: '店主姓名未填写',
          image: '/images/search_no.png',
          duration: 2000
        })
        return
      }
      if(util.expression.test(this.data.ruzhuinfo.userName)){
        wx.showToast({
          title: '姓名包含非法字符',
          image: '/images/search_no.png',
          duration: 2000
        })
        return
      }
      if (!this.data.ruzhuinfo.tel) {
        wx.showToast({
          title: '店主电话未填写',
          image: '/images/search_no.png',
          duration: 2000
        })
        return
      }
      if (!util.isPhone(this.data.ruzhuinfo.tel)) {
        wx.showToast({
          title: '电话号码格式错误',
          image: '/images/search_no.png',
          duration: 2000
        })
        return
      }
      if (this.data.images4.length<2) {
        wx.showToast({
          title: '身份证需两张',
          image: '/images/search_no.png',
          duration: 2000
        })
        return
      }
      // if (this.data.pwd.length != this.data.qrpwdd.length) {
      //   wx.showToast({
      //     title: '密码不一致',
      //     image: '/images/search_no.png',
      //     duration: 2000
      //   })
      //   this.setData({
      //     pwd: '',
      //     qrpwdd: ''
      //   })
      //   return
      // }
      if (!this.data.ruzhuinfo.storeName) {
        wx.showToast({
          title: '店铺名称未填写',
          image: '/images/search_no.png',
          duration: 2000
        })
        return
      }
      if(util.expression.test(this.data.ruzhuinfo.storeName)){
        wx.showToast({
          title: '名称包含非法字符',
          image: '/images/search_no.png',
          duration: 2000
        })
        return
      }
      if (!this.data.ruzhuinfo.storetypeId) {
        wx.showToast({
          title: '行业分类未选择',
          image: '/images/search_no.png',
          duration: 2000
        })
        return
      }
      if ((!this.data.ruzhuinfo.address) || (!this.data.ruzhuinfo.coordinates)) {
        wx.showToast({
          title: '店铺地址未选择',
          image: '/images/search_no.png',
          duration: 2000
        })
        return
      }
      if (!this.data.ruzhuinfo.startTime || !this.data.ruzhuinfo.endTime) {
        wx.showToast({
          title: '营业时间未选择',
          image: '/images/search_no.png',
          duration: 2000
        })
        return
      }
      if (!this.data.ruzhuinfo.announcement) {
        wx.showToast({
          title: '店铺公告未填写',
          image: '/images/search_no.png',
          duration: 2000
        })
        return
      }
      if(util.expression.test(this.data.ruzhuinfo.announcement)){
        wx.showToast({
          title: '公告包含非法字符',
          image: '/images/search_no.png',
          duration: 2000
        })
        return
      }
      if (!this.data.ruzhuinfo.cpi) {
        wx.showToast({
          title: '人均消费未填写',
          image: '/images/search_no.png',
          duration: 2000
        })
        return
      }
      if(util.expression.test(this.data.ruzhuinfo.cpi)){
        wx.showToast({
          title: '人均包含非法字符',
          image: '/images/search_no.png',
          duration: 2000
        })
        return
      }

      if (this.data.imagesData.length == 0 || this.data.imagesData3.length == 0 || this.data.imagesData4.length == 0 || this.data.imagesData5.length == 0) {
        wx.showToast({
          title: '有图片未上传',
          image: '/images/search_no.png',
          duration: 2000
        })
        return
      } else {

        // 常规参数
        this.data.ruzhuinfo.uniacid = 2339
        this.data.ruzhuinfo.views = 0
        this.data.ruzhuinfo.state = 1
        this.data.ruzhuinfo.dqTime = 365
        this.data.ruzhuinfo.money = 0
        this.data.ruzhuinfo.cityname = wx.getStorageSync('city') + wx.getStorageSync('district')
        this.data.ruzhuinfo.userId = wx.getStorageSync('user').id
        this.data.ruzhuinfo.logo = this.data.imagesData[0]
        //  this.data.ruzhuinfo.ad = this.data.imagesData2.join(',')
        this.data.ruzhuinfo.yyzzImg = this.data.imagesData3.join(',')
        this.data.ruzhuinfo.sfzImg = this.data.imagesData4.join(',')
        this.data.ruzhuinfo.img = this.data.imagesData5.join(',')
        wx.setStorageSync('ruzhuinfo', this.data.ruzhuinfo)
      }
      this.setData({
        zhuce: this.data.zhuce + 1
      })

    } else if (this.data.zhuce == 2) {
      // var a = this.data.tsfw1 + ',' + this.data.tsfw2 + ',' + this.data.tsfw3 + ',' + this.data.tsfw4
      this.data.ruzhuinfo.skzf=this.data.tsfw[0]||1
      this.data.ruzhuinfo.wifi=this.data.tsfw[1]||1
      this.data.ruzhuinfo.mftc=this.data.tsfw[2]||1
      this.data.ruzhuinfo.jzxy=this.data.tsfw[3]||1
      this.data.ruzhuinfo.tgbj=this.data.tsfw[4]||1
      this.data.ruzhuinfo.sfxx=this.data.tsfw[5]||1
      this.data.ruzhuinfo.zcfp=this.data.tsfw[6]||1
      this.data.ruzhuinfo.ktkf=this.data.tsfw[7]||1
      this.data.ruzhuinfo.sjcd=this.data.tsfw[8]||1
      this.data.ruzhuinfo.shdj=this.data.tsfw[9]||1
      this.data.ruzhuinfo.zcth=this.data.tsfw[10]||1
      this.data.ruzhuinfo.shwy=this.data.tsfw[11]||1
      this.setData({
        zhuce: this.data.zhuce + 1
      })
    } else if (this.data.zhuce == 3) {
      if (!this.data.ruzhuinfo.details) {
        wx.showToast({
          title: '店铺描述未填写',
          image: '/images/search_no.png',
          duration: 2000
        })
        return
      }else{
        this.data.ruzhuinfo.details=this.data.ruzhuinfo.details.replace(/\s/g,'')
      }
      if(util.expression.test(this.data.ruzhuinfo.details)){
        wx.showToast({
          title: '描述包含非法字符',
          image: '/images/search_no.png',
          duration: 2000
        })
        return
      }
      this.setData({
        zhuce: this.data.zhuce + 1
      })
      wx.setStorageSync('ruzhuinfo', this.data.ruzhuinfo)
      //商户列表
      if (wx.getStorageSync('user').qnote == 99) {
        wx.reLaunch({
          url: '/pages/booszy/booszy',
        })
      } else {
        if(this.data.ruzhuinfo.detailsAddress){
          this.data.ruzhuinfo.address+=this.data.detailsAddress?','+this.data.detailsAddress:''
        }
        http.request({
          url: '/insertQbusiness',
          data: this.data.ruzhuinfo,
          success: function(e) {
            //先设置商户信息到缓存，避免进入商家主页报错
            http.request({
              url: '/getQbusiness',
              data: {
                id:e
              },
              success: function(data) {
                wx.setStorageSync('shop', data[0])
                wx.navigateTo({
                  url: '/pages/booszy/booszy',
                })
              }
          })
            // http.request({
            //   url: '/getQbusiness',
            //   data: {
            //     userId: wx.getStorageSync('user')[0].id,
            //   },
            //   success: function(data) {
            //     wx.setStorage({
            //       key: 'shop',
            //       data: data[0],
            //       success: function(data) {

            //         wx.showLoading({
            //           title: '正在登录',
            //         })
            //         setTimeout(function() {
            //           wx.reLaunch({
            //             url: '/pages/booszy/booszy',
            //           })
            //         }, 2000);
            //       }
            //     })
            //   }
            // });

          }
        })
      }


    }
    console.log('入驻信息', this.data.ruzhuinfo)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    if (wx.getStorageSync('ruzhuinfo') != '') {
      if (wx.getStorageSync('ruzhuinfo').logo != undefined) {
        that.data.imagesData = [wx.getStorageSync('ruzhuinfo').logo]
        that.setData({
          images: [constant.imghost + wx.getStorageSync('ruzhuinfo').logo],
          ruzhuinfo: wx.getStorageSync('ruzhuinfo')
        })
      }
      if (wx.getStorageSync('ruzhuinfo').ad != undefined) {
        that.data.imagesData2 = wx.getStorageSync('ruzhuinfo').ad.split(",")
        wx.getStorageSync('ruzhuinfo').ad.split(",").forEach(item => {
          that.data.images2.push(constant.imghost + item)
        })
        that.setData({
          images2: that.data.images2,
          ruzhuinfo: wx.getStorageSync('ruzhuinfo')
        })
      }
      if (wx.getStorageSync('ruzhuinfo').yyzzImg != undefined) {
        that.data.imagesData3 = wx.getStorageSync('ruzhuinfo').yyzzImg.split(",")
        wx.getStorageSync('ruzhuinfo').yyzzImg.split(",").forEach(item => {
          that.data.images3.push(constant.imghost + item)
        })
        that.setData({
          images3: that.data.images3,
          ruzhuinfo: wx.getStorageSync('ruzhuinfo')
        })
      }
      if (wx.getStorageSync('ruzhuinfo').sfzImg != undefined) {
        that.data.imagesData4 = wx.getStorageSync('ruzhuinfo').sfzImg.split(",")
        wx.getStorageSync('ruzhuinfo').sfzImg.split(",").forEach(item => {
          that.data.images4.push(constant.imghost + item)
        })
        that.setData({
          images4: that.data.images4,
          ruzhuinfo: wx.getStorageSync('ruzhuinfo')
        })
      }
      if (wx.getStorageSync('ruzhuinfo').img != undefined) {
        that.data.imagesData5 = wx.getStorageSync('ruzhuinfo').img.split(",")
        wx.getStorageSync('ruzhuinfo').img.split(",").forEach(item => {
          that.data.images5.push(constant.imghost + item)
        })
        that.setData({
          images5: that.data.images5,
          ruzhuinfo: wx.getStorageSync('ruzhuinfo')
        })
      }
      that.setData({
        ruzhuinfo: wx.getStorageSync('ruzhuinfo')
      })
    }


    //菜单栏
    http.request({
      url: '/getQbusinessType',
      data: {
        uniacid: 2339
      },
      success: function(e) {
        e.data.forEach((item, index) => {
          //   console.log(item.id);
          if (item.id == wx.getStorageSync('ruzhuinfo').storetypeId) {
            //console.log('99999999999');
            that.data.ruzhuinfo.storetypeId = wx.getStorageSync('ruzhuinfo').storetypeId
            that.setData({
              storetype: item.typeName,
            })
            return
          }
        })
        that.setData({
          functions: e.data,
        })
      },
    });
    console.log('111111');
    console.log(this.data.ruzhuinfo);
  },
  /**
   * 店主姓名
   */
  userName: function(e) {
    this.data.ruzhuinfo.userName = e.detail.value
    wx.setStorageSync('ruzhuinfo', this.data.ruzhuinfo)
  },
  video: function(e) {
    this.data.ruzhuinfo.video = e.detail.value

    console.log('录入信息', e.detail.value)
    wx.setStorageSync('ruzhuinfo', this.data.ruzhuinfo)
  },
  ewmLogo: function(e) {
    this.data.ruzhuinfo.ewmLogo = e.detail.value
    wx.setStorageSync('ruzhuinfo', this.data.ruzhuinfo)
  },
  /**
   * 联系电话
   */
  tel: function(e) {
    this.data.ruzhuinfo.tel = e.detail.value
    wx.setStorageSync('ruzhuinfo', this.data.ruzhuinfo)
    console.log('入驻信息', this.data.ruzhuinfo)
  },
  /**
   * 商家名称
   */
  storeName: function(e) {
    this.data.ruzhuinfo.storeName = e.detail.value
    wx.setStorageSync('ruzhuinfo', this.data.ruzhuinfo)
    console.log('入驻信息', this.data.ruzhuinfo)
  },
  /**
   * 登录密码
   */
  pwd: function(e) {
    this.data.pwd = e.detail.value
    this.setData({
      qrpwd: false
    })
  },
  /**
   * 确认登录密码
   */
  qrpwd: function(e) {
    console.log('密码长度', e.detail.value.length)
    if (this.data.pwd.length <= e.detail.value.length) {
      if (this.data.pwd.indexOf(e.detail.value) == -1) {
        wx.showToast({
          title: '密码不一致',
          image: '/images/search_no.png',
          duration: 2000
        })
        this.setData({
          qrpwdd: ''
        })
        return
      } else {
        this.data.ruzhuinfo.pwd = e.detail.value
      }
    } else {
      this.data.qrpwdd = e.detail.value
    }


  },
  /**
   * 商家分类
   */
  bindPickerChange(e) {
    console.log(e);
    console.log(this.data.ruzhuinfo);
    this.data.ruzhuinfo.storetypeId = this.data.functions[parseInt(e.detail.value)].id
    wx.setStorageSync('ruzhuinfo', this.data.ruzhuinfo)
    console.log('入驻信息', this.data.ruzhuinfo)
    this.setData({
      storetype: this.data.functions[e.detail.value].typeName
    })
  },
  /**
   *选择商家地址
   */
  map: function() {
    console.log('正在地址')
    var that = this
    wx.chooseLocation({
      type: 'wgs84', //'gcj02',
      success: function(res) {
        that.data.ruzhuinfo.coordinates = res.latitude + ',' + res.longitude
        that.data.ruzhuinfo.address = res.address
        wx.setStorageSync('ruzhuinfo', that.data.ruzhuinfo)
        console.log('入驻信息', that.data.ruzhuinfo);
        that.setData({
          coordinates: that.data.ruzhuinfo.coordinates,
          name: res.name,
          address: res.address
        });
      },
    });
  },
  add(e) {
    this.map()
  },
  address(e) {
    this.data.ruzhuinfo.address = e.detail.value
    wx.setStorageSync('ruzhuinfo', this.data.ruzhuinfo)
    this.setData({
      address: e.detail.value
    });
  },
  //门牌号或详细地址
  detailAdd(e){
    this.data.ruzhuinfo.detailsAddress = e.detail.value
    wx.setStorageSync('ruzhuinfo', this.data.ruzhuinfo)
    var that=this
    this.setData({
      detailsAddress:e.detail.value
    });
  },
  /**
   *店家开始营业时间
   */
  start: function(e) {
    this.data.ruzhuinfo.startTime = e.detail.value
    wx.setStorageSync('ruzhuinfo', this.data.ruzhuinfo)
    this.setData({
      stime: e.detail.value
    })
  },
  /**
   *店家结束营业时间
   */
  end: function(e) {
    this.data.ruzhuinfo.endTime = e.detail.value
    wx.setStorageSync('ruzhuinfo', this.data.ruzhuinfo)
    this.setData({
      etime: e.detail.value
    })
  },
  /**
   *店家公告
   */
  announcement: function(e) {
    this.data.ruzhuinfo.announcement = e.detail.value
    wx.setStorageSync('ruzhuinfo', this.data.ruzhuinfo)
  },
  cpi: function(e) {
    this.data.ruzhuinfo.cpi = e.detail.value
    wx.setStorageSync('ruzhuinfo', this.data.ruzhuinfo)
  },
  /**
   *特色服务
   */
  dxk1: function(e) {

    var a, b;
    a = e.detail.value
    b = a.join(',');
    this.data.tsfw1 = b

    console.log('特色服务', )
  },
  dxk2: function(e) {
    console.log('特色服务', e.detail.value)
    var a, b;
    a = e.detail.value
    b = a.join(',');
    this.data.tsfw2 = b
  },
  dxk3: function(e) {
    console.log('特色服务', e.detail.value)
    var a, b;
    a = e.detail.value
    b = a.join(',');
    this.data.tsfw3 = b
  },
  dxk4: function(e) {
    console.log('特色服务', e.detail.value)
    var a, b;
    a = e.detail.value
    b = a.join(',');
    this.data.tsfw4 = b
  },
  /**
   *店铺介绍
   */
  details: function(e) {
    this.data.ruzhuinfo.details = e.detail.value
    wx.setStorageSync('ruzhuinfo', this.data.ruzhuinfo)
  },
  // 预览图片
  previewImg: function(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: this.data.images,
    })
  },

  del: function(e) {
    // console.log(e)
    var dataset = e.currentTarget.dataset
    // 删除图片
    if (dataset.type == 'image') {
      this.data.images.splice(dataset.index, 1)
      this.data.imagesData.splice(dataset.index, 1)
      this.data.imagesData = this.data.imagesData
      this.setData({
        images: this.data.images
      })
    } else if (dataset.type == 'video') {
      this.data.videoData = ''
      this.setData({
        video: ''
      })
    }
  },


  upload: function(e) {
    if (this.data.imagesData.length <= 9) {
      var fileType = e.currentTarget.dataset.type
      var that = this;
      if (fileType == 'image') {
        that.uploadFile(that, 'image')
      } else if (fileType == 'video') {
        that.uploadFile(that, 'video')
      }
    }
  },

  // 上传图片视频等文件，封装
  uploadFile: function(page, fileType) {
    if (fileType == 'image') {
      if (page.data.imagesData.length < page.data.imgLimit) {
        wx.chooseImage({
          count: page.data.imgLimit,
          success: function(res) {
            console.log(res);
            var tempFilePaths = res.tempFilePaths;
            console.log('zhaopian', tempFilePaths)
            //tempFilePaths = tempFilePaths.slice(0, page.data.imgLimit - page.data.imagesData.length)
            var tempFilesSize = res.tempFiles
            tempFilePaths.forEach((item, index) => {
              if (page.data.imagesData.length < page.data.imgLimit) {
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
                      console.log(res);
                      var data = res.data
                      if (data.substring(data.length - 1) == "\"") {
                        data = data.substr(1, data.length - 2)
                      }
                      page.data.imagesData.push(data)
                      page.data.ruzhuinfo.logo = page.data.imagesData[0]
                      wx.setStorageSync('ruzhuinfo', page.data.ruzhuinfo)
                      data = util.parseImgUrl(data)
                      page.data.images.push(data)
                      page.setData({
                        images: page.data.images
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
                  title: '最多上传' + page.data.imgLimit + '张'
                })
                return
              }
            })
          }
        })
      } else {
        util.showFailToast({
          title: '最多上传' + page.data.imgLimit + '张'
        })
      }
    } else if (fileType == 'video') {
      wx.chooseVideo({
        success: function(res) {
          console.log(res);
          var tempFilePath = res.tempFilePath;
          console.log(tempFilePath)
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
              console.log(res1);
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
    // wx.hideLoading()
  },
  // 预览图片
  previewImg2: function(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: this.data.images2,
    })
  },
  del2: function(e) {
    // console.log(e)
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
            console.log(res);
            var tempFilePaths = res.tempFilePaths;
            console.log('zhaopian', tempFilePaths)
            // tempFilePaths = tempFilePaths.slice(0, page.data.imgLimit2 - page.data.imagesData2.length)
            var tempFilesSize = res.tempFiles
            tempFilePaths.forEach((item, index) => {
              if (page.data.imagesData2.length < page.data.imgLimit2) {
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
                      console.log(res);
                      var data = res.data
                      if (data.substring(data.length - 1) == "\"") {
                        data = data.substr(1, data.length - 2)
                      }
                      page.data.imagesData2.push(data)
                      page.data.ruzhuinfo.ad = page.data.imagesData2.join(',')
                      wx.setStorageSync('ruzhuinfo', page.data.ruzhuinfo)
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
          console.log(res);
          var tempFilePath = res.tempFilePath;
          console.log(tempFilePath)
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
              console.log(res1);
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
    // wx.hideLoading()
  },

  // 预览图片
  previewImg3: function(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: this.data.images3,
    })
  },
  del3: function(e) {
    // console.log(e)
    var dataset = e.currentTarget.dataset
    // 删除图片
    if (dataset.type == 'image') {
      this.data.images3.splice(dataset.index, 1)
      this.data.imagesData3.splice(dataset.index, 1)
      this.data.imagesData3 = this.data.imagesData3
      this.setData({
        images3: this.data.images3
      })
    } else if (dataset.type == 'video') {
      this.data.videoData = ''
      this.setData({
        video: ''
      })
    }
  },

  upload3: function(e) {
    if (this.data.imagesData3.length <= 9) {
      var fileType = e.currentTarget.dataset.type
      var that = this;
      if (fileType == 'image') {
        that.uploadFile3(that, 'image')
      } else if (fileType == 'video') {
        that.uploadFile3(that, 'video')
      }
    }
  },
  // 上传图片视频等文件，封装
  uploadFile3: function(page, fileType) {
    if (fileType == 'image') {
      if (page.data.imagesData3.length < page.data.imgLimit3) {
        wx.chooseImage({
          count: page.data.imgLimit3,
          success: function(res) {
            console.log(res);
            var tempFilePaths = res.tempFilePaths;
            console.log('zhaopian', tempFilePaths)
            // tempFilePaths = tempFilePaths.slice(0, page.data.imgLimit3 - page.data.imagesData3.length)
            var tempFilesSize = res.tempFiles
            tempFilePaths.forEach((item, index) => {
              if (page.data.imagesData3.length < page.data.imgLimit3) {
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
                      console.log(res);
                      var data = res.data
                      if (data.substring(data.length - 1) == "\"") {
                        data = data.substr(1, data.length - 2)
                      }
                      page.data.imagesData3.push(data)
                      page.data.ruzhuinfo.yyzzImg = page.data.imagesData3.join(',')
                      wx.setStorageSync('ruzhuinfo', page.data.ruzhuinfo)
                      data = util.parseImgUrl(data)
                      page.data.images3.push(data)
                      page.setData({
                        images3: page.data.images3
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
                  title: '最多上传' + page.data.imgLimit3 + '张'
                })
                return
              }
            })
          }
        })
      } else {
        util.showFailToast({
          title: '最多上传' + page.data.imgLimit3 + '张'
        })
      }
    } else if (fileType == 'video') {
      wx.chooseVideo({
        success: function(res) {
          console.log(res);
          var tempFilePath = res.tempFilePath;
          console.log(tempFilePath)
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
              console.log(res1);
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
    //  wx.hideLoading()
  },

  // 预览图片4
  previewImg4: function(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: this.data.images4,
    })
  },
  del4: function(e) {
    // console.log(e)
    var dataset = e.currentTarget.dataset
    // 删除图片
    if (dataset.type == 'image') {
      this.data.images4.splice(dataset.index, 1)
      this.data.imagesData4.splice(dataset.index, 1)
      this.data.imagesData4 = this.data.imagesData4
      this.setData({
        images4: this.data.images4
      })
    } else if (dataset.type == 'video') {
      this.data.videoData = ''
      this.setData({
        video: ''
      })
    }
  },

  upload4: function(e) {
    if (this.data.imagesData4.length <= 9) {
      var fileType = e.currentTarget.dataset.type
      var that = this;
      if (fileType == 'image') {
        that.uploadFile4(that, 'image')
      } else if (fileType == 'video') {
        that.uploadFile4(that, 'video')
      }
    }
  },
  // 上传图片视频等文件，封装
  uploadFile4: function(page, fileType) {
    if (fileType == 'image') {
      if (page.data.imagesData4.length < page.data.imgLimit4) {
        wx.chooseImage({
          count: page.data.imgLimit4,
          success: function(res) {
            console.log(res);
            var tempFilePaths = res.tempFilePaths;
            console.log('zhaopian', tempFilePaths)
            // tempFilePaths = tempFilePaths.slice(0, page.data.imgLimit4 - page.data.imagesData4.length)
            var tempFilesSize = res.tempFiles
            tempFilePaths.forEach((item, index) => {
              if (page.data.imagesData4.length+index+1 <3) {
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
                      console.log(res);
                      var data = res.data
                      if (data.substring(data.length - 1) == "\"") {
                        data = data.substr(1, data.length - 2)
                      }
                      page.data.imagesData4.push(data)
                      page.data.ruzhuinfo.sfzImg = page.data.imagesData4.join(',')
                      wx.setStorageSync('ruzhuinfo', page.data.ruzhuinfo)
                      data = util.parseImgUrl(data)
                      page.data.images4.push(data)
                      page.setData({
                        images4: page.data.images4
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
                  title: '最多上传' + page.data.imgLimit4 + '张'
                })
                return
              }
            })
          }
        })
      } else {
        util.showFailToast({
          title: '最多上传' + page.data.imgLimit4 + '张'
        })
      }
    } else if (fileType == 'video') {
      wx.chooseVideo({
        success: function(res) {
          console.log(res);
          var tempFilePath = res.tempFilePath;
          console.log(tempFilePath)
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
              console.log(res1);
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
    // wx.hideLoading()
  },
  // 预览图片5
  previewImg5: function(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: this.data.images5,
    })
  },
  del5: function(e) {
    // console.log(e)
    var dataset = e.currentTarget.dataset
    // 删除图片
    if (dataset.type == 'image') {
      this.data.images5.splice(dataset.index, 1)
      this.data.imagesData5.splice(dataset.index, 1)
      this.data.imagesData5 = this.data.imagesData5
      this.setData({
        images5: this.data.images5
      })
    } else if (dataset.type == 'video') {
      this.data.videoData = ''
      this.setData({
        video: ''
      })
    }
  },

  upload5: function(e) {
    if (this.data.imagesData5.length <= 9) {
      var fileType = e.currentTarget.dataset.type
      var that = this;
      if (fileType == 'image') {
        that.uploadFile5(that, 'image')
      } else if (fileType == 'video') {
        that.uploadFile5(that, 'video')
      }
    }
  },
  // 上传图片视频等文件，封装
  uploadFile5: function(page, fileType) {
    if (fileType == 'image') {
      if (page.data.imagesData5.length < page.data.imgLimit5) {
        wx.chooseImage({
          count: page.data.imgLimit5,
          success: function(res) {
            console.log(res);
            var tempFilePaths = res.tempFilePaths;
            console.log('zhaopian', tempFilePaths)
            //tempFilePaths = tempFilePaths.slice(0, page.data.imgLimit5 - page.data.imagesData5.length)
            var tempFilesSize = res.tempFiles
            tempFilePaths.forEach((item, index) => {
              if (page.data.imagesData5.length+index < page.data.imgLimit5) {
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
                      console.log(res);
                      var data = res.data
                      if (data.substring(data.length - 1) == "\"") {
                        data = data.substr(1, data.length - 2)
                      }
                      page.data.imagesData5.push(data)
                      page.data.ruzhuinfo.img = page.data.imagesData5.join(',')
                      wx.setStorageSync('ruzhuinfo', page.data.ruzhuinfo)
                      data = util.parseImgUrl(data)
                      page.data.images5.push(data)
                      page.setData({
                        images5: page.data.images5
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
                  title: '最多上传' + page.data.imgLimit5 + '张'
                })
                return
              }
            })
          }
        })
      } else {
        util.showFailToast({
          title: '最多上传' + page.data.imgLimit5 + '张'
        })
      }
    } else if (fileType == 'video') {
      wx.chooseVideo({
        success: function(res) {
          console.log(res);
          var tempFilePath = res.tempFilePath;
          console.log(tempFilePath)
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
              console.log(res1);
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

  },
  tz: function() {
    wx.navigateTo({
      url: '/pages/booszy/booszy',
    })
  }
})
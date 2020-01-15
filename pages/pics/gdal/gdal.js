const storage = require("../../../utils/storage.js");
const http = require("../../../utils/http.js");
//const Quantity = require('../../component/quantity/index');
const constant = require("../../../utils/constant.js");
const util = require("../../../utils/util.js");
var app = getApp();
// pages/index/index.js
Page({
  data: {
    statusBarHeight: app.globalData.statusBarHeight,
    host: constant.host + '/img/',
    business: '',
    id: 0,
    logo: '',
    coupon: {},
    coupons: {},
    usercouponid: 0,
    usercouponids: [],
    fx: false,
    money: '',
    ddjid: 0,
    ddjlist: [],
    // jtp: 0,
    full: 0, //减免&&代金券面额
    beizhu: '',
    buyouhui: false,
    youhui: false,
    // money: 0,
    jmsum: 0
  },
  onLoad: function(e) {
    var that = this;
    if (e.business != undefined) {
      //   const business = JSON.parse(e.business);
      this.setData({
        phone: wx.getStorageSync('user').qphone,
        business: e.business,
        logo: e.logo,
        id: e.id
      })
      console.log('店铺信息', that.data.business);

      http.request({
        url: '/getQuserCoupon',
        data: {
          quserid: wx.getStorageSync('user').id,
          qstoreId: that.data.id,
          qstatus: 1,
          typeId: 1
        },
        success: function(e) {
          console.log('我的优惠劵', e)
          that.setData({
            coupon: e,
          })
        },
      })
      http.request({
        url: '/getQuserCoupon',
        data: {
          quserid: wx.getStorageSync('user').id,
          qstoreId: that.data.id,
          qstatus: 1,
          typeId: 2
          // qdelete: 1
        },
        success: function(e) {
          that.setData({
            coupons: e,
          })
        },
      })
    }
    if (e.fanhui != undefined) {
      that.setData({
        fanhui: 2
      })
    }
  },
  buyouhui(e) {
    this.setData({
      bujianmian: '',
      buyouhui: this.data.buyouhui ? false : true
    })
    this.updatamoney(this.data.money)
  },
  fanhui() {
    wx.navigateBack({
      delta: this.data.fanhui == 2 ? 2 : 1
    })
  },
  updatamoney: function(money) {
    console.log('总金额', money)
    this.setData({
      usercouponid: 0,
      youhui: false,
      full: 0
    })
    if (this.data.coupon.length != 0) {
      this.data.coupon.forEach((item, index) => {
        if (parseFloat(money) >= item.full) {
          var typeId = item.typeId
          this.setData({
            usercouponid: item.id,
            youhui: true,
            jtp: item.typeId,
            man: parseFloat(item.full),
            full: typeId == 1 ? parseFloat(item.full) : parseFloat(item.money)
          })
          return
        } else {
          this.setData({
            jtp: 0,
          })
        }
      })

    }
    this.setData({
      money: this.data.money,
    })
  },
  money: function(e) {
    console.log('总金额', e.detail.value)
    // if (0 < parseFloat(e.detail.value)) {
    if (parseFloat(e.detail.value)>=0) {
      this.setData({
        usercouponid: 0,
        jmsum: 0,
        money: e.detail.value,
      })
    } else {
      util.showFailToast({
        title: '金额设置不合理'
      });
      this.setData({
        money: ''
      })
    }
    //  this.updatamoney(e.detail.value)

  },
  bujianmian: function(e) {
    console.log('不减免金额', e.detail.value)
    if (0 < parseFloat(e.detail.value) && parseFloat(e.detail.value) < parseFloat(this.data.money)) {
      this.updatamoney(parseFloat(this.data.money) - parseFloat(e.detail.value))
      this.setData({
        bujianmian: e.detail.value
      })
    } else {
      util.showFailToast({
        title: '金额设置不合理'
      });
      this.setData({
        bujianmian: ''
      })
    }
  },

  beizhu: function(e) {
    this.setData({
      beizhu: e.detail.value
    })
  },
  // prepay: function() {
  //   var that = this;
  //   console.log(that.data.usercouponids);
  //   var nowDate = util.getNowDate()
  //   var order = {};
  //   if (that.data.money == '') {
  //     util.showFailToast({
  //       title: '支付金额未填写'
  //     });
  //     return
  //   }
  //   // if (that.data.money <=0) {
  //   //   util.showFailToast({
  //   //     title: '支付金额未填写'
  //   //   });
  //   //   return
  //   // }
  //   order.id = '';
  //   order.qsubmitter = app.globalData.userOpen.openid
  //   // order.qsum =that.data.money-that.data.jmsum == 0 ? 0 : (that.data.money - that.data.jmsum).toFixed(2);
  //   order.qsum = 0.01;
  //   //请求支付的id 保证id不会重复
  //   http.request({
  //     url: "/insertQfacepay",
  //     data: {
  //       quserId: wx.getStorageSync('user')[0].id,
  //       quserName: wx.getStorageSync('user')[0].qnick,
  //       qbusinessId: that.data.id,
  //       qimg: that.data.logo,
  //       qbusinessName: that.data.business,
  //       // qsum: parseFloat(that.data.money),      //修改价格
  //       // qsum: 0.01,
  //       qsale: parseFloat(that.data.jmsum),
  //       qdelete:2
  //     },
  //     success: function(num) {
  //       order.id=num;
  //       order.qsubmitterIcon = 'F';
  //       order.qsubmitter = app.globalData.userOpen.openid;
  //       // console.log('我的优惠劵', e)
  //       // that.setData({
  //       //   coupon: e,
  //       //   nowDate: nowDate,
  //       //   fx: true
  //       // })
  //       //请求支付的接口插入支付的金额
  //       //判断用户支付的金额是否小于等于0 为true的话就跳过支付操作
  //       if(order.qsum<=0){
  //         //将插入时的订单的状态改为已支付状态
  //         http.request({
  //           url: "/updateQfacepay",
  //           data: {
  //             id:num,
  //             quserId: wx.getStorageSync('user')[0].id,
  //             // quserName: wx.getStorageSync('user')[0].qnick,
  //             qbusinessId: that.data.id,
  //             // qimg: that.data.logo,
  //             // qbusinessName: that.data.business,
  //             qsum: parseFloat(that.data.money),
  //             qsale: parseFloat(that.data.jmsum),
  //             qdelete: 1
  //           },
  //           success: function (res) {
  //             var obj={}
  //             obj.sum=parseFloat(that.data.money);
  //             obj.sjsum=order.qsum
  //             obj.djj= parseFloat(that.data.jmsum);
  //             obj.storeName=that.data.business;
  //             let now = new Date();
  //             let year = now.getFullYear();
  //             let month = now.getMonth()+1;//真实的月份需要再加上1
  //             let day = now.getDate();
  //             let hou=now.getHours(); //获取系统时，
  //             let min=now.getMinutes(); //分
  //             let sec=now.getSeconds(); //秒
  //             obj.id=that.data.id
  //             obj.time=year+'-'+month+'-'+day+'  '+hou+':'+min+':'+sec;
  //             wx.navigateTo({
  //               url:"/pages/pics/paysuccess?order="+JSON.stringify(obj)
  //             })
  //           }
  //         });
  //         that.data.usercouponids.forEach(item => {
  //           http.request({
  //             url: '/updateQuserCoupon',
  //             data: {
  //               // quserid: wx.getStorageSync('user')[0].id,
  //               //qstoreId: that.data.business.id,
  //               id: item,
  //               qstatus: 2
  //               // qdelete: 1
  //             },
  //             success: function(e) {
  //               // console.log('我的优惠劵', e)
  //               // that.setData({
  //               //   coupon: e,
  //               //   nowDate: nowDate,
  //               //   fx: true
  //               // })
  //             },
  //           });
  //           that.setData({
  //             // coupon: e,
  //             nowDate: nowDate,
  //             fx: true
  //           })
  //         })
  //         //判断用户支付的金额大于0的时候就执行调用支付接口的操作
  //       }else{
  //         http.request({
  //           url: '/prepay',
  //           data: order,
  //           success: function(data) {
  //             http.request({
  //               url: '/getQbusiness',
  //               data: {
  //                 id: that.data.id,
  //                 state: 2,
  //                 coordinates: wx.getStorageSync('latitude') + ',' + wx.getStorageSync('longitude'),
  //               },
  //               success: function(e) {
  //                 //请求微信api调起支窗口
  //                 wx.requestPayment({
  //                   timeStamp: data.timeStamp,
  //                   nonceStr: data.nonceStr,
  //                   package: data.package,
  //                   signType: data.signType,
  //                   paySign: data.paySign,
  //                   appId: data.appId,
  //                   success: function(response) {
  //                     console.log('正在支付')
  //                     if (response.errMsg == "requestPayment:ok") {
  //                       // http.request({
  //                       //   url: '/insertQhongbao',
  //                       //   data: {
  //                       //     qtype: 5,
  //                       //     qid: wx.getStorageSync('user')[0].id,
  //                       //     qstore: '到店付款',
  //                       //     qicon: '',
  //                       //     qsum: parseFloat(that.data.money) - parseFloat(that.data.jmsum), //0.01, //
  //                       //     qstatus: 2,
  //                       //     qnum: 1,
  //                       //     qnumber: qgroupid
  //                       //   },
  //                       //   success: function(e) {
  //                       //   }
  //                       // })
  //                       //当用户当面支付之后修改商家的money
  //                       //当订单支付成功的时候修改商户的金额
  //                       http.request({
  //                         url: '/updateQbusiness',
  //                         data: {
  //                           id:that.data.id,
  //                           // money:e[0].money+order.qsum//          修改价格
  //                           // money:0.01
  //                         },
  //                         success: function(e) {
  //                           console.log('成功')
  //                           // money:that.data.business.money+
  //                         }
  //                       })
  //                       //将插入时的订单的状态改为已支付状态
  //                       http.request({
  //                         url: "/updateQfacepay",
  //                         data: {
  //                           id:num,
  //                           quserId: wx.getStorageSync('user')[0].id,
  //                           // quserName: wx.getStorageSync('user')[0].qnick,
  //                           qbusinessId: that.data.id,
  //                           // qimg: that.data.logo,
  //                           // qbusinessName: that.data.business,
  //                           qsum: parseFloat(that.data.money),
  //                           qsale: parseFloat(that.data.jmsum),
  //                           qdelete: 1
  //                         },
  //                         success: function (num) {
  //                         }
  //                       });
  //                       that.setData({
  //                         fx: true
  //                       })
  //                       that.data.usercouponids.forEach(item => {
  //                         http.request({
  //                           url: '/updateQuserCoupon',
  //                           data: {
  //                             // quserid: wx.getStorageSync('user')[0].id,
  //                             //qstoreId: that.data.business.id,
  //                             id: item,
  //                             qstatus: 2
  //                             // qdelete: 1
  //                           },
  //                           success: function(e) {
  //                           },
  //                         });
  //                         that.setData({
  //                           // coupon: e,
  //                           nowDate: nowDate,
  //
  //                         })
  //                       })
  //                     } else {
  //                       util.showFailToast({
  //                         title: '支付失败！'
  //                       });
  //                       return;
  //                     }
  //                   },
  //                   complete:function(e){
  //                     console.log(e,'点击成为')
  //                   },
  //                   fail: function(response) {
  //                     util.showFailToast({
  //                       title: '取消支付！'
  //                     });
  //                   }
  //                 })
  //               }
  //             })
  //           }
  //         });
  //       }
  //     },
  //   })
  // },
prepay: function() {
    var that = this
    console.log(that.data.usercouponids);
    var order = {};
    if (that.data.money == '') {
        util.showFailToast({
            title: '支付金额未填写'
        });
        return
    }
    if(isNaN(that.data.money)||that.data.money<=0){
        util.showFailToast({
            title: '支付金额有误'
        });
        return
    }
    //发起支付前写入订单
    http.request({
        url: "/insertQfacepay",
        data: {
            quserId: wx.getStorageSync('user').id,
            quserName: wx.getStorageSync('user').qnick,
            qbusinessId: that.data.id,
            qimg: that.data.logo,
            qbusinessName: that.data.business,
            qsum: parseFloat(that.data.money),
            qsale: parseFloat(that.data.jmsum),
            qdelete: 2,
            //代金劵id
            qdjqid:that.data.usercouponid||0
        },
        success: function(e) {
            var nowDate = util.getNowDate()
            //获取到此次支付的订单的id
            that.setData({
                facepayid: e
            })
            order.id = that.data.facepayid
            order.qsubmitterIcon = 'F'+Date.now()
            order.qsubmitter = app.globalData.userOpen.openid
            order.qsum = that.data.money - that.data.jmsum == 0 ? 0 : (that.data.money - that.data.jmsum).toFixed(2)
            //设置支付类型3为到店买单
            order.type=3
            //在当前页面的data数据中获取需要充值的商户的id
            order.fkBusinessId=that.data.id||''
            // order.qsum = 0.01;
            if(order.qsum<=0){
                //将插入时的订单的状态改为已支付状态
                http.request({
                    url: "/updateQfacepay",
                    data: {
                        id:that.data.facepayid,
                        quserId: wx.getStorageSync('user').id,
                        // quserName: wx.getStorageSync('user')[0].qnick,
                        qbusinessId: that.data.id,
                        // qimg: that.data.logo,
                        // qbusinessName: that.data.business,
                        qsum: parseFloat(that.data.money),
                        qsale: parseFloat(that.data.jmsum),
                        qdelete: 1,
                        orderId:0
                    },
                    success: function (res) {
                        var obj={}
                        obj.sum=parseFloat(that.data.money);
                        obj.sjsum=order.qsum
                        obj.djj= parseFloat(that.data.jmsum);
                        obj.storeName=that.data.business;
                        let now = new Date();
                        let year = now.getFullYear();
                        let month = now.getMonth()+1;//真实的月份需要再加上1
                        let day = now.getDate();
                        let hou=now.getHours(); //获取系统时，
                        let min=now.getMinutes(); //分
                        let sec=now.getSeconds(); //秒
                        obj.id=that.data.id
                        obj.time=year+'-'+month+'-'+day+'  '+hou+':'+min+':'+sec;
                        wx.navigateTo({
                            url:"/pages/pics/paysuccess?order="+JSON.stringify(obj)
                        })
                    }
                });
                that.data.usercouponids.forEach(item => {
                    http.request({
                        url: '/updateQuserCoupon',
                        data: {
                            id: item,
                            qstatus: 2
                        },
                        success: function(e) {
                        },
                    });
                    that.setData({
                        // coupon: e,
                        nowDate: nowDate,
                        fx: true
                    })
                })
                //判断用户支付的金额大于0的时候就执行调用支付接口的操作
            }else{
                http.request({
                    url: '/prepayTo',
                    data: order,
                    success: function(data) {
                        console.log(data);
                        wx.requestPayment({
                            timeStamp: data.timeStamp,
                            nonceStr: data.nonceStr,
                            package: data.package,
                            signType: data.signType,
                            paySign: data.paySign,
                            success: function(response) {
                                console.log(response,1111,nowDate);
                                if (response.errMsg == "requestPayment:ok") {
                                    that.setData({
                                        nowDate: nowDate,
                                    })
                                    //支付成功后修改状态
                                    // that.upDate()
                                    // clearInterval(timer)
                                    // http.request({
                                    //     url: "/updateQfacepay",
                                    //     data: {
                                    //         id: that.data.facepayid,
                                    //         quserId: wx.getStorageSync('user').id,
                                    //         quserName: wx.getStorageSync('user').qnick,
                                    //         qbusinessId: that.data.id,
                                    //         qimg: that.data.logo,
                                    //         qbusinessName: that.data.business,
                                    //         qsum: parseFloat(that.data.money),
                                    //         qsale: parseFloat(that.data.jmsum),
                                    //         qdelete: 1,
                                    //         orderId:id
                                    //     },
                                    //     success: function(e) {
                                    //         that.setData({
                                    //             isfuk:true
                                    //         })
                                    //     },
                                    // });
                                    that.data.usercouponids.forEach(item => {
                                        http.request({
                                            url: '/updateQuserCoupon',
                                            data: {
                                                id: item,
                                                qstatus: 2
                                            },
                                            success: function(e) {
                                                that.setData({
                                                    isfuk:true
                                                })
                                            },
                                        })
                                    });
                                    that.setData({
                                        nowDate: nowDate,
                                        fx: true,
                                        isfuk:true,
                                    })
                                } else {
                                    that.setData({
                                        money:0,
                                        jmsum:0,
                                        usercouponid:''
                                    })
                                    util.showFailToast({
                                        title: '支付失败'
                                    });
                                    // clearInterval(timer)
                                    return;
                                }
                            },
                            fail: function(response) {
                                // console.log(response,2222)
                                // clearInterval(timer)
                                //测试
                                // that.setData({
                                //   nowDate: nowDate,
                                //   fx: true
                                // })
                                // http.request({
                                //   url: "/insertQfacepay",
                                //   data: {
                                //     quserId: wx.getStorageSync('user')[0].id,
                                //     quserName: wx.getStorageSync('user')[0].qnick,
                                //     qbusinessId: that.data.business.id,
                                //     qbusinessName: that.data.business.storeName,
                                //     qsum: parseFloat(that.data.money) - parseFloat(that.data.jmsum),
                                //     qsale: parseFloat(that.data.jmsum),

                                //   },
                                //   success: function(e) {
                                //     // console.log('我的优惠劵', e)
                                //     // that.setData({
                                //     //   coupon: e,
                                //     //   nowDate: nowDate,
                                //     //   fx: true
                                //     // })
                                //   },
                                // })
                                that.setData({
                                    money:0,
                                    jmsum:0,
                                    usercouponid:''
                                })
                                util.showFailToast({
                                    title: '支付取消！'
                                });
                            },
                        })
                    }
                });
            }
        },
    })
},
upDate(id){
    var nowDate = util.getNowDate()
    var that=this;
   if(!this.data.isfuk){
       http.request({
           url: "/updateQfacepay",
           data: {
               id: that.data.facepayid,
               quserId: wx.getStorageSync('user').id,
               quserName: wx.getStorageSync('user').qnick,
               qbusinessId: that.data.id,
               qimg: that.data.logo,
               qbusinessName: that.data.business,
               qsum: parseFloat(that.data.money),
               qsale: parseFloat(that.data.jmsum),
               qdelete: 1,
               orderId:id
           },
           success: function(e) {
               that.setData({
                   isfuk:true
               })
           },
       });
       that.data.usercouponids.forEach(item => {
           http.request({
               url: '/updateQuserCoupon',
               data: {
                   // quserid: wx.getStorageSync('user')[0].id,
                   //qstoreId: that.data.business.id,
                   id: item,
                   qstatus: 2
                   // qdelete: 1
               },
               success: function(e) {
                   that.setData({
                       isfuk:true
                   })
               },
           })
       });
       that.setData({
           // coupon: e,
           nowDate: nowDate,
           fx: true,
           isfuk:true
       })
   }
},
  xuanze(e) {

    let num = e.currentTarget.dataset.num
    let id = e.currentTarget.dataset.id
    console.log(e,num,id,this.data.usercouponid)
    var that=this
    if (this.data.money == '') {
      util.showFailToast({
        title: '支付金额未填写'
      });
      return
    }
    let tp = e.currentTarget.dataset.tp
    if (parseFloat(this.data.money) < (tp == 1 ? parseFloat(e.currentTarget.dataset.jmsum) : parseFloat(e.currentTarget.dataset.man))) {
      util.showFailToast({
        title: '不满足使用条件'
      });
      return
    }
    //选中和反选
    if( e.currentTarget.dataset.id==that.data.usercouponid){
        this.setData({
            jmsum: 0,
            usercouponid: e.currentTarget.dataset.id==that.data.usercouponid?'':e.currentTarget.dataset.id,
            usercouponids: []
        })
    }else{
        this.setData({
            jmsum: e.currentTarget.dataset.jmsum,
            usercouponid: e.currentTarget.dataset.id==that.data.usercouponid?'':e.currentTarget.dataset.id,
            usercouponids: num == 1 ? [id] : that.data.ddjlist[e.currentTarget.dataset.index].idd.split(",")
        })
    }
  },
  getPhoneNumber: function(e) { //点击获取手机号码按钮
    console.log(e);
    var that = this;
    if (!wx.getStorageSync('user').qphone) {
      wx.checkSession({
        success: function() {
          console.log(e.detail.encryptedData)
          var ency = e.detail.encryptedData;
          var iv = e.detail.iv;
          var sessionk = app.globalData.userOpen.session_key;
          if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
            that.setData({
              modalstatus: true
            });
          } else { //同意授权
            console.log('同意授权')
            wx.request({
              method: "GET",
              url: constant.host + '/deciphering.do',
              data: {
                id: wx.getStorageSync('user').id,
                encrypdata: ency,
                ivdata: iv,
                sessionkey: sessionk
              },
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: (res) => {
                http.request({
                  url: '/getQuser',
                  data: {
                    id: wx.getStorageSync('user').id,
                  },
                  success: function(data) {
                    wx.setStorageSync('user', data)
                    that.setData({
                      phone: wx.getStorageSync('user').qphone,
                    })
                  }
                })
              },
              fail: function(res) {
                console.log("解密失败");
              }
            });
          }
        },
        fail: function() {
          console.log("session_key 已经失效");
          //重新登录
        }

      });
    }
  },
  tochat: function(e) {
    console.log(e);
    var message = {};
    message.qformId = e.detail.formId;
    message.qopenId = getApp().globalData.userOpen.openid
    console.log(message);
    http.request({
      url: '/insertQmessage',
      data: message,
      success: function(resp) {
        console.log(resp);
      }
    });

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
        console.log('更改用户ID发送成功');
        getApp().globalData.imuserInfo.userId = app.globalData.userOpen.openid;
      },
      fail: (res) => {
        console.log('更改用户ID列表失败', res);
      }
    });
    let item = {};
    item.friendId = this.data.id + '';
    item.friendHeadUrl = this.data.host + this.data.business.logo;
    item.friendName = this.data.business.storeName;

    item.conversationId = -1;
    item.msgUserId = app.globalData.userOpen.openid;
    item.timeStr = "19:06";
    item.timestamp = 1533294362000;
    item.type = "text";
    wx.navigateTo({
      url: `/pages/im/chat/chat?friend=${JSON.stringify(item)}`
    });
  },
  gbfx: function() {
    this.setData({
      fx: false
    })
    wx.switchTab({
      url: '/pages/index/index',
    })
  }
})
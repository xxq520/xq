// pages/booszy/booszy.js
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
const time = require("../../utils/time.js");
var app = getApp();
var numCount = 6;
var numSlot = 5;
var mW = 360;
var mH = 360;
var mCenter = mW / 2; //中心点
var mAngle = Math.PI * 2 / numCount; //角度
var mRadius = mCenter - 60; //半径(减去的值用于给绘制的文本留空间)
//获取Canvas
var radCtx = wx.createCanvasContext("radarCanvas")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 0,
    limit: 20,
    user: '',
    shop: '',
    // time: 0,
    order: 0,
    orders: 0,
    sel: 1,
    records: {},
    fenxiao: 0,
    fenxiaos: 0,
    procedureNum: 0,
    procedureTypeNum: 0,
    arr: [0, 2],
    stepText: 5,
    chanelArray1: [
      ["访问首页", 0],
      ["访问商品", 0],
      ["浏览信息", 0],
      ["分享店铺", 0],
      ["分享商品", 0],
      ["分享信息", 0]
    ],
    chanelArray2: [
      ["下单量", 24],
      ["访问量", 60],
      ["点赞量", 88],
      ["收藏量", 49],
      ["转发量", 46],
      ["转发量", 92]
    ],
    width: app.systemInfo.windowWidth,
    height: app.systemInfo.windowHeight + 50,
    noinfo: false,
    load: true
  },


  /**
   * 生命周期函数--监听页面加载
   */


  toChat(e) {
    let item = e.currentTarget.dataset.item;
    delete item.latestMsg;
    delete item.unread;
    delete item.content;
    wx.navigateTo({
      url: `/pages/im/chat/chat?friend=${JSON.stringify(item)}`
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    wx.setStorageSync('first',true)
    //雷达图
    this.drawRadar()
  },
  onScroll: util.throttle(function(e) {
    var that = this
    that.setData({
      load: true,
    })
    that.data.page++
      http.request({
        url: '/getQuserRecord',
        data: {
          qbusinessid: wx.getStorageSync('shop').id,
          orderstr: ' order by id desc limit ' + that.data.page * that.data.limit + ',' + that.data.limit
        },
        success: function(data) {
          var ftime = '';
          for (var i = 0; i < data.length; i++) {
            data[i].qtime=time.timeStamp(data[i].qtime)
            if (ftime == data[i].qtime.slice(0, 10)) {
              data[i].qshow = false;
              data[i].qshowtime = ftime
            } else {
              ftime = data[i].qtime.slice(0, 10);
              data[i].qshow = true;
              data[i].qshowtime = ftime
            }
            that.data.records.push(data[i])
          }
          setTimeout(function() {
            that.setData({
              noinfo: data.length < that.data.limit ? true : false,
              load: false,
              records: that.data.records
            })
          }, 1200);
        }
      },true);
  }, 1000),
  drawRadar: function() {
    var that = this
    http.request({
      url: '/getQuserRecordNum',
      data: {
        qbusinessid: wx.getStorageSync('shop').id,
      },
      success: function(data) {
        var sum = 0;
        for (var i = 0; i < data.length; i++) {
          sum = sum + data[i].qnum;
          if (data[i].qtype == 1) {
            that.data.chanelArray1[0][1] = data[i].qnum;
          }
          if (data[i].qtype == 2) {
            that.data.chanelArray1[1][1] = data[i].qnum;
          }
          if (data[i].qtype == 3) {
            that.data.chanelArray1[2][1] = data[i].qnum;
          }
          if (data[i].qtype == 4) {
            that.data.chanelArray1[3][1] = data[i].qnum;
          }
          if (data[i].qtype == 5) {
            that.data.chanelArray1[4][1] = data[i].qnum;
          }
          if (data[i].qtype == 6) {
            that.data.chanelArray1[5][1] = data[i].qnum;
          }
        }
        for (var i = 0; i < 6; i++) {
          that.data.chanelArray1[i][1] = parseInt(that.data.chanelArray1[i][1] / sum * 100)
        }
        that.olddrawRadar();
        that.setData({
          chanelArray1: that.data.chanelArray1
        })
      }
    },true)
  },
  // 雷达图
  olddrawRadar: function() {
    var sourceData1 = this.data.chanelArray1
    //  var sourceData2 = this.data.chanelArray2

    //调用
    this.drawEdge() //画六边形
    //this.drawArcEdge() //画圆
    this.drawLinePoint()
    //设置数据
    this.drawRegion(sourceData1, 'rgba(255, 0, 0, 0.5)') //第一个人的
    // this.drawRegion(sourceData2, 'rgba(255, 200, 0, 0.5)') //第二个人
    //设置文本数据
    this.drawTextCans(sourceData1)
    //设置节点
    this.drawCircle(sourceData1, 'red')
    // this.drawCircle(sourceData2, 'yellow')
    //开始绘制
    radCtx.draw()
  },
  // 绘制6条边
  drawEdge: function() {
    radCtx.setStrokeStyle("#333333") //设置线的颜色
    radCtx.setLineWidth(1) //设置线宽
    for (var i = 0; i < numSlot; i++) {
      //计算半径
      radCtx.beginPath()
      var rdius = mRadius / numSlot * (i + 1)
      //画6条线段
      for (var j = 0; j < numCount; j++) {
        //坐标
        var x = mCenter + rdius * Math.cos(mAngle * j);
        var y = mCenter + rdius * Math.sin(mAngle * j);
        radCtx.lineTo(x, y);
      }
      radCtx.closePath()
      radCtx.stroke()
    }
  },
  // 绘制连接点
  drawLinePoint: function() {
    radCtx.beginPath();
    for (var k = 0; k < numCount; k++) {
      var x = mCenter + mRadius * Math.cos(mAngle * k);
      var y = mCenter + mRadius * Math.sin(mAngle * k);

      radCtx.moveTo(mCenter, mCenter);
      radCtx.lineTo(x, y);
    }
    radCtx.stroke();
  },
  //绘制数据区域(数据和填充颜色)
  drawRegion: function(mData, color) {

    radCtx.beginPath();
    for (var m = 0; m < numCount; m++) {
      var x = mCenter + mRadius * Math.cos(mAngle * m) * mData[m][1] / 100;
      var y = mCenter + mRadius * Math.sin(mAngle * m) * mData[m][1] / 100;

      radCtx.lineTo(x, y);
    }
    radCtx.closePath();
    radCtx.setFillStyle(color)
    radCtx.fill();
  },
  //绘制文字
  drawTextCans: function(mData) {
    radCtx.setFillStyle("black")
    radCtx.font = '14px 微软雅黑' //设置字体
    for (var n = 0; n < numCount; n++) {
      var x = mCenter + mRadius * Math.cos(mAngle * n);
      var y = mCenter + mRadius * Math.sin(mAngle * n);
      // radCtx.fillText(mData[n][0], x, y);
      //通过不同的位置，调整文本的显示位置
      if (mAngle * n >= 0 && mAngle * n <= Math.PI / 2) {
        radCtx.fillText(mData[n][0], x + 5, y + 5);
      } else if (mAngle * n > Math.PI / 2 && mAngle * n <= Math.PI) {
        radCtx.fillText(mData[n][0], x - radCtx.measureText(mData[n][0]).width - 7, y + 5);
      } else if (mAngle * n > Math.PI && mAngle * n <= Math.PI * 3 / 2) {
        radCtx.fillText(mData[n][0], x - radCtx.measureText(mData[n][0]).width - 5, y);
      } else {
        radCtx.fillText(mData[n][0], x + 7, y + 2);
      }
    }
  },
  //画点
  drawCircle: function(mData, color) {
    var r = 3; //设置节点小圆点的半径
    for (var i = 0; i < numCount; i++) {
      var x = mCenter + mRadius * Math.cos(mAngle * i) * mData[i][1] / 100;
      var y = mCenter + mRadius * Math.sin(mAngle * i) * mData[i][1] / 100;
      radCtx.beginPath();
      radCtx.arc(x, y, r, 0, Math.PI * 2);
      radCtx.fillStyle = color;
      radCtx.fill();
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this
    http.request({
      url: '/getQuserRecord',
      data: {
        qbusinessid: wx.getStorageSync('shop').id,
        orderstr: 'order by id desc limit ' + that.data.page * that.data.limit + ',' + that.data.limit
      },
      success: function(data) {
        var ftime = '';
        for (var i = 0; i < data.length; i++) {
          data[i].qtime=time.timeStamp(data[i].qtime)
          if (ftime == data[i].qtime.slice(0, 10)) {
            data[i].qshow = false;
            data[i].qshowtime = ftime
          } else {
            ftime = data[i].qtime.slice(0, 10);
            data[i].qshow = true;
            data[i].qshowtime = ftime
          }
        }
        that.setData({
          noinfo: data.length < that.data.limit ? true : false,
          load: false,
          records: data
        })
      }
    },true);
    getApp().globalData.imuserInfo.myHeadUrl = constant.imghost + wx.getStorageSync('shop').logo;
    getApp().globalData.imuserInfo.nickName = wx.getStorageSync('shop').storeName;

    getApp().getIMHandler().setOnReceiveMessageListener({
      listener: (msg) => {
        console.log(msg,'聊天的消息')
        // msg.conversations[0].friendHeadUrl = this.data.shopicon;
        // msg.conversations[0].friendName = this.data.shopname;
        // msg.conversations[0].friendId = '111', 
        msg.type === 'get-conversations' && this.setData({
          conversations: msg.conversations.map(item => this.getConversationsItem(item))
        })
      }
    });
    getApp().getIMHandler().sendMsg({
      content: {
        type: 'get-conversations',
        userId: getApp().globalData.imuserInfo.userId
      },
      success: () => {
      },
      fail: (res) => {
      }
    });
  },
  wode() {
    wx.redirectTo({
      url: '/pages/pics/pics',
    })
  },
  xiaoxi() {
    wx.redirectTo({
      url: '/pages/store/store',
    })
  },
  shouye() {
    wx.redirectTo({
      url: '/pages/booszy/booszy',
    })
  },
  saoma: function() {
    var that = this;
    var nowDate = util.getNowDate();
    wx.scanCode({
      success(res) {
        if (res.path != undefined) {
          var list = res.path.split('=')
          http.request({
            url: '/getQuserCouponData',
            data: {
              id: list[1],
              qdelete: 1
            },
            success: function(e) {
              if (e.length != 0) {
                if (e[0].qstoreId != wx.getStorageSync('shop').id) {
                  wx.showModal({
                    title: '系统提示',
                    content: '该卷不属于本店',
                    success(res) {
                      if (res.confirm) {

                      }
                    }
                  })

                } else if (e[0].qstatus == 2) {
                  wx.showModal({
                    title: '系统提示',
                    content: '该代金券已核销',
                    success(res) {
                      if (res.confirm) {

                      }
                    }
                  })
                } else {
                  http.request({
                    url: '/updateQuserCoupon',
                    data: {
                      id: e[0].id,
                      qtime: nowDate,
                      qstatus: 2 //核销状态
                    },
                    success: function(e) {
                      wx.showModal({
                        title: '系统提示',
                        content: '代金券核销成功',
                        success(res) {
                          if (res.confirm) {

                          }
                        }
                      })
                    }
                  });
                }
              } else {
                wx.showModal({
                  title: '系统提示',
                  content: '优惠券不存在',
                  success(res) {
                    if (res.confirm) {

                    }
                  }
                })
              }
            }
          });
        } else {
          wx.showModal({
            title: '系统提示',
            content: '优惠券不存在',
            success(res) {
              if (res.confirm) {

              }
            }
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },
  getConversationsItem(item) {
    let {
      latestMsg,
      ...msg
    } = item;
    return Object.assign(msg, JSON.parse(latestMsg));
  },
  tosel: function(e) {
    this.setData({
      sel: e.currentTarget.dataset.sel
    })
    if (e.currentTarget.dataset.sel == 4) {
      this.drawRadar();
    }
    // else if (e.currentTarget.dataset.sel == 2) {
    //   wx.navigateTo({
    //     url: '/pages/im/chat-list/chat-list',
    //   })
    // }

  },
  reDraw: function() {
    this.drawRadar();
  }
})
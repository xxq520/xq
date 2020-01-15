// pages/shangpgl/shangpgl.js
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    luntan: 1,
   // procedure: [],
    procedureType: [],
    imghost: constant.imghost,
    height: app.systemInfo.windowHeight,
    load:true,
    page:0,
    dataInfo:false,
    nowPage:true,
    options:'',
    isLodinged:false,
    num:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      options:options,
    })
    this.upDate(options)
  },
  upDate(options){
    var that=this
    if (options.shopid != undefined) {
      that.setData({
        nowPage:false
      })
      http.request({
        url: '/getQprocedure',
        data: {
          storeId: options.shopid,
          otherterm: ` and  state != 3 order by id desc limit 0,20 `,

        },
        success: function(e) {
          for (var i = 0; i < e.length; i++) {
            e[i].lbImgs = e[i].lbImgs.split(',')||e[i].lbImgs
            e[i].imgs = e[i].imgs.split(',')
          }
          that.setData({
            storeId:options.shopid,
            procedure: e,
            num:2,
            page:e.length,
            load:false,
            timer:that.showImg(),
            nowPage:true
          });
          that.data.timer()
        }
      })
    }
    if (options.procedureType != undefined) {
      const procedureType = JSON.parse(options.procedureType);
      this.setData({
        procedureType: procedureType
      })
    }
  },
  scrolltoupper(){
    this.data.timer()
  },
  nextDataPage: function () {
    if(!this.data.dataInfo&&this.data.nowPage){
      this.setData({
        load:true,
        nowPage:false
      })
      var that=this
      http.request({
        url: '/getQprocedure',
        data: {
          storeId: that.data.storeId,
          otherterm: ` and  state != 3 order by id desc limit ${that.data.page},20 `
        },
        success: function(e) {
          if(!e.length){
            that.setData({
              dataInfo:true
            })
          }
          for (var i = 0; i < e.length; i++) {
            e[i].lbImgs = e[i].lbImgs.split(',')||e[i].lbImgs;
            e[i].imgs = e[i].imgs.split(',')
          }

          that.setData({
            procedure:that.data.procedure.concat(e),
            page:that.data.page+20,
            load:false,
            nowPage:true
          });
        }
      },true)
    }
  },
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
          var arr=that.data.procedure;
          //计录上一次懒加载的索引，下次就可以从记录当中取出作为循环判断的条件
          ret.forEach((item, index) => {
            if (item.top <= height) {
              // 判断是否在显示范围内
              //让当前的懒加载图片显示
              arr[index].show= true
            }
          })
          that.setData({
            procedure:arr,
          })
        }).exec()
      },100)
    }
  },
  spxq(e) {
    wx.navigateTo({
      url: `/pages/shangpgl/shangpfb?procedure=true`,
      //将修改商品的数据保存至缓存中
      success:function () {
        wx.setStorageSync('changeg',e.currentTarget.dataset.procedure)
      }
    })
  },
  sptpgl(e) {
    wx.navigateTo({
      url: `/pages/shangpfl/shangpfl?procedureType= ${JSON.stringify(e.currentTarget.dataset.proceduretype)} `,
    })
  },
  luntan(e) {
    this.setData({
      luntan: e.currentTarget.dataset.luntan
    })
  },
  del(e) {
    var dataset = e.currentTarget.dataset
    var that = this
    wx.showModal({
      title: '系统提示',
      content: '确定移除该商品吗?',
      success(res) {
        if (res.confirm) {
          that.data.procedure.splice(dataset.index, 1)
        }
        http.request({
          url: '/updateQprocedure',
          data: {
            id: dataset.id,
            state: 3

          },
          success: function(e) {
            that.setData({
              procedure: that.data.procedure
            })
          }
        })
      }
    })
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
    if(this.data.num===2){
      this.upDate(this.data.options)
    }
    this.setData({
      dataInfo:false,
      isLodinged:true
    });
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
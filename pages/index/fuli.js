// pages/index/fuli.js
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
var app = getApp();
Page({
  data: {
    host: constant.imghost,
    height: app.systemInfo.windowHeight,
  },
  onLoad: function (options) {
    var that = this
    http.request({
      url: '/getQprocedure',
      data: {
        state:2,
        otherterm: 'order by id desc limit 0, 10  '
      },
      success: function (e) {
        console.log('商品信息', e)
        for (var i = 0; i < e.length; i++) {
          e[i].lbImgs = e[i].lbImgs.split(',')
          e[i].imgs = e[i].imgs.split(',')
        }
        that.setData({
          procedure: e,
        });
      }
    })
    //设置图片懒加载函数
    this.setData({
      timer:this.showImg()
    })
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
      wx.createSelectorQuery().selectAll('.img').boundingClientRect((ret) => {
        // 页面的可视高度
        let height = that.data.height  
        //懒加载图片的总数
        var arr=that.data.procedure;
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
        //如果当前的选项卡选中掌柜推荐则让掌柜推荐商品图片懒加载
        that.setData({
          procedure:arr,
          defaultNum:num
        })
      }).exec()
    },400)
  }
}
})
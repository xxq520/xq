const constant = require("./constant.js");
const storage = require("./storage.js");
const util = require("./util.js");
const app = require('../app');
//config是设置请求的配置，
//istrue是设置加载层是否显示
//that是请求数据出错时弹出的错误层还是提示文字
function request(config,isTrue,that="网络出现问题",num) {
  if(!isTrue){
    wx.showLoading({
      title: '加载中..'
    });
    if(typeof(that)=='object'){
      if(that){
        that.setData({
          empty:0
        })
      }
    }
  }
  wx.request({
    url: constant.host + config.url,
    method: 'POST',
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    data: config.data,
    //请求成功的回调函数
    success: function(response) {
      //请求的状态返回的时200表示请求的数据成功;
      if(response.data.url){
        config.success(response.data);
      }
      if (response.data.code == 200) {
        wx.hideLoading()
        if (response.data.data1 != undefined) {
          config.success&&config.success(response.data);
        } else {
          config.success&&config.success(response.data.data);
        }
        setTimeout(function() {
          //判断传递的参数是否含有this有的话就需要更改this.data中的遮罩层状态
          if(typeof(that)=='object'){
            //设置请求数据的遮罩层状态显示页面内容状态
            judgeAlert(that,2)
          }
        }, 100)
      //服务器返回的数据非200成功状态的时候执行的代码
      }else if(response.errcode===0){
        wx.hideLoading()
      } else {
        wx.hideLoading()
        setTimeout(()=>{
          //设置请求数据的遮罩层状态为加载出错状态
            //判断是否图片和文字和重新加载按钮提示
          if(typeof(that)=='object'){
            //3是代表自定义加载失败图片和提示文字
            judgeAlert(that,3)
          }
        },1000)
        if(num!=1){
          util.showFailToast({
            title: response.data.message||that
          });
        }
      }
    },
    //请求失败的回调函数
    fail: function() {

      //判断是否文字提示
      if(typeof(that)=='string'){
        util.showFailToast({
          title: that
        });
        //判断是否图片和文字和重新加载按钮提示
      }else if(typeof(that)=='object'){
        judgeAlert(that,-1)
      }
      wx.hideLoading();
      //设置请求数据的遮罩层状态为加载出错状态
      // util.showFailToast({
      //   title: '网络出现错误'
      // });
    }
  });
}
//判断传递过来的数据是组件的this对象还是字符串
//that是组件数据请求时传递的字符串或this
//type是判断是对象还是字符串
//empty是给组件设置请求数据失败时展示的时失败还是网络延迟
function judgeAlert(that,empty){
  that.setData({
    empty:empty
  })
}

function insertUserRecord(record) {
  var reqData = record;
  var my = wx.getStorageSync('user')||wx.getStorageSync('user');
  reqData.quserid = my.id;
  reqData.qopenid = my.qopenid;
  reqData.qnick = my.qnick;
  reqData.qicon = my.qicon;
  wx.request({
    url: constant.host + '/insertQuserRecord',
    method: 'POST',
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    data: reqData,
    success: function(response) {},
    fail: function() {}
  });
}
module.exports = {
  request: request,
  insertUserRecord: insertUserRecord
};
const constant = require("../../utils/constant.js");
const http = require("../../utils/http.js");
//获取应用实例  

var app = getApp();
// pages/order/downline.js
Page({
  data:{
    orderId:0,
    username:'',
    reason:'',
    remark:'',
    imgUrl:'',
    items: [
      { value: '微信转账', checked: 'true' },
      { value: '支付宝转账' },
    ],
    zfb:false
  },
  onLoad:function(options){
    this.setData({
      orderId: options.orderId,
    });
  },
  radioChange(e) {
    console.log('value值为', e.detail.value)
    this.setData({
      username:'',
      zfb:this.data.zfb?false:true
    })
  },
  submitReturnData:function(){
    var that = this;
    //数据验证
    if(!this.data.remark){
      wx.showToast({
        title: '请填写退款原因',
        image: '/images/info.png',
        duration: 2000
      });
      return;
    }

    http.request({
      url: '/updateOrder',
      data: {
        id: that.data.orderId,
        qstatus: 4,
        qnote: this.data.remark,
        qtkname: this.data.username,
        qtknum: this.data.reason
      },
      success: function (data) {
        wx.showToast({
          title: '申请成功',
          duration: 2000
        });
        wx.switchTab({
          url: '../user/user',
        })

      }
    });
   //测试代码用来提交审核退货的
  },
   username:function(e){
    this.setData({
      username: e.detail.value,
    });
     console.log('用户名', this.data.username)
  },
  reasonInput:function(e){
    this.setData({
      reason: e.detail.value,
    });
    console.log('退款账号', this.data.reason)
  },
  remarkInput:function(e){
    this.setData({
      remark: e.detail.value,
    });
    console.log('退货原因',this.data.remark)
  },
  uploadImgs:function(){

    wx.chooseImage({
      success: function(res) {
        console.log(res);
        var tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: 'http://example.weixin.qq.com/upload', //仅为示例，非真实的接口地址
          filePath: tempFilePaths[0],
          name: 'file',
          formData:{
            'user': 'test'
          },
          success: function(res){
            var data = res.data
          }
        })
      }
    });
  },
})
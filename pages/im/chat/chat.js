// pages/list/list.js
import * as chatInput from "../../modules/chat-input/chat-input";
import IMOperator from "./im-operator";
import UI from "./ui";
import MsgManager from "./msg-manager";
const storage = require("../../../utils/storage.js");
const http = require("../../../utils/http.js");
const util = require("../../../utils/util.js");
const constant = require("../../../utils/constant.js");
var chatData=[]

var app = getApp();
/*** 聊天页面*/
Page({
  /*** 页面的初始数据*/
  data: {
    id: 0,
    textMessage: '',
    chatItems: [],
    latestPlayVoicePath: '',
    isAndroid: true,
    chatStatue: 'open',
    friend: {},
    friendOnline: 1,
    fphone: '',
    furl: '/pages/index/index',
    showurl: '主页',
    imgHost:constant.imghost,
      //是否展示加载中的动画
    noneData:true
  },
  /*** 生命周期函数--监听页面加载*/
  onLoad(options) {
    var that = this;
    const friend = JSON.parse(options.friend);
    this.data.friend = JSON.parse(options.friend);
    console.log(options,'OPTIONS');
    this.initData();
    this.setData({
      shop:options.shop==="true"?true:false
    })
    wx.setNavigationBarTitle({
      title: friend.friendName || ''
    });
    that.imOperator = new IMOperator(that, that.data.friend);
    that.UI = new UI(this);
    that.msgManager = new MsgManager(that);
    if (this.data.friend.ismb == '1') {
      setTimeout(function() {
        getApp().globalData.imuserInfo.userId = that.data.friend.msgUserId;
        getApp().getIMHandler().sendMsg({
          content: {
            type: 'first',
            userId: getApp().globalData.imuserInfo.userId,
            friendId: that.data.friend.msgUserId
          },
          success: () => {
            that.imOperator.onSimulateReceiveMsg((msg) => {
              console.log('显示消息11：', msg);
              that.msgManager.showMsg({
                msg
              })
            });
          },
          fail: (res) => {
            console.log('更改用户ID列表失败', res);
          }
        });
        console.log('执行完成');
      }, 500);
    } else {
      this.imOperator.onSimulateReceiveMsg((msg) => {
        this.msgManager.showMsg({
            msg
        })
      });
      setTimeout(()=>{
          that.chanItem()
      },100)
    }
    http.request({
      url: '/online',
      data: {
        qopenid: app.globalData.userOpen.openid,
        qicon: this.data.friend.friendId
      },
      success: function(e) {
        this.data.friendOnline = e.qonline;
      }
    },true)

    if(this.data.friend.friendId.length>10){
      http.request({
        url: '/getQuser',
        data: {
          qopenid: this.data.friend.friendId
        },
        success: function (e) {
          if (e.length > 0) {
            that.data.fphone = e[0].qphone;
            that.data.furl = '/pages/index/index';
            that.setData({
              showurl: '主页'
            })
          }
        }
      })
    }else{
      http.request({
        url: '/getQbusiness',
        data: {
          id: this.data.friend.friendId
        },
        success: function (e) {
          if(e.length>0){
             that.data.fphone = e[0].tel;
             that.data.furl = '/pages/shangjzy/shangjzy?id='+e[0].id;
             that.setData({
               showurl: '商家'
             })
          }
        }
      },true)
    }
  },
  chanItem(){
      var that=this
      if(!that.data.chatItems.length){
          setTimeout(()=>{
              that.chanItem()
          },100)
          return
      }
      that.data.chatItems.forEach((item,index)=>{
           //判断是否是音频的格式内容
           //让isMy的头像变成本身的头像
           if(that.data.shop){
               console.log('头像')
               if(item.isMy){
                   item.headUrl=constant.imghost+wx.getStorageSync('shop').logo
                   var arr=item;
                   var str=`chatItems[${index}]`
                   that.setData({
                       [str]:arr
                   })
               }
           }
       })
   },
    //当上拉刷新的时候增加历史聊天数据
   addChat(e){
      console.log(e,'鼠标')
      var that=this
       var arr=chatData.splice(chatData.length-30,chatData.length);
      //当数据少于20条的时候就不显示加载中的动画
      if(arr.length<20){
          this.setData({
              noneData:false
          })
      }
      if(!arr.length)return
       that.setData({
           noneData:true
       })
       arr.forEach((item,index)=>{
           //判断是否是音频的格式内容
           if(item.content.indexOf('.mp3')!=-1){
               if(item.content.indexOf(';')!=-1){
                   //截取当前音频的播放时长
                   item.voiceDuration=item.content.split(';')[1]
                   //截取当前聊天的音频地址
                   item.content=item.content.split(';')[0];
               }
               item.type='voice'
           }
           //让isMy的头像变成本身的头像
           if(that.data.shop){
               console.log('头像')
               if(item.isMy){
                   item.headUrl=constant.imghost+wx.getStorageSync('shop').logo
               }
               var chatStr=`chatItems[${index}]`
           }else{
               if(item.isMy){
                   item.headUrl=wx.getStorageSync('user').qicon
               }
               var chatStr=`chatItems[${index}]`
           }
       })
       this.setData({
           chatItems:arr.concat(this.data.chatItems),
           noneData:false
       })
   },
  tocall: function(){
     wx.makePhoneCall({
       phoneNumber: this.data.fphone,
     })
  },
  toindex: function(){
      console.log( this.data.furl)
    if(this.data.showurl == '商家'){
      wx.navigateTo({
        url: this.data.furl,
      })
    }else{
      wx.switchTab({
        url: this.data.furl,
      })
    }
  },
  onUnload: function() {
    http.request({
      url: '/updateQuser',
      data: {
        id: this.data.id,
        qonline: 1
      }
    })
  },
  initData() {
    let that = this;
    let systemInfo = wx.getSystemInfoSync();
    chatInput.init(this, {
      systemInfo: systemInfo,
      minVoiceTime: 1,
      maxVoiceTime: 60,
      startTimeDown: 56,
      format: 'mp3', //aac/mp3
      sendButtonBgColor: 'mediumseagreen',
      sendButtonTextColor: 'white',
      extraArr: [{
        picName: 'choose_picture',
        description: '照片'
      }, {
        picName: 'take_photos',
        description: '拍摄'
      }, {
        picName: 'close_chat',
        description: '自定义功能'
      }],
    });
    that.setData({
      pageHeight: systemInfo.windowHeight,
      isAndroid: systemInfo.system.indexOf("Android") !== -1,
    });
    wx.setNavigationBarTitle({
      title: '好友'
    });
    that.textButton();
    that.extraButton();
    that.voiceButton();
  },
  textButton() {
    chatInput.setTextMessageListener((e) => {
      console.log(e,'聊天')
      let content = e.detail.value;
      this.msgManager.sendMsg({
        type: IMOperator.TextType,
        content
      });
    });
  },
  voiceButton() {
    chatInput.recordVoiceListener((res, duration) => {
      let tempFilePath = res.tempFilePath;
      this.msgManager.sendMsg({
        type: IMOperator.VoiceType,
        content: tempFilePath,
        duration
      });
    });
    chatInput.setVoiceRecordStatusListener((status) => {
      this.msgManager.stopAllVoice();
    })
  },

  //模拟上传文件，注意这里的cbOk回调函数传入的参数应该是上传文件成功时返回的文件url，这里因为模拟，我直接用的savedFilePath
  simulateUploadFile({
    savedFilePath,
    duration,
    itemIndex,
    success,
    fail
  }) {
    setTimeout(() => {
      let urlFromServerWhenUploadSuccess = savedFilePath;
      success && success(urlFromServerWhenUploadSuccess);
    }, 1000);
  },
  extraButton() {
    let that = this;
    chatInput.clickExtraListener((e) => {
      let chooseIndex = parseInt(e.currentTarget.dataset.index);
      if (chooseIndex === 2) {
        that.myFun();
        return;
      }
      wx.chooseImage({
        count: 1, // 默认9
        sizeType: ['compressed'],
        sourceType: chooseIndex === 0 ? ['album'] : ['camera'],
        success: (res) => {
          this.msgManager.sendMsg({
            type: IMOperator.ImageType,
            content: res.tempFilePaths[0]
          })
        }
      });
    });
  },
  getMyTime(timestamp) {
    let date = new Date(timestamp);
    let hours = date.getHours(), minutes = date.getMinutes();
    return `${hours >= 10 ? hours : '0' + hours}:${minutes > 10 ? minutes : '0' + minutes}`
  },
  /**
   * 自定义事件
   */
  myFun() {
    wx.showModal({
      title: '小贴士',
      content: '演示更新会话状态',
      confirmText: '确认',
      showCancel: true,
      success: (res) => {
        if (res.confirm) {
          this.msgManager.sendMsg({
            type: IMOperator.CustomType
          })
        }
      }
    })
  },
  upimg1: function () {
    var that = this;
    wx.chooseImage({
      success: function (res) {
        var tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: constant.host+'/file/onefile2', //提交信息至后台
          filePath: tempFilePaths[0],
          name: 'content', //文件对应的参数名字(key)
          formData: {
            'user': 'sgyj'
          },
          success: function (postData) {
            console.log(postData.data)
            that.setData({
              textMessage:postData.data
            })
          }
        })
      }
    })
  },
  resetInputStatus() {
    chatInput.closeExtraView();
  },
  sendMsg({
    content,
    itemIndex,
    success
  }) {
    var that=this
    ///////记信息到数据库中///////////
    const currentTimestamp = Date.now();
      var type=content.content.indexOf('.mp3')!=-1?'voice':'text';
    http.request({
      url: '/insertQimMsg',
      data: {
        userId:getApp().globalData.imuserInfo.userId,
        userIcon:that.data.shop?constant.imghost+wx.getStorageSync('shop').logo:getApp().globalData.imuserInfo.myHeadUrl,
        userName: getApp().globalData.imuserInfo.nickName,
        friendId: this.data.friend.friendId,
        friendIcon: this.data.friend.friendHeadUrl,
        friendName: this.data.friend.friendName,
        qtimestamp: currentTimestamp,
        qtime: util.getNowDate(),
        qcontent:type=='voice'?content.content+';'+content.duration:content.content,
      },
      success: function (e) {
          var arr=that.data.chatItems[that.data.chatItems.length-1];
          if(arr.isMy){
              if(that.data.shop){
                  arr.headUrl=constant.imghost+wx.getStorageSync('shop').logo
              }
              console.log(arr)
          }
          var str=`chatItems[${that.data.chatItems.length-1}]`
          that.setData({
              [str]:arr
          })
      }
    })
    this.imOperator.onSimulateSendMsg({
      content,
      success: (msg) => {
          console.log('点击发送消息',msg)
          if(that.data.shop){
              msg.headUrl=constant.imghost+wx.getStorageSync('shop').logo
          }
        this.UI.updateViewWhenSendSuccess(msg, itemIndex);
        success && success(msg);
      },
      fail: () => {
        this.UI.updateViewWhenSendFailed(itemIndex);
      }
    })
  },
  /**
   * 重发消息
   * @param e
   */
  resendMsgEvent(e) {
    const itemIndex = parseInt(e.currentTarget.dataset.resendIndex);
    const item = this.data.chatItems[itemIndex];
    this.UI.updateDataWhenStartSending(item, false, false);
    this.msgManager.resend({ ...item,
      itemIndex
    });
  },
});
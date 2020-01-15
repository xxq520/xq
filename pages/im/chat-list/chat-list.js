// pages/chat-list/chat-list.js
const constant = require("../../../utils/constant.js");
/**
 * 会话列表页面
 */
Page({

  /**
   * 页面的初始数据
   */
  data: {
    conversations: [],
    shopicon: '',
    shopname: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      shop:options.shop?true:false
    })
    if (getApp().globalData.shoplogin){
      getApp().globalData.imuserInfo.userId = wx.getStorageSync('shop').id+'';
      getApp().getIMHandler().sendMsg({
        content: {
          type: 'first',
          userId: getApp().globalData.imuserInfo.userId,
          friendId: wx.getStorageSync('shop').id+''
        }, success: () => {
          console.log('更改用户ID发送成功');
          
        },
        fail: (res) => {
          console.log('更改用户ID列表失败', res);
        }
      });
    }else{
      getApp().globalData.imuserInfo.userId = wx.getStorageSync('user').qopenid;
      getApp().getIMHandler().sendMsg({
        content: {
          type: 'first',
          userId: getApp().globalData.imuserInfo.userId,
          friendId: wx.getStorageSync('user').qopenid
        }, success: () => {
          console.log('更改用户ID发送成功');

        },
        fail: (res) => {
          console.log('更改用户ID列表失败', res);
        }
      });
    }
    getApp().getIMHandler().sendMsg({
      content: {
        type: 'get-friends',
        userId: getApp().globalData.imuserInfo.userId
      },
      success:(res)=>{
      },
      fail: (res) => {
        console.log('获取好友列表失败', res);
      }
    });
    getApp().getIMHandler().setOnReceiveMessageListener({
      listener: (msg) => {
        if (msg.type === 'get-friends') {
          //获取聊天列表的聊天对象
            console.log(msg)
          var friend=msg.friends.map(item => this.createFriendItem(item));
          var arr=[]
          for(var i=0;i<friend.length;i++){
            if(this.data.shop){
              if(friend[i].friendId.length>6&&friend[i].friendId!='undefined'){
                arr.push(friend[i])
              }
            }else{
              if(friend[i].friendHeadUrl!=wx.getStorageSync('user').qicon){
                arr.push(friend[i])
              }
            }
          }
          this.setData({
            friends:arr
          });
        }
      }
    });
  },

  toChat(e) {
    let item = e.currentTarget.dataset.item;
    delete item.latestMsg;
    delete item.unread;
    delete item.content;
    wx.navigateTo({
      url: `../chat/chat?friend=${JSON.stringify(item)}&shop=${this.data.shop}`
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */


  
  onShow() {



  },
  getConversationsItem(item) {
    let {
      latestMsg,
      ...msg
    } = item;
    return Object.assign(msg, JSON.parse(latestMsg));
  },

  createFriendItem(item) {
    return {
      friendId: item.userId,
      friendHeadUrl: item.myHeadUrl,
      friendName: item.nickName,
      qcontent: item.qcontent,
      qtime: item.qtime
    };
  },



});
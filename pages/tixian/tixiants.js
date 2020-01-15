// pages/tixian/tixiants.js
const util = require("../../utils/util.js");
Page({
    data: {
        tp: 0
    },
    onLoad: function (options) {
        console.log('页面参数', options.tp)
        this.setData({
            tp: options.tp,
            time: util.getNowDate()
        })
    },
    wancheng(e) {
        if (this.data.tp == 1) {
            wx.switchTab({
                url: '/pages/user/user',
            })
        } else {
            wx.reLaunch({
                url: '/pages/booszy/booszy',
            })
        }
    }
})
const notification = require('../../utils/notification.js');
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const Quantity = require('../../components/quantity/index');
const constant = require("../../utils/constant.js");
Page({
    data: {
        code: '',
        procedureid: ''
    },
    onUnload: function () {

    },
    onLoad: function (option) {
        console.log(option);
        this.setData({
            code: option.code,
            total: option.total,
            procedureid: option.procedureid,
            status: option.status
        });
    },
    submitPinglun: function (e) {
        console.log(e);
        var pl = {};
        pl.qnote = e.detail.value.note;
        pl.qorderCode = this.data.code;
        pl.qprocedureId = this.data.procedureid;
        pl.qsubmitter = getApp().globalData.userOpen.openid;
        pl.qsubmitterIcon = getApp().globalData.userInfo.avatarUrl;
        pl.qsubmitterName = getApp().globalData.userInfo.nickName;
        http.request({
            url: '/savePinglun',
            data: pl,
            success: function (data) {
                wx.switchTab({
                    url: '/view/index/index'
                })
            },
            fail: function () {
                wx.showModal({
                    content: '提交失败！',
                    success: function (res) {

                    }
                });
            }
        });
    },
    handleHome: function () {
        wx.switchTab({
            url: '/view/index/index'
        })
    },
    handleOrder: function () {
        wx.redirectTo({
            url: '/view/order/index'
        });
    }
});

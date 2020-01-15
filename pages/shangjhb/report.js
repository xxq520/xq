const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
//const Quantity = require('../../component/quantity/index');
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
var app = getApp()

Page({

    data: {
        colorobj: {},
        information: {}
    },

    onLoad: function (e) {
        console.log('页面参数', e.information)
        if (e.information != undefined) {
            const information = JSON.parse(e.information);
            this.setData({
                information: information
            })

        }
    },
    changeColor: function (e) {
        var colorobj2 = this.data.colorobj;
        var index = e.currentTarget.dataset.items;
        var info = e.currentTarget.dataset.info;
        if (colorobj2[index]) {
            colorobj2[index] = null;
        } else {
            colorobj2[index] = info
        }
        this.setData({
            colorobj: colorobj2,
        })
    },
    report: function (e) {
        var that = this;
        var arr = [];
        for (var i in this.data.colorobj) {
            if (this.data.colorobj.hasOwnProperty(i)) {
                if (this.data.colorobj[i] != null && this.data.colorobj[i] != "") {
                    arr.push(this.data.colorobj[i]);
                }
            }
        }
        var arr2 = arr.concat(e.detail.value.others);
        if (arr2.length > 1) {
            http.request({
                url: '/insertQfeedback',
                data: {
                    qopenid: app.globalData.userOpen.openid,
                    qwxicon: app.globalData.userInfo.avatarUrl,
                    qwxname: app.globalData.userInfo.nickName,
                    qcontent: '商家【' + that.data.information.storeName + '】发布' + arr2.join() + "信息",
                },
                success: () => {
                    wx.showToast({
                        title: '举报成功',
                        icon: 'success',
                        duration: 2000
                    })
                    wx.navigateBack({
                        delta: 1
                    })
                }
            })
        } else {
            wx.showToast({
                title: '请说明举报原因',
                icon: "none"
            })
        }
    },
})
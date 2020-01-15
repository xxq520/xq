// pages/shangpgl/shangpgl.js
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
var app = getApp();

Page({

    /*** 页面的初始数据*/
    data: {
        invest: []
    },
    /*** 生命周期函数--监听页面加载*/
    onLoad: function (options) {
        var that = this
        http.request({
            url: '/getQinvest',
            data: {
                qbusinessid: wx.getStorageSync('shop').id,
            },
            success: function (data) {
                that.setData({
                    invest: data
                })
            }
        })
    },
    /*** 广告详情*/
    ggxq(e) {
        console.log('广告详情', e.currentTarget.dataset.ggxq)
        wx.navigateTo({
            url: `/pages/ggtf/ggxx?ggxq= ${JSON.stringify(e.currentTarget.dataset.ggxq)} `,
        })
    },
    /*** 生命周期函数--监听页面初次渲染完成*/
})
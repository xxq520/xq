const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
var app = getApp()
Page({
    data: {
        host: constant.imghost,
        scty: 1,
        business: [],
        information: [],
        product: [],
        anliData: [],
    },
    onLoad: function (options) {
    },
    onShow: function () {
        // 页面显示
        var that = this;
        this.loadProductData();
    },
    removeFavorites: function (e) {
        var that = this;
        var qscid = e.currentTarget.dataset.qscid;
        var qtype = e.currentTarget.dataset.qtype;
        wx.showModal({
            title: '提示',
            content: '你确认移除吗',
            success: function (res) {
                res.confirm && http.request({
                    url: '/updateQcollect',
                    data: {
                        id: qscid,
                        qdelete: 2
                    },
                    success: function (e) {
                        that.loadProductData();
                    },
                })
            }
        });
    },
    loadProductData: function () {
        var that = this;
        http.request({
            url: '/getQcollectData',
            data: {
                qopenid: app.globalData.userOpen.openid,
                qstatus: 1,
                qdelete: 1,
                orderstr: 'order by id desc'
            },
            success: function (e) {
                console.log('信息详情', e)
                for (var i = 0; i < e.length; i++) {
                    if (e[i].procedure) {
                        var arr = []
                        for (var j = 0; j < e[i].procedure.lbImgs.split(',').length; j++) {
                            arr.push(e[i].procedure.lbImgs[j])
                        }
                        e[i].procedure.lbImgs = e[i].procedure.lbImgs.split(',') ? e[i].procedure.lbImgs.split(',')[0] : e[i].procedure.lbImgs
                    }
                }
                that.setData({
                    collectData: e
                })
            },
        })
    },
    djq: function (e) {
        this.setData({
            scty: e.currentTarget.dataset.djq
        })
    },
    dpxq(e) {
        let id = e.currentTarget.dataset.shopid
        wx.navigateTo({
            url: '/pages/shangjzy/shangjzy?id=' + id,
        })
    },
    spxq(e) {
        let id = e.currentTarget.dataset.id
        let shopid = e.currentTarget.dataset.storeid
        console.log(e, 'jhhhh')
        // return
        http.request({
            url: '/getQbusiness',
            data: {
                id: shopid,
                state: 2
            },
            success: function (e) {
                if (e.length != 0) {
                    wx.navigateTo({
                        url: '/pages/goods/goods?id=' + id + '&qshopid=' + shopid,
                    })
                } else {
                    util.showFailToast({
                        title: '店铺已失效'
                    });
                }
            }
        });

    },
    wzxq(e) {
        let id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: '/pages/shangjhb/shangjhb?id=' + id,
        })
    },
});
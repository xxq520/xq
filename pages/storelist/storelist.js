const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
//const Quantity = require('../../component/quantity/index');
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
var app = getApp();
Page({
    data: {
        host: constant.imghost,
        selectedNav: '00',
        width: app.systemInfo.windowWidth,
        showspinner: false,
        goodsList: [{
            actEndTime: '2018-12-14 18:00:00.0'
        }],
        actEndTime: [],
        luntan: 1,
        sptype: 0,
        business: [],
        paixu: ['网红店铺', '人气最多', '最新入驻', '最低消费'],
        array: [],
        sousuo: false
    },
    onLoad: function (e) {
        var that = this;
        console.log('跳转参数', e)
        wx.setNavigationBarTitle({
            title: e.name
        })
        if (e.typeid == 999) {
            that.setData({
                sousuo: true
            })
        } else {
            //商户列表
            http.request({
                url: '/getQbusiness',
                data: {
                    storetypeId: e.typeid,
                    state: 2,
                    coordinates: wx.getStorageSync('latitude') + ',' + wx.getStorageSync('longitude'),
                    orderstr: 'limit 0,20' // 'limit ' + that.data.page * that.data.limit + ',' + that.data.limit
                },
                success: function (e) {
                    console.log('商户信息', e)
                    that.setData({
                        business: e,
                    });
                }
            })
            //菜单栏
            http.request({
                url: '/getQbusinessType',
                data: {},
                success: function (e) {
                    console.log('菜单', e.data)
                    for (var i = 0; i < e.data.length; i++) {
                        that.data.array.push(e.data[i].typeName)
                    }
                    that.setData({
                        array: that.data.array, search
                    })
                }
            })
        }
    },
    search(e) {
        console.log('搜索', e.detail.value)
        var that = this
        //搜索数据的加密
        var a = e.detail.value
        http.request({
            url: '/getBusinessByStoreName',
            data: {
                longitude: wx.getStorageSync('latitude'),
                latitude: wx.getStorageSync('longitude'),
                name: a.trim()
            },
            success: function (e) {
                console.log('商户信息', e)
                that.setData({
                    business: e,
                });
            }
        })
    }
})
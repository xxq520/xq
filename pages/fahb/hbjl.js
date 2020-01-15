// pages/fahb/hbjl.js
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
var app = getApp();
Page({
    /*** 页面的初始数据*/
    data: {
        dphongbao: [],
        xxhongbao: []
    },
    /*** 生命周期函数--监听页面加载*/
    onLoad: function (options) {
        var that = this
        http.request({
            url: '/getQhongbao',
            data: {
                qid: wx.getStorageSync('shop').id,
                qstatus: 1,
                qtype: 1
            },
            success: function (e) {
                //判断是否是否有店铺红包
                e.forEach(item => {
                    http.request({
                        url: '/getQhbdetails',
                        data: {
                            tzId: item.id,
                            qtype: 1,
                            orderstr: 'order by time desc'
                        },
                        success: function (data) {
                            item.qstatus = data.length
                            if (e[0] && (e[0].qstatus - e[0].qnum) === 0) {
                                //判断发送红包的数量是否和被领取数据的长度是否一致
                                http.request({
                                    url: '/updateQhongbaoD',
                                    data: {
                                        id: e[0].id,
                                        qstatus: 2,
                                    },
                                    success() {
                                        that.onLoad()
                                    }
                                })
                            } else {
                                that.setData({
                                    dphongbao: e
                                })
                            }
                        }

                    })
                })
            }
        })
        // http.request({
        //     url: '/getQinformation',
        //     data: {
        //         storeId: wx.getStorageSync('shop').id,
        //         state: 2,
        //         hbType: 1
        //     },
        //     success: function (e) {
        //         e.forEach(item => {
        //             http.request({
        //                 url: '/getQhbdetails',
        //                 data: {
        //                     tzId: item.id,
        //                     qtype: 2,
        //                     orderstr: 'order by time desc'
        //                 },
        //                 success: function (data) {
        //                     item.qstatus = data.length
        //                     that.setData({
        //                         xxhongbao: e
        //                     })
        //                 }
        //             })
        //         })
        //     }
        // })
    },
    del(e) {
        var that = this
        var dataset = e.currentTarget.dataset
        http.request({
            url: '/getQhongbao',
            data: {
                qid: wx.getStorageSync('shop').id,
                qstatus: 1,
                qtype: 1
            },
            success: function (hbdetail) {
                //判断是否是否有店铺红包
                hbdetail.forEach(item => {
                    http.request({
                        url: '/getQhbdetails',
                        data: {
                            tzId: item.id,
                            qtype: 1,
                            orderstr: 'order by time desc'
                        },
                        success: function (data) {
                            item.qstatus = data.length
                            if (hbdetail[0] && hbdetail[0].qstatus === 0) {
                                //判断发送红包的数量是否和被领取数据的长度是否一致
                                // return
                                wx.showToast({
                                    title: '一个都未领取',
                                    image: '/images/search_no.png',
                                    duration: 2000
                                })
                                http.request({
                                    url: '/updateQhongbaoD',
                                    data: {
                                        id: hbdetail[0].id,
                                        qstatus: 4,
                                    },
                                    success() {
                                        that.onLoad()
                                        that.setData({
                                            dphongbao: []
                                        })
                                    }
                                })
                            } else {
                                wx.showModal({
                                    title: '系统提示',
                                    content: '红包未被领取完',
                                    success(res) {
                                    }
                                })
                            }
                        }
                    })
                })
            }
        })
    },
    dele(e) {
        var that = this
        var dataset = e.currentTarget.dataset
        wx.showModal({
            title: '系统提示',
            content: '当前会一同删除信息内容',
            success(res) {
                if (res.confirm) {
                    http.request({
                        url: '/updateQinformation',
                        data: {
                            id: e.currentTarget.dataset.id,
                            state: 3
                        },
                        success: function (e) {
                            that.data.xxhongbao.splice(dataset.index, 1)
                            that.setData({
                                xxhongbao: that.data.xxhongbao
                            })
                        }
                    })
                }
            }
        })
    }
})
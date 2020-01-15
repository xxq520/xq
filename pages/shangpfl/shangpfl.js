// pages/shangpgl/shangpfb.js
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        tpname: '',
        procedureType: [],
        tc: false,

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log('页面参数', options)
        var that = this
        //获取商品分类的数据
        http.request({
            url: '/getQprocedureType',
            data: {
                //获取微信缓存当中的数据
                qshopid: wx.getStorageSync('shop').id,
                qdelete: 1
            },
            success(data) {
                that.setData({
                    procedureType: data
                })
            }
        })
        console.log('页面参数', this.data.procedureType)
    },
    /**
     * 显示弹窗  添加规格/颜色
     */
    tj(e) {
        this.setData({
            tc: true
        })
    },
    /**
     * 关闭弹窗
     */
    gbtc(e) {
        this.setData({
            tc: false
        })
    },
    /**
     * 输入框
     */
    tpname(e) {
        console.log('输入信息', e.detail.value)
        this.setData({
            tpname: e.detail.value
        })
    },

    /**
     * 确认添加
     */
    qrtj(e) {
        var that = this
        console.log('参数信息', e.currentTarget.dataset)
        let tpname = that.data.tpname
        if (tpname == '') {
            wx.showToast({
                title: '类别未填写',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        http.request({
            url: '/insertQprocedureType',
            data: {
                qshopid: wx.getStorageSync('shop').id,
                qcaption: tpname,
                qposition: 1
            },
            success: function (e) {
                http.request({
                    url: '/getQprocedureType',
                    data: {
                        qshopid: wx.getStorageSync('shop').id,
                        qdelete: 1
                    },
                    success: function (e) {
                        console.log('商品分类信息', e)
                        that.setData({
                            procedureType: e,
                            tc: false
                        });
                    }
                })

            }
        })
    },

    /**
     * 显示弹窗  添加规格/颜色
     */
    sc(e) {
        console.log('删除类别', e.currentTarget.dataset.id)
        let id = e.currentTarget.dataset.id
        var that = this
        http.request({
            url: '/getQprocedure',
            data: {
                specId: id,
            },
            success: function (e) {
                if (e.length != 0) {
                    wx.showToast({
                        title: '类别已有商品',
                        image: '/images/search_no.png',
                        duration: 2000
                    })
                    return
                } else {
                    http.request({
                        url: '/updateQprocedureType',
                        data: {
                            id: id,
                            qdelete: 2
                        },
                        success: function (e) {
                            http.request({
                                url: '/getQprocedureType',
                                data: {
                                    qshopid: wx.getStorageSync('shop').id,
                                    qdelete: 1
                                },
                                success: function (e) {
                                    console.log('商品分类信息', e)
                                    that.setData({
                                        procedureType: e,
                                        tc: false
                                    });
                                }
                            })
                        }
                    });
                }
            }
        });
    },
    update(e) {
        console.log('修改类别名称', e)
        let id = e.currentTarget.dataset.id
        var that = this
        if (!e.detail.value) {
            wx.showToast({
                title: '类别未填写',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        } else {
            http.request({
                url: '/updateQprocedureType',
                data: {
                    id: id,
                    qcaption: e.detail.value,
                },
                success: function (e) {
                    wx.showToast({
                        title: '修改成功',

                        duration: 2000
                    })
                }
            });
        }
    }
})
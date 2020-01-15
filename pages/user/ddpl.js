// pages/user/yjfk.js
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
var app = getApp();
var istRrue = true
Page({
    data: {
        yijianinfo: {},
        orderid: 0,
        qshopid: 0,
        pf: 1,
        arr: '',
        host: constant.imghost
    },
    onLoad: function (options) {
        console.log('页面参数', options);
        //判断是否是多件商品的评论
        if (options.id.indexOf(',') != -1) {
            //转换传递过来的数据
            if (options.shuju) {
                var arr = options.id.split(',');
                var order = JSON.parse(options.shuju);
                for (var i = 0; i < order.length; i++) {
                    order[i].pf = 0
                }
                this.setData({
                    arr: arr,
                    shuju: order
                })
            }
        }
        this.data.orderid = options.id;
        this.data.qshopid = options.qshopid;
    },
    pinglun(e) {
        console.log('评论', e)
        if (this.data.shuju) {
            //获取当前的评论的订单的数据
            var shuju = this.data.shuju;
            shuju[e.currentTarget.dataset.num].content = e.detail.value;
            //将当前评论的订单的评论内容添加至data
            this.setData({
                shuju: shuju
            })
        } else {
            this.data.yijianinfo.yijian = e.detail.value
        }
    },
    pinfen: function (e) {
        //判断当前的评论的订单是单个还是多个订单
        if (this.data.shuju) {
            var shuju = this.data.shuju
            shuju[e.currentTarget.dataset.num].pf = e.currentTarget.dataset.index
            this.setData({
                shuju: shuju
            })
        } else {
            this.setData({
                pf: e.currentTarget.dataset.index
            })
        }
        console.log(e);
        this.setData({
            pf: e.currentTarget.dataset.index
        })
    },
    tijiao(e) {
        if (!istRrue) {
            return;
        }
        var that = this;
        //判断如果是多件订单还是单件订单
        if (this.data.shuju) {
            //获取当前评论的订单的数据
            var shuju = this.data.shuju;
            console.log('多件')
            for (var i = 0; i < shuju.length; i++) {
                if (!shuju[i].pf != '') {
                    wx.showToast({
                        title: '评分未选择',
                        image: '/images/search_no.png',
                        duration: 2000
                    })
                    return;
                }
            }
            for (var i = 0; i < shuju.length; i++) {
                if (!shuju[i].content) {
                    wx.showToast({
                        title: '评论内容未填写',
                        image: '/images/search_no.png',
                        duration: 2000
                    })
                    return;
                }
                if (util.expression.test(shuju[i].content)) {
                    wx.showToast({
                        title: '内容包含非法字符',
                        image: '/images/search_no.png',
                        duration: 2000
                    })
                    return;
                }
            }

        } else {
            console.log('单件')
            if (!this.data.yijianinfo.yijian) {
                wx.showToast({
                    title: '评论内容未填写',
                    image: '/images/search_no.png',
                    duration: 2000
                })
                return
            }
            if (util.expression.test(this.data.yijianinfo.yijian)) {
                wx.showToast({
                    title: '内容包含非法字符',
                    image: '/images/search_no.png',
                    duration: 2000
                })
                return
            }
            var that = this
            if (!this.data.pf) {
                wx.showToast({
                    title: '评分未选择',
                    image: '/images/search_no.png',
                    duration: 2000
                })
                return
            }
        }
        istRrue = false
        //如果是多件商品评论的话
        if (that.data.shuju) {
            function alertSuccess() {
                wx.showToast({
                    title: '评论成功',
                    icon: 'success',
                    duration: 2000
                })
                setTimeout(function () {
                    wx.hideLoading()
                    wx.switchTab({
                        url: '/pages/user/user',
                    })
                }, 1000);
            }

            //获取多件商品订单的id
            var arr = that.data.shuju;
            for (let i = 0; i < arr.length; i++) {
                http.request({
                    url: '/insertQcomment',
                    data: {
                        qopenid: app.globalData.userOpen.openid,
                        qicon: app.globalData.userInfo.avatarUrl,
                        qname: app.globalData.userInfo.nickName,
                        qcontent: arr[i].content,
                        qnum: arr[i].pf,
                        qnote: 2,
                        qidd: arr[i].qprocedureId,
                        qstoreid: that.data.qshopid
                    },
                    success: function (e) {
                        alertSuccess()
                    }, fail: function () {
                        istRrue = true
                    }
                })
            }
            //如果是单件商品的情况下
        } else {
            http.request({
                url: "/getQorder",
                data: {
                    id: that.data.orderid,
                },
                success(data) {
                    http.request({
                        url: '/insertQcomment',
                        data: {
                            qopenid: app.globalData.userOpen.openid,
                            qicon: app.globalData.userInfo.avatarUrl,
                            qname: app.globalData.userInfo.nickName,
                            qcontent: that.data.yijianinfo.yijian,
                            qnum: that.data.pf,
                            qnote: 2,
                            qidd: data[0].qprocedureId,
                            qstoreid: that.data.qshopid
                        },
                        success: function (e) {
                            wx.showToast({
                                title: '评论成功',
                                icon: 'success',
                                duration: 2000
                            })
                            setTimeout(function () {
                                wx.hideLoading()
                                wx.switchTab({
                                    url: '/pages/user/user',
                                })
                            }, 1000);
                        },
                        fail: function () {
                            istRrue = true
                        }
                    })
                }
            })
        }
    },
    updatePingJia: function (e) {
        http.request({
            url: '/updateOrder',
            data: {
                id: this.data.order_id,
                qstatus: 3,
                qgroupid: this.data.pf,
                qcode: e.detail.value.qcode
            },
            success: function (data) {
                wx.navigateBack({})
            }
        })
    }
})
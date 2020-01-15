// pages/fahb/fahb.js
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
var app = getApp();
Page({
    /*** 页面的初始数据*/
    data: {
        shop: '',
        money: 0.00,
    },
    /*** 生命周期函数--监听页面加载*/
    onLoad: function (options) {
        this.setData({
            shop: wx.getStorageSync('shop'),
        })
    },
    /*** 红包个数*/
    money(e) {
        this.setData({
            money: e.detail.value
        })
    },
    /*** 发红包*/
    fahb: util.throttle(function (e) {
        var that = this
        if (that.data.money == 0) {
            wx.showToast({
                title: '充值金额未填写',
                image: '/images/search_no.png',
                duration: 2000
            })
            setTimeout(function () {
                wx.hideLoading()
            }, 2000)
            return
        }
        //判断用户输入的数据是否是金额
        if (!/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,4})))$/.test(that.data.money) || /\+|\-/g.test(that.data.money)) {
            wx.showToast({
                title: '请填写正确的充值金额',
                icon: 'none',
                duration: 2000
            })
            setTimeout(function () {
                wx.hideLoading()
            }, 2000)
            this.setData({
                money: ''
            })
            return
        }
        if (that.data.money < 10) {
            wx.showToast({
                title: '最低充值10元',
                image: '/images/search_no.png',
                duration: 2000
            })
            setTimeout(function () {
                wx.hideLoading()
            }, 2000)
            return
        }
        var order = {};
        order.qsubmitter = app.globalData.userOpen.openid
        order.qsum = that.data.money
        order.qsubmitterName = wx.getStorageSync('user').id
        order.qsubmitterIcon = 'C'
        //设置支付类型2为商家充值
        order.type = 2
        //在当前页面的data数据中获取需要充值的商户的id
        order.fkBusinessId = that.data.shop.id || ''
        function upDate(order, timer, qgroupid) {
            var nowDate = util.getNowDate()
            if (!that.data.isfuk) {
                that.setData({
                    isfuk: true
                });
                var sum = parseInt(that.data.money) + parseInt(that.data.shop.money)
                http.request({
                    url: '/updateTopUpBalance',
                    data: {
                        id: that.data.shop.id,
                        orderId: qgroupid
                    },
                    success: function (data) {
                        http.request({
                            url: '/updateQhongbao',
                            data: {
                                qtype: 6,
                                qid: that.data.shop.id,
                                qstore: that.data.shop.storeName,
                                qicon: that.data.shop.logo,
                                qsum: that.data.money,
                                qstatus: 2,
                                qnum: 1,
                                qnumber: qgroupid
                            }
                        });
                        wx.showToast({
                            title: '充值成功',
                            icon: 'success',
                            duration: 2000
                        })
                        setTimeout(function () {
                            wx.reLaunch({
                                url: '/pages/booszy/booszy',
                            })
                            wx.hideLoading()
                        }, 2000)
                    }
                })
            }
        }
        http.request({
            url: '/prepayTo',
            data: order,
            success: function (data) {
                //获取订单的支付id
                var qgroupid = data.qgroupid
                wx.requestPayment({
                    timeStamp: data.timeStamp,
                    nonceStr: data.nonceStr,
                    package: data.package,
                    signType: data.signType,
                    paySign: data.paySign,
                    success: function (response) {
                        console.log(response);
                        if (response.errMsg == "requestPayment:ok") {
                            //如果用户点击支付完成后的完成按钮时执行
                            wx.showToast({
                                title: '充值成功',
                                icon: 'success',
                                duration: 2000
                            })
                            setTimeout(function () {
                                wx.reLaunch({
                                    url: '/pages/booszy/booszy',
                                })
                                wx.hideLoading()
                            })
                        } else {
                            util.showFailToast({
                                title: '支付失败！'
                            });
                            return;
                        }
                    },
                    fail: function (response) {
                        util.showFailToast({
                            title: '取消支付！'
                        });
                    }
                })
            }
        })
    }, 2000)
})
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
        money: '',
        num: '',
        fhb: false
    },
    /*** 生命周期函数--监听页面加载*/
    onLoad: function (options) {
        this.shuju()
        this.setData({
            shop: wx.getStorageSync('shop'),
        })
    },
    shuju(e) {
        var that = this
        http.request({
            url: '/getQhongbao',
            data: {
                qid: wx.getStorageSync('shop').id,
                qstatus: 1,
                qtype: 1
            },
            success: function (e) {
                //判断商户的红包是否被领取完领取完就自动删除红包
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
                                        that.shuju()
                                    }
                                })
                            } else {
                                that.setData({})
                            }
                        }
                    })
                })
                if (e.length != 0) {
                    that.setData({
                        fhb: false
                    })

                } else {
                    that.setData({
                        fhb: true
                    })
                }
            }
        })
    },
    /*** 红包金额 */
    num(e) {
        this.setData({
            num: e.detail.value
        })
    },
    /*** 红包个数 */
    money(e) {
        this.setData({
            money: e.detail.value
        })
    },
    /***发红包 */
    fahb: util.throttle(function (e) {
        var that = this
        if (that.data.fhb) {
            if (that.data.money == 0) {
                wx.showToast({
                    title: '红包金额未填写',
                    image: '/images/search_no.png',
                    duration: 2000
                })
                setTimeout(function () {
                    wx.hideLoading()
                }, 2000)
                return
            }
            //判断用户输入的红包总金额是否符合规则
            if (!/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,4})))$/.test(that.data.money)) {
                wx.showToast({
                    title: '请填写正确的金额',
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
            if (that.data.num == 0 || that.data.num == '') {
                wx.showToast({
                    title: '红包个数未填写',
                    image: '/images/search_no.png',
                    duration: 2000
                })
                setTimeout(function () {
                    wx.hideLoading()
                }, 2000)
                return
            }
            //判断输入的红包个数是否符合规则
            if (!/^[0-9]+$/.test(that.data.num)) {
                wx.showToast({
                    title: '请填写正确红包个数',
                    icon: 'none',
                    duration: 2000
                })
                setTimeout(function () {
                    wx.hideLoading()
                }, 2000)
                this.setData({
                    num: ''
                })
                return
            }
            //判断单个红包是否低于0.01
            if ((that.data.money / that.data.num) < 0.01) {
                wx.showToast({
                    title: '单个红包不能低于0.01',
                    icon: 'none',
                    duration: 2000
                })
                setTimeout(function () {
                    wx.hideLoading()
                }, 2000)
                this.setData({
                    num: '',
                    money: ''
                })
                return
            }
            if (that.data.shop.money < that.data.money) {
                wx.showToast({
                    title: '店铺余额不足',
                    image: '/images/search_no.png',
                    duration: 2000
                })
                setTimeout(function () {
                    wx.hideLoading()
                    wx.navigateTo({
                        url: '/pages/chongzhi/chongzhi',
                    })
                }, 2000)
                return
            }
            if (that.data.money / that.data.num < 0.01) {
                this.setData({
                    num: that.data.money * 100
                })
                wx.showToast({
                    title: '最多发' + that.data.money * 100 + '个',
                    image: '/images/search_no.png',
                    duration: 2000
                })
                setTimeout(function () {
                    wx.hideLoading()
                }, 2000)
                return
            }
            http.request({
                url: '/insertQhongbao',
                data: {
                    qtype: 1,
                    qstatus: 1,
                    qid: that.data.shop.id,
                    qstore: that.data.shop.storeName,
                    qicon: that.data.shop.logo,
                    qsum: that.data.money,
                    qnum: that.data.num,
                },
                success: function (e) {
                    wx.showToast({
                        title: '发放成功',
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
        } else {
            wx.showToast({
                title: '已有店铺红包',
                image: '/images/search_no.png',
                duration: 2000
            })
            setTimeout(function () {
                wx.hideLoading()
            }, 2000)
        }
    }, 2000),
})
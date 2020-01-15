const notification = require('../../utils/notification.js');
const constant = require("../../utils/constant.js");
const http = require("../../utils/http.js");
Page({
    data: {
        color: constant.color,
        is_select: false,
        delivery_list: [],
        city: "",
        district: ""
    },
    // 定位
    dw: function () {
        wx.navigateTo({
            url: '../index/location',
        })
    },
    // 定位结束
    onUnload: function () {
        notification.remove('notification_delivery_index_load', this);
    },
    onLoad: function (option) {
        //加载页面位置数据
        var city = wx.getStorageSync("city");
        var district = wx.getStorageSync("district");
        this.setData({
            city,
            district
        })
        //结束
        notification.on('notification_delivery_index_load', this, function (data) {
            this.handleLoad();
        });
        var is_select = false;
        var isNum = 1
        if (typeof (option.is_select) != 'undefined') {
            is_select = option.is_select;
            isNum:1
        }
        this.setData({
            is_select: is_select,
            isNum: isNum
        });
        this.handleLoad();
    },
    moren(e) {
        console.log('页面参数', e.currentTarget.dataset.id)
        var that = this
        http.request({
            url: '/updateQaddress',
            data: {
                id: e.currentTarget.dataset.id,
                qopenId: getApp().globalData.userOpen.openid,
                qdefault: 1
            },
            success: function (data) {
                that.handleLoad()
            }
        });
    },
    del(e) {
        console.log('页面参数', e.currentTarget.dataset.id)
        var that = this
        http.request({
            url: '/deleteQaddress',
            data: {
                id: e.currentTarget.dataset.id,
                //qopenId: app.globalData.userOpen.openid,
                // qdefault: 1
            },
            success: function (data) {
                that.handleLoad()
            }
        });

    },
    modify: function (e) {
        wx.navigateTo({
            url: '/pages/delivery/detail?delivery_id=' + e.currentTarget.dataset.id
        })
    },
    handleLoad: function () {
        http.request({
            url: '/getQaddress',
            data: {
                qopenId: getApp().globalData.userOpen.openid
            },
            success: function (data) {
                console.log(data, "获取的用户收货地址")
                this.setData({
                    delivery_list: data
                });
            }.bind(this)
        });
    },
    changeNum() {
        this.setData({
            isNum: 2
        });
        wx.navigateTo({
            url: '/pages/delivery/detail'
        })
    },
    handleClick: function (event) {
        var luj = getCurrentPages()
        //获取当前的页面栈，用来判断是否是购买商品中跳转过来的
        var back = false;
        if (luj[2] && luj[2].route == 'pages/order/check') {
            back = true;
        }
        console.log(event);
        var delivery_id = event.currentTarget.id;
        var delivery = {};
        var delivery_list = this.data.delivery_list;
        console.log(delivery_list);
        var that = this

        function getD() {
            for (var i = 0; i < delivery_list.length; i++) {
                if (delivery_list[i].id == delivery_id) {
                    delivery_list[i].is_select = true;
                    delivery = delivery_list[i];
                    break;
                }
            }
            notification.emit('notification_order_check_delivery', delivery);
            that.setData({
                delivery_list: delivery_list
            });
            //p判断是否是新增地址中跳转过来的
            if (that.data.isNum == 1) {
                setTimeout(function () {
                    console.log('1')
                    wx.navigateBack();
                }, 500);
            } else if (that.data.isNum == 2) {
                setTimeout(function () {
                    console.log('2')
                    wx.navigateBack({delta: 1});
                }, 500);
            }
        }
        if (this.data.is_select) {
            getD()
        } else if (that.data.isNum == 2) {
            getD()
        } else {
            wx.navigateTo({
                url: '../delivery/detail?delivery_id=' + delivery_id
            });
        }
    }
});
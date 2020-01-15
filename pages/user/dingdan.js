// pages/user/dingdan.js
const constant = require("../../utils/constant.js");
const http = require("../../utils/http.js");
const util = require("../../utils/util.js");
const qcreateTime = require("../../utils/time.js");
//获取应用实例
var app = getApp();
var ordered = []
Page({
    data: {
        host: constant.imghost,
        modalHidden: true,
        winWidth: 0,
        winHeight: 0,
        // tab切换
        currentTab: 0,
        page: 0,
        refundpage: 0,
        orderList0: [],
        shouhuo: false,
        orderList1: [],
        orderList2: [],
        orderList3: [],
        orderList4: [],
        arr: [],
        dd0: false,
        dd1: false,
        dd2: false,
        dd3: false,
        dd4: false,
        order_state: ["", "待付款", "待发货", "待收货", '已完成'],
        ordered: []
    },
    onLoad: function (options) {
        var that = this;
        this.initSystemInfo();
        this.data.currentTab = parseInt(options.currentTab);
        var ar = `arr[${options.currentTab}]`
        this.setData({
            currentTab: parseInt(options.currentTab),
            [ar]: options.currentTab
        });
    },
    //点击跳转至购物车页面
    goCart: function () {
        wx.navigateTo({
            url: "pages/shopcart/shopcart"
        })
    },
    onShow: function () {
        this.shuju();
    },
    //点击进入商品详情页面
    spxq: function (e) {
        var arr = e.currentTarget.dataset.id
        if (arr[0]) {
            var newarr = []
            for (var i = 0; i < arr.length; i++) {
                newarr.push(arr[i].id)
            }
            wx.navigateTo({
                url: '/pages/order/check?id=' + newarr.join(',') + "&currentTab=" + this.data.currentTab, //ddddd
            })
        } else if (e.currentTarget.dataset.xiadan) {
            wx.navigateTo({
                url: '/pages/order/check?id=' + e.currentTarget.dataset.id + '&xiadan=1',
            })
        } else {
            wx.navigateTo({
                url: '/pages/order/check?id=' + arr.id + "&currentTab=" + this.data.currentTab, //ddddd
            })
        }
    },
    makephone(e) {
        var that = this
        http.request({
            url: '/getQbusiness',
            data: {
                id: e.currentTarget.dataset.shopid
            },
            success: function (e) {

                wx.makePhoneCall({
                    phoneNumber: e[0].tel
                })
            }
        });
    },
    delCart: function (e) {
        var list = this.data.orderList1
        for (var i = 0; i < list.length; i++) {
            if (list[i].id == e.currentTarget.dataset.id) {
                list[i].show = true
                this.setData({
                    orderList1: list
                })
            }
        }
        var openid = 'test';
        if (getApp().globalData.is_management) {
            openid = '';
        } else {
            openid = getApp().globalData.userOpen.openid;
        }
        http.request({
            url: '/deleteQorder',
            data: {
                qsubmitter: openid,
                id: e.currentTarget.dataset.id
            },
            success: function (data) {
                this.shuju();
            }.bind(this)
        }, false);
    },
    shouhuo: function (e) {
        var that = this;
        //保存当前点击的收货订单列表
        var idSum = e.currentTarget.dataset.spids;
        //保存给后台发送参数
        var arr = '';
        //循环判断是否用户已确认收货
        for (var i = 0; i < that.data.ordered.length; i++) {
            //判断当前点击的确认收货的订单是否点击确认收货过
            if (idSum[0].id == that.data.ordered[i]) {
                return
            }
        }
        //在收货过的id中判断已经收货的商品是否有一件商品
        //如果收货商品列表中是没有商品的，就不用判断是否多次点击确认收货
        if (that.data.ordered[0]) {
            var isTrue = that.data.ordered.every(function (item, index) {
                //判断当前点击的确认收货的订单是否包含多个订单
                if (idSum.length > 1) {
                    //判断当前多个订单中是否在已收货列表中出现
                    // 出现则表示此订单已经点击确认收货过，防止用户二次点击
                    return idSum.every(function (itemm, indexx) {
                        return itemm.id != item
                    })
                } else {
                    //如果当前点击确认收货的订单只有一件商品的情况下
                    return item != idSum[0].id;
                }
            })
            //判断此订单是否确认收货过
            // if(isTrue){
            //如果确认收货多个商品订单的话就拼接参数发送给后台
            for (var i = 0; i < idSum.length; i++) {
                arr += idSum[i].id + ',';
                that.data.ordered.push(idSum[i].id)
            }
            that.setData({
                shouhuo: true
            });
            http.request({
                url: '/getQorder',
                data: {
                    id: idSum[0].id
                },
                success(res) {
                    if (res[0].qstatus != 4) {
                        http.request({
                            url: '/NewupdateQorder',
                            data: {
                                id: arr.slice(0, arr.length - 1),
                                status: 4,
                                groupid: idSum[0].qgroupid
                            },
                            success: function (data) {
                                wx.navigateTo({
                                    url: '/pages/user/ddpl?id=' + arr.slice(0, arr.length - 1) + '&qshopid=' + e.currentTarget.dataset.qshopid + '&shuju=' + JSON.stringify(idSum),
                                })
                            },
                            fail: function (err) {
                                for (var i = 0; i < that.data.ordered.length; i++) {
                                    if (that.data.ordered[i] == idSum[0].id) {
                                        that.data.ordered.slice(that.data.ordered[i], 1)
                                    }
                                }
                            }
                        });
                    }
                }
            })
            //如果没有确认过收货就让其确认收货
        } else {
            for (var i = 0; i < idSum.length; i++) {
                arr += idSum[i].id + ',';
                that.data.ordered.push(idSum[i].id)
            }
            that.setData({
                shouhuo: true
            });
            http.request({
                url: '/getQorder',
                data: {
                    id: idSum[0].id
                },
                success(res) {
                    if (res[0].qstatus != 4) {
                        http.request({
                            url: '/NewupdateQorder',
                            data: {
                                id: arr.slice(0, arr.length - 1),
                                status: 4,
                                groupid: idSum[0].qgroupid
                            },
                            success: function (data) {
                                wx.navigateTo({
                                    url: '/pages/user/ddpl?id=' + arr.slice(0, arr.length - 1) + '&qshopid=' + e.currentTarget.dataset.qshopid + '&shuju=' + JSON.stringify(idSum),
                                })
                            },
                            fail: function (err) {
                                for (var i = 0; i < ordered.length; i++) {
                                    if (that.data.ordered[i] == idSum[0].id) {
                                        that.data.ordered.slice(that.data.ordered[i], 1)
                                    }
                                }
                            }
                        })
                    }
                }
            })
        }
        that.setData({
            ordered: that.data.ordered
        })
    },
    qxtk: function (e) {
        http.request({
            url: '/updateOrder',
            data: {
                id: e.currentTarget.dataset.id,
                qstatus: 2
            },
            success: function (data) {
                wx.showToast({
                    title: '取消成功',
                    duration: 2000
                });
                setTimeout(function () {
                    wx.switchTab({
                        url: '../user/user',
                    })
                }, 1000)
            }
        })
    },
    wuliu: function (e) {
        var that = this;
        http.request({
            url: '/getWuliu',
            data: {
                expCode: e.currentTarget.dataset.wltype,
                expNo: e.currentTarget.dataset.wlcode,
            },
            success: function (data) {
                that.setData({
                    ddh: e.currentTarget.dataset.id,
                    wltype: data.ShipperCode == 'ZTO' ? '中通' : (data.ShipperCode == 'STO' ? '申通' : (data.ShipperCode == 'YTO' ? '圆通' : (data.ShipperCode == 'YD' ? '韵达' : (data.ShipperCode == 'YZPY' ? '邮政' : '')))),
                    wlh: e.currentTarget.dataset.wlcode,
                    wuliulist: data.Traces,
                    modalHidden: false
                });
            }
        })
    },
    modalConfirm: function () {
        this.setData({
            modalHidden: true
        })
    },
    shuju: function () {
        var that = this;
        //请求全部的订单数据
        var getQorderData = {
            qsubmitter: getApp().globalData.userOpen.openid,
            qstatus: that.data.currentTab
        }
        if (that.data.currentTab == 0 || that.data.currentTab == 4) {
            getQorderData.qdelete = 1
        }
        http.request({
            url: '/getQorder',
            data: getQorderData,
            success: function (e) {
                if (that.data.currentTab == 2 || that.data.currentTab == 3 || that.data.currentTab == 4 || that.data.currentTab == 1) {
                    for (var i = 0; i < e.length; i++) {
                        for (var j = 0; j < e[i].length; j++) {
                            e[i][j].qcreateTime = qcreateTime.timeStamp(e[i][j].qcreateTime)
                            var a = ''
                            if (e[i][j].qprocedureName != null) {
                                if (e[i][j].qprocedureName.indexOf('【') != -1) {
                                    a = e[i][j].qprocedureName.split("【")
                                } else {
                                    a = e[i][j].qprocedureName;
                                }
                                e[i][j].qprocedureName = a[0] || e[i][j].qprocedureName;
                                e[i][j].orderstr = a[1].split("】")[0]
                            }
                        }
                    }
                    var ar = `orderList${that.data.currentTab}`;
                    var index = `dd${that.data.currentTab}`
                    that.setData({
                        [index]: e.length ? false : true,
                        [ar]: e,
                        dd0: e.length == 0 ? true : false
                    });
                } else if (that.data.currentTab == 0) {
                    for (var i = 0; i < e.length; i++) {
                        //判断如果是单件商品的话
                        for (var j = 0; j < e.length - i - 1; j++) {   // 这里说明为什么需要-1
                            if (e[j][0].id < e[j + 1][0].id) {
                                var temp = e[j];
                                e[j] = e[j + 1];
                                e[j + 1] = temp;
                            }
                        }
                        //判断如果是单件商品的话
                    }
                    for (var i = 0; i < e.length; i++) {
                        if (e[i].id) {
                            e[i].qcreateTime = qcreateTime.timeStamp(e[i].qcreateTime);
                            var a = ''
                            if (e[i].qprocedureName != null) {
                                if (e[i].qprocedureName.indexOf('【') != -1) {
                                    a = e[i].qprocedureName.split("【")
                                } else {
                                    a = e[i].qprocedureName;
                                }
                                e[i].qprocedureName = a[0] || e[i].qprocedureName;
                                e[i].orderstr = a[1].split("】")[0]
                            }
                        } else {
                            for (var j = 0; j < e[i].length; j++) {
                                e[i][j].qcreateTime = qcreateTime.timeStamp(e[i][j].qcreateTime)
                                var a = ''
                                if (e[i][j].qprocedureName != null) {
                                    if (e[i][j].qprocedureName.indexOf('【') != -1) {
                                        a = e[i][j].qprocedureName.split("【")
                                    } else {
                                        a = e[i][j].qprocedureName;
                                    }
                                    e[i][j].qprocedureName = a[0] || e[i][j].qprocedureName;
                                    e[i][j].orderstr = a[1].split("】")[0]
                                }
                            }
                        }
                    }
                }
                var ar = `orderList${that.data.currentTab}`;
                var index = `dd${that.data.currentTab}`;
                var dd = `arr[${that.data.currentTab}]`
                that.setData({
                    [index]: e.length ? false : true,
                    [ar]: e,
                    dd0: e.length == 0 ? true : false,
                    [dd]: e.length == 0 ? false : true,
                });
            }
        });
        //请求代付款的订单数据
    },
    dpxq(e) {
        let id = e.currentTarget.dataset.id
        var that = this;
        http.request({
            url: '/getQbusiness',
            data: {
                id: id,
            },
            success: function (e) {
                if (e.length != 0) {
                    wx.navigateTo({
                        url: '/pages/shangjzy/shangjzy?id=' + id,
                    })
                } else {
                    util.showFailToast({
                        title: '店铺已失效'
                    });
                }
            }
        })
    },
    getOrderStatus: function () {
        return this.data.currentTab == 0 ? 1 : this.data.currentTab == 2 ? 2 : this.data.currentTab == 3 ? 3 : 0;
    },
    //取消订单
    removeOrder: function (e) {
        var that = this;
        var orderId = e.currentTarget.dataset.orderId;
        wx.showModal({
            title: '提示',
            content: '你确定要取消订单吗？',
            success: function (res) {
                res.confirm && http.request({
                    url: '/updateOrder',
                    data: {
                        id: orderId,
                        qdelete: 1,
                        //qsubmitter: getApp().globalData.userOpen.openid,
                        // qshopid: shopid,
                        qstatus: 1
                    },
                    success: function (data) {
                        wx.showToast({
                            title: '取消成功',
                            duration: 2000
                        });
                        setTimeout(function () {
                            wx.switchTab({
                                url: '../user/user',
                            })
                        }, 1000)
                    }
                })
            }
        })
    },

    //确认收货
    recOrder: function (e) {
        var that = this;
        var orderId = e.currentTarget.dataset.orderId;
        wx.showModal({
            title: '提示',
            content: '你确定已收到宝贝吗？',
            success: function (res) {
                res.confirm && http.request({
                    url: '/updateOrder',
                    data: {
                        id: orderId,
                        qstatus: 3
                    },
                    success: function (data) {
                        wx.showToast({
                            title: '收货成功',
                            duration: 2000
                        });
                        setTimeout(function () {
                            wx.switchTab({
                                url: '../user/user',
                            })
                        }, 1000)
                    }
                })
            }
        })
    },
    loadOrderList: function () {
        var that = this;
    },
    loadReturnOrderList: function () {
        var that = this;
    },
    initSystemInfo: function () {
        var that = this;
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    winWidth: res.windowWidth,
                    winHeight: res.windowHeight
                });
            }
        });
    },
    bindChange: function (e) {
        var that = this;
        that.setData({
            currentTab: e.detail.current
        });
    },
    swichNav: function (ev) {
        var that = this;
        //请求代付款的订单数据
        this.setData({
            dd0: false,
            dd1: false,
            dd2: false,
            dd3: false,
            dd4: false,
        })
        var getQorderData = {
            qsubmitter: getApp().globalData.userOpen.openid,
            qstatus: ev.currentTarget.dataset.current
        }
        if (ev.currentTarget.dataset.current == 0 || ev.currentTarget.dataset.current == 4) {
            getQorderData.qdelete = 1
        }
        http.request({
            url: '/getQorder',
            data: getQorderData,
            success: function (e) {
                //  判断是待发货还是待收货还是已经完成数据
                if (that.data.currentTab == 2 || that.data.currentTab == 3 || that.data.currentTab == 4 || that.data.currentTab == 1) {
                    for (var i = 0; i < e.length; i++) {
                        for (var j = 0; j < e[i].length; j++) {
                            e[i][j].qcreateTime = qcreateTime.timeStamp(e[i][j].qcreateTime)
                            var a = ''
                            if (e[i][j].qprocedureName != null) {
                                if (e[i][j].qprocedureName.indexOf('【') != -1) {
                                    a = e[i][j].qprocedureName.split("【")
                                } else {
                                    a = e[i][j].qprocedureName;
                                }
                                e[i][j].qprocedureName = a[0] || e[i][j].qprocedureName;
                                e[i][j].orderstr = a[1].split("】")[0]
                            }
                        }
                    }
                    var ar = `orderList${that.data.currentTab}`;
                    var index = `dd${that.data.currentTab}`;
                    var dd = `arr[${that.data.currentTab}]`
                    that.setData({
                        [index]: e.length ? false : true,
                        [ar]: e,
                        dd0: e.length == 0 ? true : false,
                        [dd]: e.length == 0 ? false : true,
                    });
                    //  判断是否为代付款的数据
                } else if (that.data.currentTab == 0) {
                    for (var i = 0; i < e.length; i++) {
                        //判断如果是单件商品的话
                        for (var j = 0; j < e.length - i - 1; j++) {   // 这里说明为什么需要-1
                            if (e[j][0].id < e[j + 1][0].id) {
                                var temp = e[j];
                                e[j] = e[j + 1];
                                e[j + 1] = temp;
                            }
                        }
                        //判断如果是单件商品的话
                    }
                    for (var i = 0; i < e.length; i++) {
                        if (e[i].id) {
                            e[i].qcreateTime = qcreateTime.timeStamp(e[i].qcreateTime)
                            var a = ''
                            if (e[i].qprocedureName != null) {
                                if (e[i].qprocedureName.indexOf('【') != -1) {
                                    a = e[i].qprocedureName.split("【")
                                } else {
                                    a = e[i].qprocedureName;
                                }
                                e[i].qprocedureName = a[0] || e[i].qprocedureName;
                                e[i].orderstr = a[1].split("】")[0]
                            }
                        } else {
                            for (var j = 0; j < e[i].length; j++) {
                                e[i][j].qcreateTime = qcreateTime.timeStamp(e[i][j].qcreateTime)
                                var a = ''
                                if (e[i][j].qprocedureName != null) {
                                    if (e[i][j].qprocedureName.indexOf('【') != -1) {
                                        a = e[i][j].qprocedureName.split("【")
                                    } else {
                                        a = e[i][j].qprocedureName;
                                    }
                                    e[i][j].qprocedureName = a[0] || e[i][j].qprocedureName;
                                    e[i][j].orderstr = a[1].split("】")[0]
                                }
                            }
                        }
                    }
                    var ar = `orderList${that.data.currentTab}`;
                    var index = `dd${that.data.currentTab}`;
                    var dd = `arr[${that.data.currentTab}]`
                    that.setData({
                        [index]: e.length ? false : true,
                        [ar]: e,
                        dd0: e.length == 0 ? true : false,
                        [dd]: e.length == 0 ? false : true,
                    });
                }
            }
        });
        if (that.data.currentTab === ev.currentTarget.dataset.current) {
            return false;
        } else {
            var current = ev.currentTarget.dataset.current;
            that.setData({
                currentTab: parseInt(current),
            });
            //没有数据就进行加载
            switch (that.data.currentTab) {
                case 0:
                    !that.data.orderList0.length && that.loadOrderList();
                    break;
                case 1:
                    !that.data.orderList1.length && that.loadOrderList();
                    break;
                case 2:
                    !that.data.orderList2.length && that.loadOrderList();
                    break;
                case 3:
                    !that.data.orderList3.length && that.loadOrderList();
                    break;
                case 4:
                    that.data.orderList4.length = 0;
                    that.loadReturnOrderList();
                    break;
            }
        }
    }
})
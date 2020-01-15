const notification = require('../../utils/notification.js');
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const Quantity = require('../../components/quantity/index');
const constant = require("../../utils/constant.js");
const util = require('../../utils/util.js');
const qcreateTime = require("../../utils/time.js");
var app = getApp();
var isPay = true
Page(Object.assign({}, Quantity, {
    data: {
        statusBarHeight: app.globalData.statusBarHeight,
        is_play: false,
        is_delivery: false,
        delivery: {
            delivery_name: '',
            delivery_phone: '',
            delivery_address: ''
        },
        note: '',
        status: 1,
        pinglun: '',
        product_list: [],
        order_id: '',
        procedureid: '',
        freight: 0,
        total: 0,
        is_view: 1,
        selected: 0,
        host: constant.imghost,
        yhq: null,
        xiadan: 0,
        price: 0,
        //判断是多个商品还是单个商品
        multiple: false,
        //多个商品的数据
        products: [],
        isTrue: true,
        bfb: 0,
        //给商家留言的内容，只有在订单的状态为1和7的时候才会用到此变量
        board: '',
    },
    onUnload: function () {
        notification.remove('notification_order_check_delivery', this);
        notification.remove('notification_order_check_yhq', this);
    },
    bindTimeChange: function (e) {
        this.setData({
            time: e.detail.value
        })
    },
    //当改变留言内容的时候就触发此事件
    changeBoard(e) {
        this.setData({
            board: e.detail.value
        })
    },
    onLoad: function (option) {
        console.log(option)
        //判断是多个订单还是单个订单
        if (option.id.indexOf(',') != -1) {
            var arr = option.id.split(',');
            for (var i = 0; i < arr.length; i++) {
                arr[i] = Number(arr[i])
            }
            this.setData({
                multiple: true,
                multipleid: arr
            })
            option.id = option.id.split(',')[0]
        }
        var time = util.getNowDate().substring(11, 16);
        var that = this;
        this.setData({
            time: time
        });
        //加载默认的购物收货地址
        notification.on('notification_order_check_delivery', this, function (data) {
            console.log(data, '地址')
            this.setData({
                delivery: {
                    delivery_name: data.qname,
                    delivery_phone: data.qphone,
                    delivery_address: data.qprovince + data.qcity + data.qarea + data.qaddr
                },
                is_delivery: true
            });
        });
        //加载选择的优惠卷
        notification.on('notification_order_check_yhq', this, function (data) {
            this.data.yhq = data;
            this.setData({
                yhq: data
            });
        });
        if (option.yhq) {
            this.setData({
                yhq: JSON.parse(option.yhq)
            });
        }
        if (option.id != '') {
            if (option.xiadan != undefined) {
                this.setData({
                    xiadan: option.xiadan
                })

            }
            this.data.order_id = option.id;
            this.shuju()
        } else {
            http.request({
                url: '/getQaddress',
                data: {
                    qopenId: getApp().globalData.userOpen.openid
                },
                success: function (data) {
                    var is_play = true;
                    var is_delivery = false;
                    var product_list = storage.getProduct();
                    var freight = 0;
                    var total = 0;

                    if (data.length == 0) {
                        is_play = false;
                        wx.showModal({
                            content: '您还没有收货地址，是否新建一个？',
                            success: function (res) {
                                if (res.confirm) {
                                    wx.navigateTo({
                                        url: '/view/delivery/index'
                                    });
                                } else if (res.cancel) {
                                }
                            }
                        });
                    } else {
                        is_delivery = true;
                        var delivery = {
                            delivery_name: data[0].qname,
                            delivery_phone: data[0].qphone,
                            delivery_address: data[0].qprovince + data[0].qcity + data[0].qarea + data[0].qaddr
                        }
                    }
                    for (var i = 0; i < product_list.length; i++) {
                        var product = product_list[i];
                        var product_total_price = product.product_quantity.quantity * product.product_price;
                        product.product_total_price = product_total_price.toFixed(2);
                        total += product_total_price;
                    }
                    if (!total > 0) {
                        is_play = false;
                    }
                    this.setData({
                        is_play: is_play,
                        is_delivery: is_delivery,
                        delivery: delivery,
                        product_list: product_list,
                        freight: new Number(freight).toFixed(2),
                        total: total.toFixed(2)
                    });
                }.bind(this)
            }, true);
        }
        var timer = setInterval(() => {
            that.setData({
                bfb: that.data.bfb + 4
            })
            if (that.data.bfb >= 100) {
                clearInterval(timer);
            }
        }, 10);
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
        }, true);
    },
    delCart: function (e) {
        var openid = 'test';
        if (getApp().globalData.is_management) {
            openid = '';
        } else {
            openid = getApp().globalData.userOpen.openid;
        }
        var arr = e.currentTarget.dataset.id;
        //如果是多个商品的话执行的代码
        if (arr[0]) {
            for (let i = 0; i < arr.length; i++) {
                var orderData = {
                    qsubmitter: openid,
                    id: arr[i].id
                }
                //如果是已完成订单的话就软删除订单
                if (arr[0].qstatus === 4) {
                    orderData.qdelete = 2
                }
                http.request({
                    //如果是已完成订单就实现软删除 用户中订单删除 并不会删除商家中的订单
                    url: arr[0].qstatus === 4 ? '/updateQorder' : '/deleteQorder',
                    data: orderData,
                    success: function (data) {
                        if (i == arr.length - 1) {
                            wx.navigateBack({
                                delta: 1
                            })
                        }
                    }.bind(this)
                });
            }
            //只有一个商品的时候执行的代码
        } else {
            var orderData = {
                qsubmitter: openid,
                id: e.currentTarget.dataset.id
            }
            //如果是已完成订单的话就软删除订单
            if (this.data.product.qstatus === 4) {
                orderData.qdelete = 2
            }
            http.request({
                url: this.data.product.qstatus === 4 ? '/updateQorder' : '/deleteQorder',
                data: orderData,
                success: function (data) {
                    wx.navigateBack({
                        delta: 1
                    })
                }.bind(this)
            });
        }
    },
    shuju(e) {
        var that = this;
        //判断如果是多个商品的话就请求这个接口
        if (this.data.multipleid) {
            that.data.multipleid.unshift('null')
            http.request({
                url: '/getQorder_shopping_cart',
                data: {
                    id: JSON.stringify(that.data.multipleid)
                },
                success: function (data) {
                    var arr = [];
                    for (var i = 0; i < data.length; i++) {
                        arr[i] = data[i]
                        arr[i].ordstr = data[i].qprocedureName.split('【')[1].split('】')[0]
                        arr[i].name = data[i].qprocedureName.split('【')[0]
                        arr[i].qcreateTime = qcreateTime.timeStamp(arr[i].qcreateTime)
                    }
                    that.setData({
                        products: arr,
                        bfb: 99
                    }, () => {
                        var sumP = 0;
                        for (var i = 0; i < arr.length; i++) {
                            //判断返回的数据是否有单价这个字段
                            if (arr[i].cost) {
                                sumP += arr[i].cost * arr[i].qtotal;
                                //判断是否有使用优惠卷
                                var sum = 0;
                                var sumyhj = 0;
                                for (var j = 0; j < arr.length; j++) {
                                    sum += arr[j].cost * arr[j].qtotal;
                                    sumyhj += arr[j].qsum;
                                }
                            } else {
                                sumP += arr[i].qsum
                            }
                        }
                        that.data.price = sumP;
                        // if(t){}
                        that.setData({
                            price: sumP,
                            isTrue: false
                        })
                        //判断如果是多件商品的话计算价格减去优惠卷的金额获得实际支付的金额显示
                        //获取商品详情中的订单信息
                        var newArr = arr;
                        //将多件商品的实际金额计算出来  用多件商品中第一个订单作为优惠卷的使用情况
                        if (newArr[0].qstatus == 2 || newArr[0].qstatus == 3 || newArr[0].qstatus == 4) {
                            //判断此订单是否已使用过优惠卷
                            if (newArr[0].reducityMoney) {
                                that.setData({
                                    yhq: {money: newArr[0].reducityMoney}
                                })
                            }
                        }
                    })
                }
            }, true)
        }
        http.request({
            url: '/getQorder',
            data: {
                id: this.data.order_id
            },
            success: function (data) {
                data[0].qcreateTime = qcreateTime.timeStamp(data[0].qcreateTime)
                var is_play = true;
                var is_delivery = false;
                var product_list = [];
                var freight = 0;
                var total = 0;
                var is_view = 0;
                var delivery = ''
                var is_managent = getApp().globalData.is_management;
                //如果订单没有地址的情况下
                if (!data[0].qaddress) {
                    if (app.globalData.delivery_list[0]) {
                        is_delivery = true;
                        delivery = {
                            delivery_name: app.globalData.delivery_list[0].qname,
                            delivery_phone: app.globalData.delivery_list[0].qphone,
                            delivery_address: app.globalData.delivery_list[0].qprovince + app.globalData.delivery_list[0].qcity + app.globalData.delivery_list[0].qarea + app.globalData.delivery_list[0].qaddr
                        }
                    } else {
                        delivery = {}
                    }

                } else {
                    is_delivery = true;
                    delivery = {
                        delivery_name: data[0].qusername ? data[0].qusername : app.globalData.delivery_list[0].qname,
                        delivery_phone: data[0].qphone ? data[0].qphone : app.globalData.delivery_list[0].qphone,
                        delivery_address: data[0].qaddress ? data[0].qaddress : app.globalData.delivery_list[0].qprovince + app.globalData.delivery_list[0].qcity + app.globalData.delivery_list[0].qarea + app.globalData.delivery_list[0].qaddr
                    }
                }
                that.data.delivery = delivery;
                console.log(app.globalData.delivery_list, '地址')
                if (delivery.delivery_address == '') {
                    is_delivery = false;
                }
                if (!total > 0) {
                    is_play = false;
                }
                if (((data.qstatus == 1) && (is_managent)) || ((data.qstatus == 2) && (!is_managent)) || ((data.qstatus == 3) && (is_managent)) || (data.qstatus == 4)) {
                    is_play = false;
                }
                if ((data.qstatus > 1) || (is_managent)) {
                    is_view = true;
                }
                if (!that.data.price) {
                    var sumP = 0;
                    for (var i = 0; i < that.data.products.length; i++) {
                        if (that.data.products[i].cost) {
                            sumP += that.data.products[i].cost * that.data.products[i].qtotal
                        } else {
                            sumP += that.data.products[i].qsum
                        }
                    }
                    //判断是否是多个订单支付
                    if (that.data.multiple) {
                        that.data.price = sumP
                    } else {
                        //判断是否有单价的字段
                        if (data[0].cost) {
                            that.data.price = data[0].cost;
                            //判断是否有使用优惠卷
                        } else {
                            that.data.price = data[0].qsum / data[0].qtotal;
                        }
                    }
                }
                //如果只有单件商品的情况下减去优惠卷的金额
                var newArr = data;
                //将单件商品实际金额计算出来  订单中quser_coupon_id作为优惠卷的使用情况
                if (newArr[0].qstatus == 2 || newArr[0].qstatus == 3 || newArr[0].qstatus == 4) {
                    //判断此订单是否已使用过优惠卷
                    if (newArr[0].reducityMoney) {
                        that.setData({
                            yhq: {money: newArr[0].reducityMoney}
                        })
                    }
                }
                that.data.product = data[0];
                that.setData({
                    is_delivery: true,
                    price: that.data.price,
                    delivery: delivery,
                    note: data.qnote ? data.qnote : '',
                    product: that.data.product,
                    selected: data[0].qcode || 1,
                    isTrue: false
                });
                http.request({
                    url: '/getQbusiness',
                    data: {
                        id: data[0].qshopid,
                        coordinates: wx.getStorageSync('latitude') + ',' + wx.getStorageSync('longitude'),
                    },
                    success: function (e) {
                        that.setData({
                            business: e[0]
                        })
                    }
                }, true)
            }.bind(this)
        }, true);
    },
    onReady: function () {
    },
    onShow: function () {
        var that = this;
        //只有店铺发货的时候才请求默认的收货地址
        if (that.data.selected == 1 || that.data.selected == 0) {
            wx.request({
                url: constant.host + '/getQaddress',
                data: {
                    qopenId: app.globalData.userOpen.openid,
                    qdefault: 1
                },
                success: function (data) {
                    app.globalData.delivery_list = data.data.data;
                    if (!that.data.delivery.delivery_name) {
                        that.setData({
                            delivery: {
                                delivery_name: app.globalData.delivery_list[0].qname,
                                delivery_phone: app.globalData.delivery_list[0].qphone,
                                delivery_address: app.globalData.delivery_list[0].qprovince + app.globalData.delivery_list[0].qcity + app.globalData.delivery_list[0].qarea + app.globalData.delivery_list[0].qaddr
                            }
                        })
                    }
                }
            })
        }
    },
    select1: function () {
        this.setData({
            selected: this.data.product.qstatus == 1 || this.data.product.qstatus == 7 ? 1 : this.data.product.qcode
        })
    },
    select2: function () {
        this.setData({
            selected: this.data.product.qstatus == 1 || this.data.product.qstatus == 7 ? 2 : this.data.product.qcode
        })
    },
    getnote: function (e) {
        this.data.note = e.detail.value;
    },
    //当用户支付成功的时候给用户发送一条服务通知
    //当点击店铺的时候
    godp() {
        wx.navigateTo({
            url: "/pages/shangjzy/shangjzy?id="
        })
    },
    pay(e) {
        var that = this;
        console.log(1)
        if (isPay) {
            console.log(2)
            that.handlePay(e)
        }
    },
    handlePay: function (e) {
        console.log(e)
        if ((!this.data.delivery.delivery_address) && (this.data.selected == 1)) {
            util.showFailToast({
                title: '请选择收货地址！'
            });
            return;
            isPay = true
        }
        if ((!this.data.delivery.delivery_name) && (this.data.selected == 1)) {
            util.showFailToast({
                title: '请输入收货人姓名！'
            });
            return;
            isPay = true
        }
        if ((!this.data.delivery.delivery_phone) && (this.data.selected == 1)) {
            util.showFailToast({
                title: '请输入电话！'
            });
            return;
            isPay = true
        }
        if (this.data.selected == 2 && !(e.detail.value.qphone || this.data.product.qphone)) {
            util.showFailToast({
                title: '请输入预留电话！'
            });
            return;
            isPay = true
        }
        // !util.isPhone(order.qphone)
        //请求支付接口的参数
        var order = {};
        if (this.data.selected == 2) {
            if (!util.isPhone(e.detail.value.qphone || this.data.product.qphone)) {
                util.showFailToast({
                    title: '电话格式有误！'
                })
                return;
                isPay = true
            } else {
                order.qphone = this.data.phone
            }
        }
        order.qsubmitter = getApp().globalData.userOpen.openid;
        //订单的id
        order.id = this.data.order_id;
        if (this.data.selected == 1) {
            order.qusername = this.data.delivery.delivery_name;
            order.qphone = this.data.delivery.delivery_phone;
            order.qaddress = this.data.delivery.delivery_address;
        } else {
            //当用户是到店自取的情况下就获取微信名为收货名
            order.qusername = e.detail.value.qusername || wx.getStorageSync('user').qnick.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "");
            order.qphone = e.detail.value.qphone || this.data.product.qphone
            order.qaddress = this.data.business.address;
        }
        //是店铺发货还是到店自取
        order.qcode = this.data.selected;
        //买家的说明
        order.qnote = this.data.board;
        if (util.expression.test(order.qnote)) {
            util.showFailToast({
                title: '备注包含非法字符！'
            })
            return;
            isPay = true
        }
        //数量
        var arr = []
        if (this.data.multiple) {
            var sum = 0;
            for (var i = 0; i < this.data.products.length; i++) {
                sum += this.data.products[i].qtotal;
                arr.push(this.data.products[i].id)
            }
            order.qtotal = sum
        } else {
            order.qtotal = this.data.product.qtotal;
            // order.qwuliu=order.id
            arr.push(Number(order.id))
        }
        //传递单个/多个订单号给后台
        order.qwuliu = JSON.stringify(arr);
        //更改订单
        if (this.data.status == 2) {
            order.qstatus = 3;
        } else if (this.data.status == 3) {
            order.qstatus = 4;
        }
        var that = this;
        if (that.data.status == 1) {
            //正确价格
            order.qsum = (that.data.yhq == null ? that.data.product.qsum : that.data.product.qsum - that.data.yhq.money).toFixed(2)
            if (that.data.multiple) {
                var su = that.data.product.qcode == 1 ? that.data.product.qyunfei : 0
                order.qsum = that.data.yhq == null ? (that.data.price + su).toFixed(2) : (that.data.price + su - that.data.yhq.money).toFixed(2)
            } else {
                //单个商品的价格
                if (that.data.product.cost) {
                    order.qsum = that.data.yhq == null ? (that.data.product.cost * that.data.product.qtotal).toFixed(2) : (that.data.product.cost * that.data.product.qtotal - that.data.yhq.money).toFixed(2)
                } else {
                    order.qsum = that.data.yhq == null ? (that.data.product.qsum).toFixed(2) : (that.data.product.qsum - that.data.yhq.money).toFixed(2)
                }
            }
            //如果金额出现异常出现负数
            if (order.qsum < 0) {
                util.showFailToast({
                    title: '金额有误！'
                })
                setTimeout(() => {
                    wx.switchTab({
                        url: '/pages/index/index'
                    })
                }, 2000)
                return;
            }
            order.qsubmitterName = wx.getStorageSync('user').id;
            order.qsubmitterIcon = 'D' + Date.now();
            order.quserCouponId = that.data.yhq ? that.data.yhq.id : 0;
            //设置支付类型4为商品支付
            order.type = 4
            //在当前页面的data数据中获取需要充值的商户的id
            order.fkBusinessId = that.data.business.id || ''
            console.log(order)
            if (!order.qphone) {
                util.showFailToast({
                    title: '请输入电话！'
                });
                isPay = true
                return;
            }
            if (!order.qphone.trim()) {
                util.showFailToast({
                    title: '请输入电话！'
                });
                isPay = true
                return;
            }
            if (!util.isPhone(order.qphone)) {
                util.showFailToast({
                    title: '电话格式有误！'
                })
                isPay = true
                return;
            }
            //用于查询支付的订单是否成功
            var isTrue = true
            //请求接口判断商品的库存是否充足
            var proId = []
            if (that.data.multiple) {
                for (let i = 0; i < that.data.products.length; i++) {
                    proId.push(Number(that.data.products[i].qprocedureId))
                }
            } else {
                proId.push(Number(that.data.product.qprocedureId))
            }
            isPay = false
            http.request({
                url: '/close',
                data: {
                    orderId: JSON.stringify(proId)
                },
                success: function (e) {
                    //当所有的订单都是可以下单的话就跳转至订单详情页面结算
                    prepay();
                }, fail() {
                    isPay = true
                }
            })

            function prepay() {
                wx.request({
                    url: constant.host + '/prepayTo',
                    data: order,
                    success: function (data) {
                        console.log('prepayTosuccess', data.data)
                        if (data.data.code != 200) {
                            isPay = true
                            return;
                        }
                        //获取支付所需参数
                        data = data.data.data
                        //如果是多笔订单的话执行以下的代码
                        if (that.data.multiple) {
                            //循环获取订单的列表
                            for (let i = 0; i < that.data.products.length; i++) {
                                //把每个订单的id存入集合当中
                                order.id = that.data.products[i].id;
                                //设置订单的购买数量 默认为1
                                var sum = 1;
                                sum = that.data.products[i].qtotal;
                                order.qtotal = sum;
                                //循环更改订单的数据
                                http.request({
                                    url: '/updateQorder',
                                    data: {
                                        id: that.data.products[i].id,
                                        qgroupid: data.qgroupid,
                                        qusername: order.qusername,
                                        qphone: order.qphone,
                                        qaddress: order.qaddress,
                                        qcode: order.qcode,
                                        qnote: order.qnote,
                                        qtotal: that.data.products[i].qtotal,
                                        qsum: that.data.products[i].cost ? that.data.products[i].qtotal : that.data.products[i].qsum,
                                        reducityMoney: that.data.yhq ? that.data.yhq.money : 0,
                                        qstatus: 1
                                    },
                                    success: function (data) {
                                    }
                                });
                            }
                        } else {
                            http.request({
                                url: '/updateQorder',
                                data: {
                                    id: order.id,
                                    qgroupid: data.qgroupid,
                                    qusername: order.qusername,
                                    qphone: order.qphone,
                                    qaddress: order.qaddress,
                                    qcode: order.qcode,
                                    qnote: order.qnote,
                                    qtotal: order.qtotal,
                                    qsum: order.qsum,
                                    reducityMoney: that.data.yhq ? that.data.yhq.money : 0,
                                    qstatus: 1
                                },
                                success: function (data) {
                                }
                            });
                        }
                        //如果是单笔订单的话执行的代码 首先调用支付的弹窗
                        wx.requestPayment({
                            timeStamp: data.timeStamp,
                            nonceStr: data.nonceStr,
                            package: data.package,
                            signType: data.signType,
                            paySign: data.paySign,
                            success: function (response) {
                                //如果用户支付完成点击完成按钮的时候
                                if (response.errMsg == "requestPayment:ok") {
                                    //如果是多件商品的话
                                    if (that.data.multiple) {
                                        isTrue = false
                                        var arr = that.data.multipleid.filter(function (item, index) {
                                            return item != null && item != undefined
                                        });
                                        wx.redirectTo({
                                            url: `../order/sppayok?order= ${JSON.stringify(order)}&id=${arr.join(',')}&yhq=${that.data.yhq ? JSON.stringify(that.data.yhq) : ''}&address=${that.data.business.address}`,
                                        });
                                        //如果是单件商品的情况下
                                    } else {
                                        isTrue = false
                                        wx.redirectTo({
                                            url: `../order/sppayok?order= ${JSON.stringify(order)}&yhq=${that.data.yhq ? JSON.stringify(that.data.yhq) : ''}&address=${that.data.business.address}`,
                                        });
                                        that.shuju()
                                    }
                                } else {
                                    util.showFailToast({
                                        title: '支付失败！'
                                    });
                                    isPay = true
                                    return;
                                }
                            },
                            fail: function (response) {
                                util.showFailToast({
                                    title: '取消支付！'
                                });
                                isPay = true
                                return;
                            }
                        })
                    }, fail() {
                        console.log('prepayTofail')
                        isPay = true;
                        return;
                    }
                })
            }
        }
    },

    //商品数量增加
    changeNumber(e) {
        var falg = e.currentTarget.dataset.method;
        var product = this.data.product;
        var danjia = product.qsum / product.qtotal
        if (falg == 1) {
            if (product.qtotal > 1) {
                product.qtotal--;
            }
        } else if (falg == 2) {
            product.qtotal++;
        }
        product.qsum = (danjia * product.qtotal).toFixed(2);
        this.setData({
            product,
        })
    },
    copyText() {
        var that = this;
        if (that.data.product.qgroupid != null) {
            wx.setClipboardData({
                data: that.data.product.qgroupid,
                success: () => {
                    wx.showToast({
                        title: '复制成功',
                    })
                }
            })
        }
    },
}));
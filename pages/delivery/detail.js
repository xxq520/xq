const china = require("../../utils/china.js");
const constant = require("../../utils/constant.js");
const notification = require('../../utils/notification.js');
const http = require('../../utils/http.js');
const util = require('../../utils/util.js');
const sensitive = require('../../utils/sensitive')
var app = getApp()
Page({
    data: {
        color: constant.color,
        is_edit: false,
        is_dialog: false,
        delivery_id: '',
        delivery_name: '',
        delivery_phone: '',
        province_list: [],
        delivery_province: "",
        city_list: [],
        delivery_city: "",
        area_list: [],
        delivery_area: "",
        province_city_area: [0, 0, 0],
        delivery_street: '',
        delivery_is_default: false,
        checkedId: 1,
        sex: "男士",
    },
    onLoad: function (option) {
        var is_edit = false;
        var delivery_id = '';
        var province_list = [];
        var city_list = [];
        var area_list = [];
        console.log(option);
        if (typeof (option.delivery_id) != 'undefined') {
            is_edit = true;
            delivery_id = option.delivery_id;
            this.handleFind(delivery_id);
        }
        for (var i = 0; i < china.children.length; i++) {
            province_list.push(china.children[i].name);
        }
        for (var i = 0; i < china.children[0].children.length; i++) {
            city_list.push(china.children[0].children[i].name);
        }
        for (var i = 0; i < china.children[0].children[0].children.length; i++) {
            area_list.push(china.children[0].children[0].children[i].name);
        }
        //判断是否是购买商品中跳转过来的
        if (option.back == 1) {
            this.setData({
                back: option.back
            })
        }
        this.setData({
            is_edit: is_edit,
            delivery_id: delivery_id,
            province_list: province_list,
            city_list: city_list,
            area_list: area_list
        });
    },
    getWxAddr: function () {
        var that = this;
        wx.chooseAddress({
            success: function (res) {
                that.setData({
                    delivery_name: res.userName,
                    delivery_phone: res.telNumber,
                    delivery_province: res.provinceName,
                    delivery_city: res.cityName,
                    delivery_area: res.countyName,
                    delivery_street: res.detailInfo
                });
                console.log(res.userName)
                console.log(res.postalCode)
                console.log(res.provinceName)
                console.log(res.cityName)
                console.log(res.countyName)
                console.log(res.detailInfo)
                console.log(res.nationalCode)
                console.log(res.telNumber)
            }
        })
    },
    handlDialogOpen: function () {
        this.setData({
            is_dialog: true
        });
    },
    handlDialogCancel: function () {
        this.setData({
            is_dialog: false
        });
    },
    handlDialogOK: function () {
        var province_index = this.data.province_city_area[0];
        var city_index = this.data.province_city_area[1];
        var area_index = this.data.province_city_area[2];
        var delivery_province = china.children[province_index].name;
        var delivery_city = china.children[province_index].children[city_index].name;
        var delivery_area = china.children[province_index].children[city_index].children[area_index].name;
        this.setData({
            delivery_province: delivery_province,
            delivery_city: delivery_city,
            delivery_area: delivery_area,
            is_dialog: false
        });
    },
    handPickerChange: function (event) {
        if (this.data.is_dialog) {
            var province_city_area = event.detail.value;
            var province_index = province_city_area[0];
            var city_index = province_city_area[1];
            var area_index = province_city_area[2];
            if (this.data.province_city_area[0] != province_city_area[0]) {
                city_index = 0;
                area_index = 0;
            } else if (this.data.province_city_area[1] != province_city_area[1]) {
                area_index = 0;
            }
            var city_list = [];
            var area_list = [];

            for (var i = 0; i < china.children[province_index].children.length; i++) {
                city_list.push(china.children[province_index].children[i].name);
            }
            for (var i = 0; i < china.children[province_index].children[city_index].children.length; i++) {
                area_list.push(china.children[province_index].children[city_index].children[i].name);
            }
            this.setData({
                city_list: city_list,
                area_list: area_list,
                province_city_area: [province_index, city_index, area_index]
            });
        }
    },
    handleFind: function (delivery_id) {
        http.request({
            url: '/getQaddress',
            data: {
                id: delivery_id
            },
            success: function (data) {
                var province_index = 0;
                var city_index = 0;
                var area_index = 0;

                for (var i = 0; i < china.children.length; i++) {
                    if (china.children[i].name == data[0].qprovince) {
                        province_index = i;
                        break;
                    }
                }

                for (var i = 0; i < china.children[province_index].children.length; i++) {
                    if (china.children[province_index].children[i].name == data[0].qcity) {
                        city_index = i;
                        break;
                    }
                }
                for (var i = 0; i < china.children[province_index].children[city_index].children.length; i++) {
                    if (china.children[province_index].children[city_index].children[i].name == data[0].qarea) {
                        area_index = i;
                        break;
                    }
                }
                this.setData({
                    delivery_name: data[0].qname,
                    delivery_phone: data[0].qphone,
                    delivery_province: data[0].qprovince,
                    delivery_city: data[0].qcity,
                    delivery_area: data[0].qarea,
                    delivery_street: data[0].qaddr,
                    delivery_is_default: data[0].qdefault
                });
            }.bind(this)
        });
    },
    handleSubmit: function (event) {
        console.log(event);
        console.log(this.data.area);
        console.log('表单提交', event);
        var delivery_name = event.detail.value.delivery_name;
        var delivery_phone = event.detail.value.delivery_phone;
        var delivery_street = event.detail.value.delivery_street;
        var delivery_is_default = event.detail.value.delivery_is_default;

        if (delivery_name == '') {
            util.showFailToast({
                title: '请输入收货人'
            });
            return;
        } else {
            if (!util.isName(delivery_name)) {
                util.showFailToast({
                    title: '联系人格式错误',
                })
                return;
            }
            //检测表单是否包含敏感词
            if (sensitive.indexOf(delivery_name) != -1 && delivery_name.length >= 2) {
                util.showFailToast({
                    title: '联系人包含敏感词'
                });
                return
            }
        }
        if (util.expression.test(delivery_name)) {
            util.showFailToast({
                title: '收货人非法字符',
            })
            return;
        }
        if (delivery_phone == '') {
            util.showFailToast({
                title: '请输入电话号码'
            });

            return;
        } else {
            if (!util.isPhone(delivery_phone)) {
                util.showFailToast({
                    title: '电话号码格式错误'
                });
                return;
            }
        }
        if (this.data.area == '') {
            util.showFailToast({
                title: '请选择省市区'
            });
            return;
        }
        if (delivery_street == '') {
            util.showFailToast({
                title: '请输入详细地址'
            });
            return;
        }
        if (util.expression.test(delivery_street)) {
            util.showFailToast({
                title: '门牌号非法字符',
            })
            return;
        }
        //判断详细地址是否包含特殊字符
        var arr = sensitive.split('，');
        for (var i = 0; i < arr.length; i++) {
            if (delivery_street.indexOf(arr[i]) != -1) {
                wx.showToast({
                    title: '详细地址不允许有特殊字符！',
                    icon: 'none',
                    duration: 2000
                })
                return
            }
        }
        http.request({
            url: (this.data.is_edit ? '/updateQaddress' : '/insertQaddress'),
            data: {
                id: this.data.delivery_id,
                qopenId: getApp().globalData.userOpen.openid,
                qname: delivery_name,
                qphone: delivery_phone,
                qprovince: this.data.delivery_province,
                qcity: this.data.delivery_city,
                qarea: this.data.delivery_area,
                qaddr: delivery_street,
                qdefault: delivery_is_default ? 1 : 0,
                qsex: this.data.sex
            },
            success: function (data) {
                notification.emit('notification_delivery_index_load', data);

                util.showSuccessToast({
                    title: '保存成功',
                    success: function () {
                        // wx.navigateBack();
                        let pages = getCurrentPages();
                        let prevPage = pages[pages.length - 2];
                        prevPage.setData({
                            isNum: 2,
                        });
                        wx.navigateBack()
                    }
                });
            }.bind(this)
        });
    },
    // 单选按钮
    checked: function (e) {
        var sex = e.currentTarget.dataset.checkedid == 1 ? "男士" : "女士";
        this.setData({
            checkedId: e.currentTarget.dataset.checkedid,
            sex,
        })
    }
});
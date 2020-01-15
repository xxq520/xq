const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
const timeStamp = require("../../utils/time.js");
var app = getApp();
Page({
    /*** 页面的初始数据*/
    data: {
        shop: '',
        array: ['商品优惠券', '商品代金券'],
        index: 0,
        date: '',
        imagesData2: [],
        images2: [],
        imgLimit2: 1,
        tijiao: true
    },
    /*** 生命周期函数--监听页面加载*/
    onLoad: function (options) {
        this.setData({
            shop: wx.getStorageSync('shop'),
            date: util.getNowDate().substring(0, 10),
            DateAdd: util.DateAdd(util.getNowDate(), 1),
            DateAddnow: util.DateAdd(util.getNowDate(), 1)
        })
    },
    /*** 优惠券类型*/
    lx(e) {
        this.setData({
            index: e.detail.value,
        })
    },
    /*** 有效期*/
    yxq(e) {
        //如果是代金劵的话
        if (this.data.index) {
            this.setData({
                DateAddnow: e.detail.value
            })
        } else {
            this.setData({
                date: e.detail.value
            })
        }
    },
    /*** 表单提交*/
    formSubmit(e) {
        let coupons = e.detail.value
        coupons.storeId = this.data.shop.id
        coupons.state = this.data.shop.storetypeId
        coupons.lat = this.data.shop.coordinates.split(',')[0]
        coupons.lng = this.data.shop.coordinates.split(',')[1]
        let tp = e.detail.target.dataset.tp
        coupons.typeId = tp == 0 ? 2 : 1
        if (!coupons.name) {
            wx.showToast({
                title: '名称未填写',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (util.expression.test(coupons.name)) {
            wx.showToast({
                title: '名称包含非法字符',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (util.expression.test(coupons.details)) {
            wx.showToast({
                title: '描述包含非法字符',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (!coupons.full) {
            wx.showToast({
                title: '使用条件未填写',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (isNaN(coupons.full) || Number(coupons.full) < 0.01) {
            wx.showToast({
                title: '使用条件有误',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        } else {
            //代金劵面值保留两位小数
            coupons.full = Number(coupons.full).toFixed(2)
        }

        if (tp == 0 && !coupons.reduce) {
            wx.showToast({
                title: '减免金额未填写',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (isNaN(coupons.number)) {
            wx.showToast({
                title: '发放数量有误',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        } else {
            coupons.number = parseInt(coupons.number)
        }
        //判断优惠卷的满减金额是否小于等于0
        if (Number(coupons.reduce) <= 0) {
            wx.showToast({
                title: '减免金额小于0',
                image: '/images/search_no.png',
                duration: 2000
            })
            return;
        }
        if (tp == 0) {
            coupons.money = coupons.reduce
            if ((parseFloat(coupons.reduce) == parseFloat(coupons.full)) || (parseFloat(coupons.reduce) > parseFloat(coupons.full)) || parseFloat(coupons.reduce) < 0.01) {
                wx.showToast({
                    title: '金额设置不合理',
                    image: '/images/search_no.png',
                    duration: 2000
                })
                return
            }
        } else if (tp == 1) {
            coupons.reduce = coupons.money / coupons.full * 10
            if (parseFloat(coupons.reduce) > 9.99) {
                wx.showToast({
                    title: '金额/面值有误',
                    image: '/images/search_no.png',
                    duration: 2000
                })
                return
            }
        }
        if (!coupons.number) {
            wx.showToast({
                title: '发放数量未填写',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        coupons.surplus = coupons.number
        if (coupons.number < 0) {
            wx.showToast({
                title: '数量不能为负数',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (coupons.endTimeStr == util.getNowDate().substring(0, 10)) {
            wx.showToast({
                title: '有效期不合理',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (tp == 1 && !coupons.money) {
            wx.showToast({
                title: '购买金额未填写',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (tp == 1 && coupons.money <= 0) {
            wx.showToast({
                title: '金额必须大于0',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (tp == 1 && isNaN(coupons.money)) {
            wx.showToast({
                title: '金额设置有误',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (tp == 1 && this.data.imagesData2.length == 0) {
            wx.showToast({
                title: '配图未上传',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        this.setData({
            tijiao: false
        })
        coupons.qimg = this.data.imagesData2[0]
        http.request({
            url: '/insertQcoupons',
            data: coupons,
            success: function (e) {
                wx.showToast({
                    title: '添加成功',
                    icon: 'success',
                    duration: 2000
                })
                setTimeout(function () {
                    wx.navigateBack()
                    wx.hideLoading()
                }, 2000)
            }
        })
    },
    // 预览图片
    previewImg2: function (e) {
        wx.previewImage({
            current: e.currentTarget.dataset.src,
            urls: this.data.images2,
        })
    },
    del2: function (e) {
        var dataset = e.currentTarget.dataset
        // 删除图片
        if (dataset.type == 'image') {
            this.data.images2.splice(dataset.index, 1)
            this.data.imagesData2.splice(dataset.index, 1)
            this.data.imagesData2 = this.data.imagesData2
            this.setData({
                images2: this.data.images2
            })
        } else if (dataset.type == 'video') {
            this.data.videoData = ''
            this.setData({
                video: ''
            })
        }
    },
    upload2: function (e) {
        if (this.data.imagesData2.length <= 5) {
            var fileType = e.currentTarget.dataset.type
            var that = this;
            if (fileType == 'image') {
                that.uploadFile2(that, 'image')
            } else if (fileType == 'video') {
                that.uploadFile2(that, 'video')
            }
        }
    },
    // 上传图片视频等文件，封装
    uploadFile2: function (page, fileType) {
        if (fileType == 'image') {
            if (page.data.imagesData2.length < page.data.imgLimit2) {
                wx.chooseImage({
                    count: page.data.imgLimit2,
                    success: function (res) {
                        var tempFilePaths = res.tempFilePaths;
                        var tempFilesSize = res.tempFiles
                        tempFilePaths.forEach((item, index) => {
                            if (page.data.imagesData2.length < page.data.imgLimit2) {
                                util.showLoading({
                                    title: '上传中'
                                })
                                if (tempFilesSize[index].size <= 2000000) { //图片小于或者等于2M时 可以执行获取图片
                                    wx.uploadFile({
                                        url: constant.host + '/file/onefile2',
                                        filePath: item,
                                        name: 'file',
                                        formData: {
                                            'user': 'sgyj'
                                        },
                                        success: function (res) {
                                            var data = res.data
                                            if (data.substring(data.length - 1) == "\"") {
                                                data = data.substr(1, data.length - 2)
                                            }
                                            page.data.imagesData2.push(data)
                                            data = util.parseImgUrl(data)
                                            page.data.images2.push(data)
                                            page.setData({
                                                images2: page.data.images2
                                            })
                                            wx.hideLoading()
                                        }
                                    })
                                } else { //图片大于2M，弹出一个提示框
                                    wx.showToast({
                                        title: '上传图片不能大于2M!', //标题
                                        icon: 'none' //图标 none不使用图标，详情看官方文档
                                    })
                                    return
                                }
                            } else {
                                util.showFailToast({
                                    title: '最多上传' + page.data.imgLimit2 + '张'
                                })
                                return
                            }
                        })
                    }
                })
            } else {
                util.showFailToast({
                    title: '最多上传' + page.data.imgLimit2 + '张'
                })
            }
        } else if (fileType == 'video') {
            wx.chooseVideo({
                success: function (res) {
                    var tempFilePath = res.tempFilePath;
                    util.showLoading({
                        title: '上传中'
                    })
                    wx.uploadFile({
                        url: constant.host + '/file/onefile2',
                        filePath: tempFilePath,
                        name: 'file',
                        formData: {
                            'user': 'sgyj'
                        },
                        success: function (res1) {
                            wx.hideLoading()
                            var data = res1.data
                            if (data.substring(data.length - 1) == "\"") {
                                data = data.substr(1, data.length - 2)
                            }
                            page.data.videoData = data
                            data = util.parseImgUrl(data)
                            page.data.video = data
                            page.setData({
                                video: page.data.video,
                                poster: page.data.posterImg, //视频封面图
                            })
                            wx.uploadFile({
                                url: app.host + conf.api.uploadFile,
                                filePath: page.data.posterImg, //视频封面图
                                name: 'file',
                                formData: {
                                    'user': 'sgyj'
                                },
                                success: (res2) => {
                                    var data = res2.data
                                    if (data.substring(data.length - 1) == "\"") {
                                        data = data.substr(1, data.length - 2)
                                    }
                                    page.data.posterData = data
                                }
                            })
                        }
                    })
                }
            })
        }
    }
})
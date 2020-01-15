// pages/user/zhuczc.js
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
Page({
    data: {
        shop: {},
        zhuce: 1, //步骤
        imagesData: [],
        images: [],
        imgLimit: 1,
        imagesData2: [],
        images2: [],
        imgLimit2: 9,
        imagesData3: [],
        images3: [],
        imgLimit3: 1,
        imagesData4: [],
        images4: [],
        imgLimit4: 2,
        imagesData5: [],
        images5: [],
        imgLimit5: 9,
        storetype: '请选择行业分类',
        address: '',
        stime: '',
        etime: '',
        tsfw1: '',
        tsfw2: '',
        tsfw3: '',
        tsfw4: '',
        pwd: '',
        qrpwd: true,
        qrpwdd: '',
        functions: [],
        ruzhuinfo: {},
        detailsAddress: ''
    },
    updateshop() {
        if (!this.data.ruzhuinfo.userName) {
            wx.showToast({
                title: '店主姓名未填写',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (util.expression.test(this.data.ruzhuinfo.userName)) {
            wx.showToast({
                title: '姓名包含非法字符',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (!this.data.ruzhuinfo.tel) {
            wx.showToast({
                title: '店主电话未填写',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (!util.isPhone(this.data.ruzhuinfo.tel)) {
            wx.showToast({
                title: '电话号码格式错误',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }

        if (!this.data.ruzhuinfo.storeName) {
            wx.showToast({
                title: '店铺名称未填写',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (!this.data.ruzhuinfo.storetypeId) {
            wx.showToast({
                title: '行业分类未选择',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (!this.data.ruzhuinfo.address) {
            wx.showToast({
                title: '店铺地址未选择',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (!this.data.ruzhuinfo.startTime || !this.data.ruzhuinfo.endTime) {
            wx.showToast({
                title: '营业时间未选择',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (!this.data.ruzhuinfo.announcement) {
            wx.showToast({
                title: '店铺公告未填写',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (util.expression.test(this.data.ruzhuinfo.announcement)) {
            wx.showToast({
                title: '公告包含非法字符',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (util.expression.test(this.data.ruzhuinfo.cpi)) {
            wx.showToast({
                title: '人均包含非法字符',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (util.expression.test(this.data.detailsAddress)) {
            wx.showToast({
                title: '门牌包含非法字符',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (!this.data.ruzhuinfo.cpi && this.data.ruzhuinfo.cpi == 0) {
            wx.showToast({
                title: '人均消费未填写',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (util.expression.test(this.data.ruzhuinfo.details)) {
            wx.showToast({
                title: '描述包含非法字符',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (!this.data.ruzhuinfo.details) {
            wx.showToast({
                title: '店铺描述未填写',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (this.data.imagesData.length == 0 || this.data.imagesData3.length == 0 || this.data.imagesData4.length == 0 || this.data.imagesData5.length == 0) {
            wx.showToast({
                title: '图片未上传',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        } else if (this.data.imagesData4.length < 2) {
            wx.showToast({
                title: '身份证需两张',
                image: '/images/search_no.png',
                duration: 2000
            })
            return;
        } else {
            // 常规参数
            this.data.ruzhuinfo.state = 1
            this.data.ruzhuinfo.logo = this.data.imagesData[0]
        }
        var a = this.data.tsfw1 + ',' + this.data.tsfw2 + ',' + this.data.tsfw3 + ',' + this.data.tsfw4
        this.data.ruzhuinfo.skzf = this.data.shop.skzf
        this.data.ruzhuinfo.wifi = this.data.shop.wifi
        this.data.ruzhuinfo.mftc = this.data.shop.mftc
        this.data.ruzhuinfo.jzxy = this.data.shop.jzxy
        this.data.ruzhuinfo.tgbj = this.data.shop.tgbj
        this.data.ruzhuinfo.sfxx = this.data.shop.sfxx
        this.data.ruzhuinfo.zcfp = this.data.shop.zcfp
        this.data.ruzhuinfo.ktkf = this.data.shop.ktkf
        this.data.ruzhuinfo.sjcd = this.data.shop.sjcd
        this.data.ruzhuinfo.shdj = this.data.shop.shdj
        this.data.ruzhuinfo.zcth = this.data.shop.zcth
        this.data.ruzhuinfo.shwy = this.data.shop.shwy
        this.data.ruzhuinfo.img = this.data.imagesData5.join(',')
        this.data.ruzhuinfo.sfzImg = this.data.imagesData4.join(',')
        this.data.ruzhuinfo.yyzzImg = this.data.imagesData3.join(',')
        this.data.ruzhuinfo.address += this.data.detailsAddress ? ',' + this.data.detailsAddress : ''
        //修改信息
        var that = this
        http.request({
            url: '/updateQbusiness',
            data: this.data.ruzhuinfo,
            success: function (e) {
                wx.showToast({
                    title: '修改成功',
                    icon: 'success',
                    duration: 2000
                })
                setTimeout(function () {
                    wx.hideLoading()
                    wx.reLaunch({
                        url: '/pages/booszy/booszy',
                    })
                }, 1000);
            }
        })

    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this
        var shopDetails = wx.getStorageSync('shop');
        var details = ''
        if (shopDetails.address.indexOf(',') != -1) {
            details = shopDetails.address.substr(shopDetails.address.indexOf(',') + 1, shopDetails.address.length)
            shopDetails.address = shopDetails.address.substr(0, shopDetails.address.indexOf(','))
            console.log(shopDetails.address)
        }
        that.setData({
            shop: shopDetails,
            detailsAddress: details
        })
        //菜单栏
        http.request({
            url: '/getQbusinessType',
            data: {
                uniacid: 2339
            },
            success: function (e) {
                e.data.forEach((item, index) => {
                    if (item.id == that.data.shop.storetypeId) {
                        that.data.ruzhuinfo.storetypeId = that.data.shop.storetypeId
                        that.setData({
                            storetype: item.typeName,
                        })
                        return
                    }
                })
                that.setData({
                    functions: e.data,
                })
            },
        });
        let shop = that.data.shop
        let ruzhuinfo = that.data.ruzhuinfo
        ruzhuinfo.id = shop.id
        ruzhuinfo.userName = shop.userName
        ruzhuinfo.tel = shop.tel
        ruzhuinfo.storeName = shop.storeName
        ruzhuinfo.storetypeId = shop.storetypeId
        ruzhuinfo.address = shop.address
        ruzhuinfo.startTime = shop.startTime
        ruzhuinfo.endTime = shop.endTime
        ruzhuinfo.details = shop.details
        ruzhuinfo.announcement = shop.announcement
        ruzhuinfo.cpi = shop.cpi
        ruzhuinfo.skzf = shop.skzf
        ruzhuinfo.wifi = shop.wifi
        ruzhuinfo.mftc = shop.mftc
        ruzhuinfo.jzxy = shop.jzxy
        ruzhuinfo.tgbj = shop.tgbj
        ruzhuinfo.sfxx = shop.sfxx
        ruzhuinfo.zcfp = shop.zcfp
        ruzhuinfo.ktkf = shop.ktkf
        ruzhuinfo.sjcd = shop.sjcd
        ruzhuinfo.shdj = shop.shdj
        ruzhuinfo.zcth = shop.zcth
        ruzhuinfo.shwy = shop.shwy
        that.data.imagesData = [shop.logo]
        that.data.imagesData3 = shop.yyzzImg.split(",")
        shop.yyzzImg.split(",").forEach(item => {
            that.data.images3.push(constant.imghost + item)
        })
        that.data.imagesData4 = shop.sfzImg.split(",")
        shop.sfzImg.split(",").forEach(item => {
            that.data.images4.push(constant.imghost + item)
        })
        that.data.imagesData5 = shop.img.split(",")
        shop.img.split(",").forEach(item => {
            that.data.images5.push(constant.imghost + item)
        })
        that.setData({
            images: [constant.imghost + shop.logo],
            images2: that.data.images2,
            images3: that.data.images3,
            images4: that.data.images4,
            images5: that.data.images5,
        })
    },
    /**
     * 店主姓名
     */
    userName: function (e) {
        this.data.ruzhuinfo.userName = e.detail.value
    },
    /**
     * 联系电话
     */
    tel: function (e) {
        this.data.ruzhuinfo.tel = e.detail.value
    },
    /**
     * 商家名称
     */
    storeName: function (e) {
        this.data.ruzhuinfo.storeName = e.detail.value
    },
    /**
     * 登录密码
     */
    pwd: function (e) {
        this.data.pwd = e.detail.value
        this.setData({
            qrpwd: false
        })
    },
    /**
     * 确认登录密码
     */
    qrpwd: function (e) {
        if (this.data.pwd.length <= e.detail.value.length) {
            if (this.data.pwd.indexOf(e.detail.value) == -1) {
                wx.showToast({
                    title: '密码不一致',
                    image: '/images/search_no.png',
                    duration: 2000
                })
                this.setData({
                    qrpwdd: ''
                })
                return
            } else {
                this.data.ruzhuinfo.pwd = e.detail.value
            }
        } else {
            this.data.qrpwdd = e.detail.value
        }
    },
    /**
     * 商家分类
     */
    bindPickerChange(e) {
        this.data.ruzhuinfo.storetypeId = this.data.functions[e.detail.value].id
        this.setData({
            storetype: this.data.functions[e.detail.value].typeName
        })
    },
    /**
     *选择商家地址
     */
    map: function () {
        var that = this
        wx.chooseLocation({
            type: 'wgs84', //'gcj02',
            success: function (res) {
                that.data.ruzhuinfo.coordinates = res.latitude + ',' + res.longitude
                that.data.ruzhuinfo.address = res.address
                that.setData({
                    name: res.name,
                    address: res.address
                });
            },
        });
    },
    /**
     *店家开始营业时间
     */
    start: function (e) {
        this.data.ruzhuinfo.startTime = e.detail.value
        this.setData({
            stime: e.detail.value
        })
    },
    /**
     *店家结束营业时间
     */
    end: function (e) {
        this.data.ruzhuinfo.endTime = e.detail.value
        this.setData({
            etime: e.detail.value
        })
    },
    /**
     *店家公告
     */
    announcement: function (e) {
        this.data.ruzhuinfo.announcement = e.detail.value
    },
    cpi: function (e) {
        this.data.ruzhuinfo.cpi = e.detail.value
    },
    /**
     *特色服务
     */
    dxk1: function (e) {
        var a, b;
        var sho = `shop.${e.currentTarget.dataset.type}`
        var that = this
        this.setData({
            [sho]: that.data.shop[e.currentTarget.dataset.type] == 1 ? 2 : 1
        })
    },
    /**
     *店铺介绍
     */
    details: function (e) {
        this.data.ruzhuinfo.details = e.detail.value
    },
    // 预览图片
    previewImg: function (e) {
        wx.previewImage({
            current: e.currentTarget.dataset.src,
            urls: this.data.images,
        })
    },

    del: function (e) {
        var dataset = e.currentTarget.dataset
        // 删除图片
        if (dataset.type == 'image') {
            this.data.images.splice(dataset.index, 1)
            this.data.imagesData.splice(dataset.index, 1)
            this.data.imagesData = this.data.imagesData
            this.setData({
                images: this.data.images
            })
        } else if (dataset.type == 'video') {
            this.data.videoData = ''
            this.setData({
                video: ''
            })
        }
    },
    detailAdd(e) {
        var that = this
        this.setData({
            detailsAddress: e.detail.value
        });
    },

    upload: function (e) {
        if (this.data.imagesData.length <= 9) {
            var fileType = e.currentTarget.dataset.type
            var that = this;
            if (fileType == 'image') {
                that.uploadFile(that, 'image')
            } else if (fileType == 'video') {
                that.uploadFile(that, 'video')
            }
        }
    },

    // 上传图片视频等文件，封装
    uploadFile: function (page, fileType) {
        if (fileType == 'image') {
            if (page.data.imagesData.length < page.data.imgLimit) {
                wx.chooseImage({
                    count: page.data.imgLimit,
                    success: function (res) {
                        var tempFilePaths = res.tempFilePaths;
                        // tempFilePaths = tempFilePaths.slice(0, page.data.imgLimit - page.data.imagesData.length)
                        var tempFilesSize = res.tempFiles
                        tempFilePaths.forEach((item, index) => {
                            if (page.data.imagesData.length < page.data.imgLimit) {
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
                                            page.data.imagesData.push(data)
                                            page.data.ruzhuinfo.logo = page.data.imagesData[0]
                                            wx.setStorageSync('ruzhuinfo', page.data.ruzhuinfo)
                                            data = util.parseImgUrl(data)
                                            page.data.images.push(data)
                                            page.setData({
                                                images: page.data.images
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
                                    title: '最多上传' + page.data.imgLimit + '张'
                                })
                                return
                            }
                        })
                    }
                })
            } else {
                util.showFailToast({
                    title: '最多上传' + page.data.imgLimit + '张'
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
                            //
                        }
                    })
                }
            })
        }
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
                        // tempFilePaths = tempFilePaths.slice(0, page.data.imgLimit2 - page.data.imagesData2.length)
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
                                            page.data.ruzhuinfo.ad = page.data.imagesData2.join(',')
                                            wx.setStorageSync('ruzhuinfo', page.data.ruzhuinfo)
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
                            //wx.hideLoading()
                        }
                    })
                }
            })
        }
        //wx.hideLoading()
    },
    // 预览图片
    previewImg3: function (e) {
        wx.previewImage({
            current: e.currentTarget.dataset.src,
            urls: this.data.images3,
        })
    },
    del3: function (e) {
        var dataset = e.currentTarget.dataset
        // 删除图片
        if (dataset.type == 'image') {
            this.data.images3.splice(dataset.index, 1)
            this.data.imagesData3.splice(dataset.index, 1)
            this.data.imagesData3 = this.data.imagesData3
            this.setData({
                images3: this.data.images3
            })
        } else if (dataset.type == 'video') {
            this.data.videoData = ''
            this.setData({
                video: ''
            })
        }
    },

    upload3: function (e) {
        if (this.data.imagesData3.length <= 9) {
            var fileType = e.currentTarget.dataset.type
            var that = this;
            if (fileType == 'image') {
                that.uploadFile3(that, 'image')
            } else if (fileType == 'video') {
                that.uploadFile3(that, 'video')
            }
        }
    },
    // 上传图片视频等文件，封装
    uploadFile3: function (page, fileType) {
        if (fileType == 'image') {
            if (page.data.imagesData3.length < page.data.imgLimit3) {
                wx.chooseImage({
                    count: page.data.imgLimit3,
                    success: function (res) {
                        var tempFilePaths = res.tempFilePaths;
                        // tempFilePaths = tempFilePaths.slice(0, page.data.imgLimit3 - page.data.imagesData3.length)
                        var tempFilesSize = res.tempFiles
                        tempFilePaths.forEach((item, index) => {
                            if (page.data.imagesData3.length < page.data.imgLimit3) {
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
                                            wx.hideLoading()
                                            var data = res.data
                                            if (data.substring(data.length - 1) == "\"") {
                                                data = data.substr(1, data.length - 2)
                                            }
                                            page.data.imagesData3.push(data)
                                            page.data.ruzhuinfo.yyzzImg = page.data.imagesData3.join(',')
                                            wx.setStorageSync('ruzhuinfo', page.data.ruzhuinfo)
                                            data = util.parseImgUrl(data)
                                            page.data.images3.push(data)
                                            page.setData({
                                                images3: page.data.images3
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
                                    title: '最多上传' + page.data.imgLimit3 + '张'
                                })
                                return
                            }
                        })
                    }
                })
            } else {
                util.showFailToast({
                    title: '最多上传' + page.data.imgLimit3 + '张'
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
                            //wx.hideLoading()
                        }
                    })
                }
            })
        }
        //wx.hideLoading()
    },

    // 预览图片4
    previewImg4: function (e) {
        wx.previewImage({
            current: e.currentTarget.dataset.src,
            urls: this.data.images4,
        })
    },
    del4: function (e) {
        var dataset = e.currentTarget.dataset
        // 删除图片
        if (dataset.type == 'image') {
            this.data.images4.splice(dataset.index, 1)
            this.data.imagesData4.splice(dataset.index, 1)
            this.data.imagesData4 = this.data.imagesData4
            this.setData({
                images4: this.data.images4
            })
        } else if (dataset.type == 'video') {
            this.data.videoData = ''
            this.setData({
                video: ''
            })
        }
    },

    upload4: function (e) {
        if (this.data.imagesData4.length <= 9) {
            var fileType = e.currentTarget.dataset.type
            var that = this;
            if (fileType == 'image') {
                that.uploadFile4(that, 'image', 3)
            } else if (fileType == 'video') {
                that.uploadFile4(that, 'video')
            }
        }
    },
    // 上传图片视频等文件，封装
    uploadFile4: function (page, fileType, num) {
        if (fileType == 'image') {
            if (page.data.imagesData4.length < page.data.imgLimit4) {
                wx.chooseImage({
                    count: page.data.imgLimit4,
                    success: function (res) {
                        var tempFilePaths = res.tempFilePaths;
                        // tempFilePaths = tempFilePaths.slice(0, page.data.imgLimit4 - page.data.imagesData4.length)
                        var tempFilesSize = res.tempFiles
                        tempFilePaths.forEach((item, index) => {
                            if (page.data.imagesData4.length + index + 1 < num) {
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
                                            wx.hideLoading()
                                            var data = res.data
                                            if (data.substring(data.length - 1) == "\"") {
                                                data = data.substr(1, data.length - 2)
                                            }
                                            page.data.imagesData4.push(data)
                                            page.data.ruzhuinfo.sfzImg = page.data.imagesData4.join(',')
                                            wx.setStorageSync('ruzhuinfo', page.data.ruzhuinfo)
                                            data = util.parseImgUrl(data)
                                            page.data.images4.push(data)
                                            page.setData({
                                                images4: page.data.images4
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
                                    title: '最多上传' + page.data.imgLimit4 + '张'
                                })
                                return
                            }
                        })
                    }
                })
            } else {
                util.showFailToast({
                    title: '最多上传' + page.data.imgLimit4 + '张'
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
                            //wx.hideLoading()
                        }
                    })
                }
            })
        }
        //wx.hideLoading()
    },
    // 预览图片5
    previewImg5: function (e) {
        wx.previewImage({
            current: e.currentTarget.dataset.src,
            urls: this.data.images5,
        })
    },
    del5: function (e) {
        var dataset = e.currentTarget.dataset
        // 删除图片
        if (dataset.type == 'image') {
            this.data.images5.splice(dataset.index, 1)
            this.data.imagesData5.splice(dataset.index, 1)
            this.data.imagesData5 = this.data.imagesData5
            this.setData({
                images5: this.data.images5
            })
        } else if (dataset.type == 'video') {
            this.data.videoData = ''
            this.setData({
                video: ''
            })
        }
    },

    upload5: function (e) {
        if (this.data.imagesData5.length <= 9) {
            var fileType = e.currentTarget.dataset.type
            var that = this;
            if (fileType == 'image') {
                that.uploadFile5(that, 'image')
            } else if (fileType == 'video') {
                that.uploadFile5(that, 'video')
            }
        }
    },
    // 上传图片视频等文件，封装
    uploadFile5: function (page, fileType) {
        if (fileType == 'image') {
            if (page.data.imagesData5.length < page.data.imgLimit5) {
                wx.chooseImage({
                    count: page.data.imgLimit5,
                    success: function (res) {
                        var tempFilePaths = res.tempFilePaths;
                        // tempFilePaths = tempFilePaths.slice(0, page.data.imgLimit5 - page.data.imagesData5.length)
                        var tempFilesSize = res.tempFiles
                        tempFilePaths.forEach((item, index) => {
                            if (page.data.imagesData5.length + index < 9) {
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
                                            wx.hideLoading()
                                            var data = res.data
                                            if (data.substring(data.length - 1) == "\"") {
                                                data = data.substr(1, data.length - 2)
                                            }
                                            page.data.imagesData5.push(data)
                                            page.data.ruzhuinfo.img = page.data.imagesData5.join(',')
                                            wx.setStorageSync('ruzhuinfo', page.data.ruzhuinfo)
                                            data = util.parseImgUrl(data)
                                            page.data.images5.push(data)
                                            page.setData({
                                                images5: page.data.images5
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
                                    title: '最多上传' + page.data.imgLimit5 + '张'
                                })
                                return
                            }
                        })
                    }
                })
            } else {
                util.showFailToast({
                    title: '最多上传' + page.data.imgLimit5 + '张'
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
                            //wx.hideLoading()
                        }
                    })
                }
            })
        }
        //wx.hideLoading()
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    tz: function () {
        wx.navigateTo({
            url: '/pages/booszy/booszy',
        })
    }
})
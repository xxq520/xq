const constant = require("../../utils/constant.js");
const http = require("../../utils/http.js");
const util = require('../../utils/util.js');
//获取应用实例  
var app = getApp();
Page({
    data: {

        stars: [0, 1, 2, 3, 4],
        normalSrc: '../../images/arrow03.png',
        selectedSrc: '../../images/arrow01.png',
        halfSrc: '../../images/arrow02.png',
        key: 0, //评分
        flag: 0,
        host: constant.host + '/img/',
        textLen: 0,
        images: [],
        imagesData: [],
        imgLimit: 6,
        upLoadImg: '',
        uploadimgs: [],
        editable: true,
        orderId: 0,
        spid: 0,
        reason: '',
        remark: '',
        imgUrl: '',
    },
    onLoad: function (options) {
        this.setData({
            orderId: options.orderId,
            spid: options.spid,
        });
    },
    //点击右边,半颗星
    selectLeft: function (e) {
        var key = e.currentTarget.dataset.key
        if (this.data.key == 0.5 && e.currentTarget.dataset.key == 0.5) {
            //只有一颗星的时候,再次点击,变为0颗
            key = 0;
        }
        this.data.key = key
        console.log("评分" + this.data.key)
        this.setData({
            key: key
        })
    },
    //点击左边,整颗星
    selectRight: function (e) {
        var key = e.currentTarget.dataset.key
        this.data.key = key
        console.log("评分" + this.data.key)
        this.setData({
            key: key
        })
    },
    myStarChoose(e) {
        let star = parseInt(e.target.dataset.star) || 0;
        console.log('分数', e.target.dataset.star)
        this.data.star = e.target.dataset.star
        this.setData({
            star: star,
        });
    },
    submitReturnData: function () {
        var that = this;
        //数据验证
        if (that.data.key == 0) {
            wx.showToast({
                title: '评分不能为零',
                image: '/images/info.png',
                duration: 2000
            });
            return;
        }
        if (!this.data.remark) {
            wx.showToast({
                title: '请填写评论信息',
                image: '/images/info.png',
                duration: 2000
            });
            return;
        }
        http.request({
            url: '/insertQpinglun',
            data: {
                qidd: that.data.spid,
                qname: app.globalData.userInfo.nickName,
                qicon: app.globalData.userInfo.avatarUrl,
                qopenid: app.globalData.userOpen.openid,
                qcontent: that.data.remark,
                qnum: that.data.key,
                qimg: that.data.imagesData ? that.data.imagesData.join(',') : '',
            },
            success: function (data) {
                wx.showToast({
                    title: '感谢您的支持',
                    duration: 2000
                });
                wx.switchTab({
                    url: '../user/user',
                })

            }
        });
    },
    reasonInput: function (e) {
        this.setData({
            reason: e.detail.value,
        });
        console.log('评分', this.data.reason)
    },
    remarkInput: function (e) {
        this.setData({
            remark: e.detail.value,
        });
        console.log('评论详情', this.data.remark)
    },
    del: function (e) {
        console.log(e)
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
    // 预览图片
    previewImg: function (e) {
        wx.previewImage({
            current: e.currentTarget.dataset.src,
            urls: this.data.images,
        })
    },
    upload: function (e) {
        if (this.data.imagesData.length <= 5) {
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
                        console.log(res);
                        var tempFilePaths = res.tempFilePaths;
                        console.log('zhaopian', tempFilePaths)
                        tempFilePaths = tempFilePaths.slice(0, page.data.imgLimit - page.data.imagesData.length)
                        tempFilePaths.forEach(item => {
                            if (page.data.imagesData.length < page.data.imgLimit) {
                                wx.uploadFile({
                                    url: constant.host + '/file/onefile2',
                                    filePath: item,
                                    name: 'file',
                                    formData: {
                                        'user': 'sgyj'
                                    },
                                    success: function (res) {
                                        console.log(res);
                                        var data = res.data
                                        if (data.substring(data.length - 1) == "\"") {
                                            data = data.substr(1, data.length - 2)
                                        }
                                        page.data.imagesData.push(data)
                                        data = util.parseImgUrl(data)
                                        page.data.images.push(data)
                                        page.setData({
                                            images: page.data.images
                                        })
                                        wx.hideLoading()
                                    }
                                })
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
                    console.log(res);
                    var tempFilePath = res.tempFilePath;
                    console.log(tempFilePath)
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
                            console.log(res1);
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
                            wx.hideLoading()
                        }
                    })
                }
            })
        }
        wx.hideLoading()
    },
})
// pages/shangpgl/shangpfb.js
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
var app = getApp();
Page({
    /**
     * 页面的初始数据
     */
    data: {
        imagesData: [],
        images: [],
        imgLimit: 9,
        imagesData2: [],
        images2: [],           //主图列表
        imgLimit2: 9,
        procedure: {},
        procedureType: [],
        sj: true,
        baoyou: true,
        xiugai: false,
        tc: false,           // 控制 “弹窗” 对话框
        guige: [],
        yanse: [],
        specId: 0,
        qrtj: false,         // “确认添加”
        // 视频
        videoInCarousel: '',    // full url
        videoPath: '',          // path on server
        nowguige: '',
        nowyanse: '',
        change: false,
        //包含几个推荐产品
        recommendNum: 0,
        goodsCost: 0
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this
        http.request({
            url: '/getQprocedureType',
            data: {
                qshopid: wx.getStorageSync('shop').id,
                qdelete: 1
            },
            success: function (e) {
                console.log('商品分类信息');
                //保存在缓存中 的修改商品数据
                if (options.procedure) {
                    options.procedure = wx.getStorageSync('changeg');
                }
                if (options.procedure != undefined) {
                    const procedure = options.procedure;
                    console.log(procedure)
                    e.forEach(item => {
                        if (procedure.specId == item.id) {
                            console.log('类型id', item.id)
                            procedure.qcaption = item.qcaption
                        }
                    })
                    that.data.procedure = procedure
                    that.data.specId = procedure.specId
                    that.data.imagesData = procedure.imgs
                    procedure.imgs.forEach(item => {
                        that.data.images.push(constant.imghost + item)
                    })

                    that.data.videoPath = procedure.video
                    if (that.data.videoPath) {
                        that.data.videoInCarousel = constant.imghost + that.data.videoPath
                    }

                    that.data.imagesData2 = procedure.lbImgs
                    procedure.lbImgs.forEach(item => {
                        that.data.images2.push(constant.imghost + item)
                    })
                    if (procedure.ptype) {
                        procedure.ptype.forEach(item => {
                            that.data.guige.push({
                                'tpname': item.qtypeName,
                                'num': item.qprice,
                                'id': item.id
                            })
                        })
                    }
                    if (procedure.pcolor) {
                        procedure.pcolor.forEach(item => {
                            that.data.yanse.push({
                                'tpname': item.qtypeName,
                                'id': item.id
                            })
                        })
                    }
                    that.setData({
                        images: that.data.images,
                        images2: that.data.images2,
                        videoInCarousel: that.data.videoInCarousel,
                        guige: that.data.guige,
                        yanse: that.data.yanse,
                        procedure: procedure,
                        xiugai: true,
                        goodsCost: procedure.goodsCost
                    })
                    console.log('页面参数', that.data.procedure)
                }
                that.setData({
                    procedureType: e,
                });
            }
        })
        http.request({
            url: '/getQprocedure',
            data: {
                storeId: wx.getStorageSync('shop').id,
                qstatus: 1,
                state: 2,
                isShow: 1,
                orderstr: 'limit 0, 18'
            }, success(e) {
                that.setData({
                    recommendNum: e.length

                })
            }
        })
    },
    sj(e) {
        console.log('是否上架', e.detail.value)
    },
    //更改库存
    changeQkucun(e) {
    },
    changeGoodsCost(e) {
    },
    blurchangeGoodsCost(e) {
        console.log(e, '44444')
        var procedure = this.data.procedure;
        console.log(procedure)
        procedure.goodsCost = isNaN(Number(e.detail.value)) ? 1 : Number(e.detail.value).toFixed(2)
        var str = procedure.goodsCost
        this.setData({
            [str]: procedure.goodsCost
        })
    },
    /**
     * 分类    - 商品类别  value 改变时触发 change 事件，event.detail = {value: number}
     */
    bindPickerChange(e) {
        this.setData({
            specId: this.data.procedureType[e.detail.value].id,
            qcaption: this.data.procedureType[e.detail.value].qcaption
        })
    },
    /**
     * 显示弹窗  添加规格/颜色
     */
    tj(e) {
        console.log('添加规格', e.currentTarget.dataset.tp)
        this.setData({
            tp: e.currentTarget.dataset.tp,
            tc: true,
            nowguige: '',
            nowyanse: '',
            change: false
        })
    },
    /**
     * 关闭弹窗
     */
    gbtc(e) {
        this.setData({
            tc: false
        })
    },
    /**
     * 输入框
     */
    tpname(e) {
        console.log('输入信息 规格/颜色', e.detail.value)
        this.setData({
            tpname: e.detail.value
        })
    },
    /**
     * 输入框
     */
    num(e) {
        this.setData({
            num: Number(e.detail.value).toFixed(2)
        })
    },
    /**
     * 确认添加
     */
    qrtj(e) {
        var that = this;
        let tp = e.currentTarget.dataset.tp
        let tpname = e.currentTarget.dataset.tpname
        let num = e.currentTarget.dataset.num
        let id = e.currentTarget.dataset.spid
        //判断添加的规格是否包含特殊字符
        if (util.expression.test(that.data.tpname) || util.expression.test(that.data.nowguige)) {
            wx.showToast({
                title: '信息包含非法字符',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (tp == 1) {
            // 添加 规格
            if (!tpname.trim() || !num.trim()) {
                wx.showToast({
                    title: '信息未填写',
                    image: '/images/search_no.png',
                    duration: 2000
                })
                return
            }
            if (util.expression.test(tpname)) {
                wx.showToast({
                    title: '信息包含非法字符',
                    image: '/images/search_no.png',
                    duration: 2000
                })
                return
            }
            // procedure.qkucun=Number(procedure.qkucun)<=1?1:parseInt(Number(procedure.qkucun))
            var newnum = num.trim()
            if (isNaN(Number(newnum)) || Number(newnum) < 0) {
                wx.showToast({
                    title: '金额设置有误',
                    image: '/images/search_no.png',
                    duration: 2000
                })
                return;
            }
            // 如果是已有产品，添加新的 规格 到后台
            if (id != null) {
                http.request({
                    url: '/insertQtype',
                    data: {
                        qprocedureId: id,
                        qtypeName: tpname.trim(),
                        qprice: Number(num.trim()),
                    },
                    success: function (e) {

                    }
                })
            }

            // 新规格加入数组列表
            this.data.guige.push({
                'tpname': tpname.trim(),
                'num': Number(num.trim())
            })

            // 关闭对话框，同时更新 guige 让页面刷新
            this.setData({
                tpname: '',
                num: '',
                guige: this.data.guige,
                tc: false
            })
        } else if (tp == 2) {
            // 添加  颜色
            if (!tpname.trim()) {
                wx.showToast({
                    title: '信息未填写',
                    image: '/images/search_no.png',
                    duration: 2000
                })
                return
            }

            // 如果是已有产品，添加新的 颜色 到后台
            if (id != null) {
                http.request({
                    url: '/insertQcolor',
                    data: {
                        qprocedureId: id,
                        qtypeName: tpname.trim(),
                    },
                    success: function (e) {

                    }
                })
            }
            this.data.yanse.push({
                'tpname': tpname.trim(),

            })

            // 关闭对话框，同时更新 yanse 让页面刷新
            this.setData({
                tpname: '',
                yanse: this.data.yanse,
                tc: false
            })
        }
    },
    //修改商品的规格
    changeType(e) {
        var that = this;
        if (e.currentTarget.dataset.number == 1) {
            http.request({
                url: '/getQtype',
                data: {
                    qprocedureId: that.data.procedure.id,
                },
                success: function (e) {
                    that.setData({
                        type: e
                    })
                }
            }, true)
        } else {
            http.request({
                url: '/getQcolor',
                data: {
                    qprocedureId: that.data.procedure.id,
                },
                success: function (e) {
                    that.setData({
                        color: e
                    })
                }
            }, true)
        }
        //currentTarget.dataset
        this.setData({
            tc: true,
            nowguige: e.currentTarget.dataset.name,
            nowyanse: e.currentTarget.dataset.num || '',
            change: true,
            tp: e.currentTarget.dataset.number || '',
            pid: e.currentTarget.dataset.id,
            index: e.currentTarget.dataset.index
        })
    },
    //修改后保存规格
    changeGuige(e) {
        var that = this
        //修改规格
        if (util.expression.test(that.data.tpname) || util.expression.test(that.data.nowguige)) {
            wx.showToast({
                title: '信息包含非法字符',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (this.data.tp == 1) {
            //判断规格
            if (that.data.tpname) {
                if (!that.data.tpname.trim()) {
                    wx.showToast({
                        title: '信息未填写',
                        image: '/images/search_no.png',
                        duration: 2000
                    })
                    return
                }
                //判断价格
            } else if (that.data.num) {
                if (!that.data.num.trim()) {
                    wx.showToast({
                        title: '信息未填写',
                        image: '/images/search_no.png',
                        duration: 2000
                    })
                    return
                }
            }
            // procedure.qkucun=Number(procedure.qkucun)<=1?1:parseInt(Number(procedure.qkucun))
            var newnum = that.data.num
            if (newnum) {
                if (isNaN(Number(newnum)) || Number(newnum) < 0) {
                    wx.showToast({
                        title: '金额设置有误',
                        image: '/images/search_no.png',
                        duration: 2000
                    })
                    return;
                }
            }
            console.log(that.data.pid, that.data.type[this.data.index], 222)
            if (that.data.procedure.id) {
                http.request({
                    url: '/updateQtype',
                    data: {
                        id: that.data.pid || that.data.type[this.data.index].id,
                        qtypeName: that.data.tpname || that.data.nowguige,
                        qprice: that.data.num || that.data.nowyanse
                    },
                    success: function (e) {
                        var num = `guige[${that.data.index}].num`
                        var tpname = `guige[${that.data.index}].tpname`
                        that.setData({
                            [num]: that.data.num || that.data.nowyanse,
                            [tpname]: that.data.tpname || that.data.nowguige
                        }, () => {
                            that.setData({
                                tc: false,
                                change: false,
                                nowyanse: '',
                                nowguige: ''
                            })
                        })
                    }
                }, true)
            } else {
                var num = `guige[${that.data.index}].num`
                var tpname = `guige[${that.data.index}].tpname`
                that.setData({
                    [num]: that.data.num || that.data.nowyanse,
                    [tpname]: that.data.tpname || that.data.nowguige
                }, () => {
                    that.setData({
                        tc: false,
                        change: false,
                        nowyanse: '',
                        nowguige: ''
                    })
                })
            }
        } else {
            if (that.data.tpname) {
                if (!that.data.tpname.trim()) {
                    wx.showToast({
                        title: '信息未填写',
                        image: '/images/search_no.png',
                        duration: 2000
                    })
                    return
                }
            }
            if (that.data.procedure.id) {
                //  修改颜色
                http.request({
                    url: '/updateQcolor',
                    data: {
                        id: that.data.pid || that.data.color[this.data.index].id,
                        qtypeName: that.data.tpname || that.data.nowguige
                    },
                    success: function (e) {
                        var tpname = `yanse[${that.data.index}].tpname`
                        that.setData({
                            [tpname]: that.data.tpname || that.data.nowguige
                        }, () => {
                            that.setData({
                                tc: false,
                                change: false,
                                nowyanse: '',
                                nowguige: ''
                            })
                        })
                    }
                }, true)
            } else {
                var tpname = `yanse[${that.data.index}].tpname`
                that.setData({
                    [tpname]: that.data.tpname || that.data.nowyanse
                }, () => {
                    that.setData({
                        tc: false,
                        change: false,
                        nowyanse: '',
                        nowguige: ''
                    })
                })
            }
        }
    },
    /**
     * 删除规格
     */
    scgg(e) {
        var dataset = e.currentTarget.dataset
        var id = dataset.id
        if (id != null) {
            http.request({
                url: '/updateQtype',
                data: {
                    id: id,
                    qdelete: 2
                }
            })
        }
        this.data.guige.splice(dataset.index, 1)
        this.setData({
            guige: this.data.guige
        })
    },
    /**
     * 删除颜色
     */
    scys(e) {
        var dataset = e.currentTarget.dataset
        var id = dataset.id
        if (id != null) {
            http.request({
                url: '/updateQcolor',
                data: {
                    id: id,
                    qdelete: 2
                }
            })
        }
        this.data.yanse.splice(dataset.index, 1)
        this.setData({
            yanse: this.data.yanse
        })
    },
    /**
     * 表单提交
     */
    //商品管理中的商品发布事件
    formSubmit(e) {
        var that = this
        var procedure = e.detail.value;
        procedure.storeId = parseFloat(wx.getStorageSync('shop').id)
        procedure.qstatus = procedure.qstatus ? 1 : 2
        procedure.isShow = procedure.isShow ? 1 : 2
        procedure.qviews = 0
        procedure.state = 1 //默认待审核 1
        procedure.guige = that.data.guige
        procedure.yanse = that.data.yanse
        procedure.goodsName = procedure.goodsName.replace(/\s/g, '');
        procedure.goodsDetails = procedure.goodsDetails.replace(/\s/g, '');
        console.log(procedure)
        if (util.expression.test(procedure.goodsName)) {
            wx.showToast({
                title: '名称包含非法字符',
                image: '/images/search_no.png',
                duration: 2000
            })
            return;
        }
        if (util.expression.test(procedure.goodsDetails)) {
            wx.showToast({
                title: '描述包含非法字符',
                image: '/images/search_no.png',
                duration: 2000
            })
            return;
        }
        if (isNaN(Number(procedure.qkucun)) || Number(procedure.qkucun) < 1 || procedure.qkucun.indexOf('.') != -1 || !procedure.qkucun.trim()) {
            wx.showToast({
                title: '商品库存有误',
                image: '/images/search_no.png',
                duration: 2000
            })
            return;
        }
        if (isNaN(Number(procedure.goodsCost)) || Number(procedure.goodsCost) < 0 || !procedure.goodsCost.trim()) {
            wx.showToast({
                title: '商品价格有误',
                image: '/images/search_no.png',
                duration: 2000
            })
            return;
        }
        if (!procedure.goodsName) {
            wx.showToast({
                title: '商品名未填写',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (that.data.specId == 0) {
            wx.showToast({
                title: '类别未选择',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        procedure.specId = that.data.specId
        if (!procedure.qkucun) {
            wx.showToast({
                title: '库存数量未填写',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        procedure.syNum = procedure.qkucun
        if (!procedure.goodsCost) {
            wx.showToast({
                title: '商品价格未填写',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (!procedure.guige[0]) {
            wx.showToast({
                title: '商品规格未填写',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (!procedure.yanse[0]) {
            wx.showToast({
                title: '商品颜色未填写',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (!procedure.goodsDetails) {
            wx.showToast({
                title: '商品描述未填写',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }

        if (that.data.imagesData.length == 0 || that.data.imagesData2.length == 0) {
            wx.showToast({
                title: '图片未上传',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        procedure.imgs = that.data.imagesData.join(',')
        procedure.lbImgs = that.data.imagesData2.join(',')
        // 视频 路径
        procedure.video = that.data.videoPath
        if (!that.data.qrtj) {
            that.setData({
                qrtj: true
            })
            http.request({
                url: '/insertQprocedure',
                data: procedure,
                success: function (e) {
                    procedure.guige.forEach(item => {
                        if (item != '') {
                            http.request({
                                url: '/insertQtype',
                                data: {
                                    qprocedureId: e,
                                    qtypeName: item.tpname,
                                    qprice: item.num,
                                }
                            })
                        }

                    })
                    procedure.yanse.forEach(item => {
                        if (item != '') {
                            http.request({
                                url: '/insertQcolor',
                                data: {
                                    qprocedureId: e,
                                    qtypeName: item.tpname
                                }
                            })
                        }
                        wx.showToast({
                            title: '添加成功',
                            icon: 'success',
                            duration: 2000
                        })
                        setTimeout(function () {
                            wx.navigateBack({
                                delta: 1
                            })
                            wx.hideLoading()
                        }, 2000)
                    })
                }
            })
        }
    },
    /**
     * 商品上下架
     */
    spsxj(e) {
        let id = e.detail.target.dataset.spid
        var that = this
        var procedure = e.detail.value
        procedure.id = id
        procedure.qstatus = procedure.qstatus ? 1 : 2
        procedure.state = 1;
        procedure.isShow = procedure.isShow ? 1 : 2
        procedure.guige = that.data.guige
        procedure.yanse = that.data.yanse
        if (isNaN(Number(procedure.goodsCost)) || Number(procedure.goodsCost) < 0 || !procedure.goodsCost.trim()) {
            wx.showToast({
                title: '商品价格有误',
                image: '/images/search_no.png',
                duration: 2000
            })
            return;
        }
        if (util.expression.test(procedure.goodsName)) {
            wx.showToast({
                title: '名称包含非法字符',
                image: '/images/search_no.png',
                duration: 2000
            })
            return;
        }
        if (util.expression.test(procedure.goodsDetails)) {
            wx.showToast({
                title: '描述包含非法字符',
                image: '/images/search_no.png',
                duration: 2000
            })
            return;
        }
        if (!procedure.goodsName) {
            wx.showToast({
                title: '商品名未填写',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (isNaN(Number(procedure.qkucun)) || Number(procedure.qkucun) < 1 || procedure.qkucun.indexOf('.') != -1 || !procedure.qkucun.trim()) {
            wx.showToast({
                title: '商品库存有误',
                image: '/images/search_no.png',
                duration: 2000
            })
            return;
        }
        if (!procedure.qkucun) {
            wx.showToast({
                title: '库存数量未填写',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (!procedure.guige[0]) {
            wx.showToast({
                title: '商品规格未填写',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (!procedure.yanse[0]) {
            wx.showToast({
                title: '商品颜色未填写',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (!procedure.goodsDetails) {
            wx.showToast({
                title: '商品描述未填写',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        if (that.data.imagesData.length == 0 || that.data.imagesData2.length == 0) {
            wx.showToast({
                title: '图片未上传',
                image: '/images/search_no.png',
                duration: 2000
            })
            return
        }
        procedure.specId = that.data.specId;
        procedure.imgs = that.data.imagesData.join(',')
        procedure.lbImgs = that.data.imagesData2.join(',')
        procedure.video = that.data.videoPath
        procedure.qprice = that.data.goodsCost ? that.data.goodsCost : procedure.goodsCost
        http.request({
            url: '/updateQprocedure',
            data: procedure,
            success: function (e) {
                http.request({
                    url: '/updateQprocedureType',
                    data: {
                        id: that.data.specId,
                        qposition: 2
                    },
                    success: function (e) {
                    }
                }, true);
                wx.showToast({
                    title: '保存成功',
                    icon: 'success',
                    duration: 2000
                });
                setTimeout(function () {
                    wx.hideLoading()
                    wx.navigateBack()
                }, 2000)
            }
        })
    },
    /**
     * 包邮
     */
    baoyou(e) {
        var by = e.detail.value
        this.setData({
            baoyou: by == 'false' ? false : true
        })
    },
    /**
     * 上传图片
     */
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
    //详情图的上传和数量的判断
    // 上传图片视频等文件，封装
    uploadFile: function (page, fileType) {
        if (fileType == 'image') {
            if (page.data.imagesData.length <= page.data.imgLimit) {
                wx.chooseImage({
                    count: page.data.imgLimit,
                    success: function (res) {
                        var tempFilePaths = res.tempFilePaths;
                        // tempFilePaths = tempFilePaths.slice(0, page.data.imgLimit - page.data.imagesData.length)
                        var tempFilesSize = res.tempFiles
                        tempFilePaths.forEach((item, index) => {
                            // if(!/.(gif|jpg|png)$/.test(item)){
                            //   return;
                            // }
                            // page.data.imagesData.push(index)
                            // page.data.images.push(index)
                            if (page.data.imagesData.length + tempFilePaths.length <= page.data.imgLimit) {
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
                                            // page.data.imagesData.push(data)
                                            // data = util.parseImgUrl(data)
                                            // page.data.images.push(data)
                                            page.data.imagesData.push(data)
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
        if (this.data.imagesData2.length <= 9) {
            var fileType = e.currentTarget.dataset.type
            // return
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
            if (page.data.imagesData2.length <= page.data.imgLimit2) {
                wx.chooseImage({
                    count: page.data.imgLimit2,
                    success: function (res) {
                        var tempFilePaths = res.tempFilePaths;
                        // tempFilePaths = tempFilePaths.slice(0, page.data.imgLimit2 - page.data.imagesData2.length)
                        var tempFilesSize = res.tempFiles
                        tempFilePaths.forEach((item, index) => {
                            if (page.data.imagesData2.length + tempFilePaths.length <= page.data.imgLimit2) {
                                util.showLoading({
                                    title: '上传中'
                                })
                                //判断用户上传的图片是否大于规格
                                if (tempFilesSize[index].size <= 1000000) { //图片小于或者等于2M时 可以执行获取图片
                                    wx.uploadFile({
                                        url: constant.host + '/file/onefile2',
                                        filePath: item,
                                        name: 'file',
                                        formData: {
                                            'user': 'sgyj'
                                        },
                                        success: function (res) {
                                            var data = res.data;
                                            if (data.substring(data.length - 1) == "\"") {
                                                data = data.substr(1, data.length - 2)
                                            }
                                            page.data.imagesData2.push(data)
                                            data = util.parseImgUrl(data)
                                            page.data.images2.push(data)
                                            page.setData({
                                                images2: page.data.images2
                                            });
                                            wx.hideLoading()
                                        }
                                    })
                                    //如果上传的图片大于规格则弹出提示
                                } else { //图片大于2M，弹出一个提示框
                                    wx.showToast({
                                        title: '上传图片不能大于1M!', //标题
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
    /**
     * 选择和上传视频
     */
    chooseAndUploadVideo: function (e) {
        // TODO: 限制视频大小
        var page = this;
        wx.chooseVideo({
            sourceType: ['album'], // ['album', 'camera'],
            compressed: true,
            // maxDuration: 10
            success: function (res) {
                const tempFilePath = res.tempFilePath;
                // 测试用代码 - 不上传显示本地视频
                // page.setData({ videoInCarousel: tempFilePath });
                if (!tempFilePath.endsWith(".mp4")) {
                    wx.showToast({
                        title: '上传视频只支持mp4文件', //标题
                        icon: 'none'                    //图标 none不使用图标，详情看官方文档
                    })
                    return
                }
                // 1048576 = 1024*1024
                if (res.size > 2097152) {
                    wx.showToast({
                        title: '上传视频不能大于2M!', //标题
                        icon: 'none'                  //图标 none不使用图标，详情看官方文档
                    })
                    return
                }
                util.showLoading({
                    title: '上传中'
                })
                const uploadTask = wx.uploadFile({
                    url: constant.host + '/file/onefile2',
                    filePath: tempFilePath,
                    name: 'file',
                    formData: {
                        'user': 'sgyj'
                    },
                    success: function (res) {
                        let data = res.data
                        if (data.substring(data.length - 1) == "\"") {
                            data = data.substr(1, data.length - 2)
                        }
                        page.data.videoPath = data
                        // 组装成完整url，parseImgUrl是bad name
                        data = util.parseImgUrl(data)
                        page.setData({videoInCarousel: data});
                    },
                    complete: function (res) {
                        wx.hideLoading()
                    }
                });
                //获取视频上传的进度
                uploadTask.onProgressUpdate((res) => {
                    const uploadProgress = res.progress;
                    if (uploadProgress < 100) {
                        // 坑2：wx.uploadFile本身有一个this，所以要通过外部var _this = this 把this带进来
                        page.setData({
                            uploadPercent: uploadProgress
                        });
                    } else if (uploadProgress === 100) {
                        page.setData({
                            uploadPercent: 50
                        });
                    }
                });
            }
        });
    },
    delVideo: function (e) {
        this.data.videoPath = '';
        this.setData({videoInCarousel: ''});
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
    }
})
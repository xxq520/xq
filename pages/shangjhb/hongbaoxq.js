//index.js
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
const time = require("../../utils/time.js");
var app = getApp();
Page({
    data: {
        imghost: constant.imghost,
        hbzs: 0
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log('页面参数', options)
        var that = this;
        that.setData({
            logo: options.logo,
            shopname: options.shopname,
        })
        http.request({
            url: '/getQhbdetails',
            data: {
                qid: options.qtype == 2 ? options.qid : '',
                tzId: options.qtype == 2 ? '' : options.qid,
                qtype: options.qtype,
                orderstr: 'order by time desc'
            },
            success: function (e) {
                e.forEach(function (item, index) {
                    console.log(item)
                    item.time = time.timeStamp(item.time)
                })
                if (e.length != 0) {
                    that.setData({
                            hbdetails: e,
                            hbzs: e[0].qnum == null ? 100 : e[0].qnum,
                            hbyq: e.length < e[0].qnum ? e.length : e[0].qnum
                        },
                        () => {
                            var num = (e[0].qnum == null ? 100 : e[0].qnum) - (e.length < e[0].qnum ? e.length : e[0].qnum);
                            if (num == 0 && e[0].qtype != 2) {
                                http.request({
                                    url: '/updateQhongbao',
                                    data: {
                                        id: options.qid,
                                        qstatus: 3,
                                    },
                                    success() {
                                    }
                                })
                            }
                        });
                }
            }
        })
        that.changeParentData()
    },
    changeParentData: function () {
        var pages = getCurrentPages(); //当前页面栈
        if (pages.length > 1) {
            var beforePage = pages[pages.length - 2]; //获取上一个页面实例对象
            beforePage.onShow(); //触发父页面中的方法
        }
    },
})
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
const constant = require("../../utils/constant.js");
const util = require("../../utils/util.js");
const qcreateTime = require("../../utils/time.js");

var app = getApp();
var arr='';
var yfk='';
var yfh='';
var ywc='';
var isTrue=[false,false,false,false]
Page({
  data: {
    tp: false,
    imghost: constant.imghost,
    luntan: 0,
    orders: '',
    yichufa: false,
    title:'',
    isLoading:true
  },

  onLoad: function(e) {
    if (e.tp != undefined) {
      wx.setNavigationBarTitle({
        title: '今日订单'
      })
      this.setData({
        tp: true,
      })
    }
    this.shuju()
  },
  shuju(options) {
    //判断如果点击的tab选项卡下的数据已经下载过的时候就不用重新请求加载
    if(!options){
      if(this.data.luntan==0&&this.data.orders){
        return
      }
      if(this.data.luntan==1&&this.data.orderstwo){
        return
      }
      if(this.data.luntan==2&&this.data.ordersthree){
        return
      }
      if(this.data.luntan==3&&this.data.ordersfour){
        return
      }
    }
    var that = this;
    that.setData({
      yichufa: false,
      isLoading:true,
      title:'正在加载...'
    });
    var nowDate = util.getNowDate().substring(0, 10);
    http.request({
      url: '/getQorder',
      data: {
        qshopid: wx.getStorageSync('shop').id,
        otherterm: that.data.tp ? ` and(qshopid=${wx.getStorageSync('shop').id}) and (qcreate_time LIKE '%${nowDate}%') and (qstatus = ${Number(that.data.luntan)+1}) and qdelete in (1,2)`: '' + `and (qstatus = ${Number(that.data.luntan)+1}) and qdelete in (1,2)`,
        // orderstr: that.data.tp ? "and (qcreate_time LIKE '%" + nowDate + "%')" : ''
        // qstatus: 2
      },
      success: function(e) {
        //判断是否是单件商品
        // if(that.data.luntan===0){
        //   if(that.data.tp){
        //     for (var i = 0; i < e.length; i++) {
        //       for(var j=0;j<e[i].length;j++){
        //         e[i][j].qcreateTime = e[i][j].qcreateTime.substring(0, 16);
        //         if (e[i][j].qprocedureName!=null) {
        //           if(e[i][j].qprocedureName.indexOf('【') != -1){
        //             var a = e[i][j].qprocedureName.split("【")
        //           }
        //         }
        //         e[i][j].qprocedureName = a[0]
        //         e[i][j].orderstr = a[1].split("】")[0] || '';
        //       }
        //     }
        //   }else{
        //     for (var i = 0; i < e.length; i++) {
        //       e[i].qcreateTime = e[i].qcreateTime.substring(0, 16);
        //       if (e[i].qprocedureName!=null) {
        //         if(e[i].qprocedureName.indexOf('【') != -1){
        //           var a = e[i].qprocedureName.split("【")
        //         }
        //       }
        //       e[i].qprocedureName = a[0]
        //       e[i].orderstr = a[1].split("】")[0] || '';
        //     }
        //   }
        // }else{
          //一个商家中包含多个订单
          for (var i = 0; i < e.length; i++) {
            //计算多个商品的合计价格
            var price=0;
            for(var j=0;j<e[i].length;j++){
              price+=e[i][j].qsum
              //字符串截取获取订单的创建时间
              e[i][j].qcreateTime = qcreateTime.timeStamp(e[i][j].qcreateTime);
              if (e[i][j].qprocedureName!=null) {
                  //截取获取订单的商品名称和截取规格
                if(e[i][j].qprocedureName.indexOf('【') != -1){
                  var a = e[i][j].qprocedureName.split("【")
                }
              }
              //设置购买的商品名称
              e[i][j].qprocedureName = a[0]
              //设置购买的规格
              e[i][j].orderstr = a[1].split("】")[0] || '';
            }
            //将一个商家中多个订单的总金额加起来放到多个订单中的第一个订单数据中
            //判断是否有使用优惠卷
            if(e[i].length>1){
              if(e[i][0].reducityMoney){
                e[i][0].hj=price-e[i][0].reducityMoney
              }else{
                e[i][0].hj=price
              }
            }else{
              e[i][0].hj=price
            }
          }
        // }
        //待付款商品数据
        if(that.data.luntan==0){
          //判断是否查询的今日订单的数据
          // if(that.data.tp){
          //   arr= e.slice(10,e.length);
          //   that.setData({
          //     orders:e.slice(0,10)||true,
          //     isLoading:false,
          //     title:"暂无更多..."
          //   })
          // }else {
            arr= e.slice(10,e.length);
            that.setData({
              orders:e.slice(0,10)||true,
              isLoading:false,
              title:"暂无更多..."
            })
          // }
          //已付款商品数据
        }else if(that.data.luntan==1){
          yfk= e.slice(10,e.length);
          that.setData({
            orderstwo:e.slice(0,10)||true,
            isLoading:false,
            title:"暂无更多..."
          })
          //已发货商品数据
        }else if(that.data.luntan==2){
          yfh= e.slice(10,e.length);
          that.setData({
            ordersthree:e.slice(0,10)||true,
            isLoading:false,
            title:"暂无更多..."
          })
          //已完成商品数据
        }else if(that.data.luntan==3){
          ywc= e.slice(10,e.length);
          that.setData({
            ordersfour:e.slice(0,10)||true,
            isLoading:false,
            title:"暂无更多..."
          })
        }
      }
    },true);
  },
  luntan(e) {
    var that=this
    this.setData({
      luntan: e.currentTarget.dataset.luntan,
    },()=>{
      if(that.data.luntan==0){
        if(arr.length){
          that.setData({
            isLoading:true,
            title:"正在加载..."
          });
        }
      }
      if(that.data.luntan==1){
        if(yfk.length){
          that.setData({
            isLoading:true,
            title:"正在加载..."
          });
        }
      }
      if(that.data.luntan==2){
        if(yfh.length){
          that.setData({
            isLoading:true,
            title:"正在加载..."
          });
        }
      }
      if(that.data.luntan==3){
        if(ywc.length){
          that.setData({
            isLoading:true,
            title:"正在加载..."
          });
        }
      }
    })
    this.shuju();
  },
  phone(e) {
    if (e.currentTarget.dataset.phone != null) {
      wx.makePhoneCall({
        phoneNumber: e.currentTarget.dataset.phone
      })
    } else {
      wx.showToast({
        title: '未填写电话',
        image: '/images/search_no.png',
        duration: 2000
      })
    }

  },
  weixin() {
    wx.showToast({
      title: '暂未开放',
      image: '/images/search_no.png',
      duration: 2000
    })
  },
  //确认发货事件
  fahuo(e) {
    // return
    var qcode = e.currentTarget.dataset.qcode;
    var arr='';
    //判断确认收货的是否是多个商品
    if(qcode.length){
      for(var i=0;i<qcode.length;i++){
        arr+=qcode[i].id+','
      }
    }
    var that = this;
    that.setData({
      yichufa: true
    });
    //将多个订单的确认收货通过拼接id发送给服务器
      http.request({
        url: '/NewupdateQorder',
        data: {
          id: arr.slice(0,arr.length-1),
          status: 3,
          //设置7天后自动确认收货
          time:7
          // qstatus: qcode == 1 ? 3 : 4
        },
        success: function(e) {
            wx.showToast({
              title: '发货成功',
              icon: 'success',
              duration: 2000
            });
            that.shuju(true)
            setTimeout(function() {
              wx.hideLoading();
            }, 2000)
        }
      });
  },
  wode() {
    wx.redirectTo({
      url: '/pages/pics/pics',
    })
  },
  shouye() {
    wx.redirectTo({
      url: '/pages/booszy/booszy',
    })
  },
  //当页面触发触底操作的时候执行的函数
  onReachBottom(){
    //保存待付款中的数据
    var that=this;
    //判断是否是待付款的触底操作
    if(this.data.luntan==0){
      this.upDate(0,'orders',this.data.orders,arr);
    }
    //判断是否是已付款的触底操作
    if(this.data.luntan==1){
      this.upDate(1,'orderstwo',this.data.orderstwo,yfk);
    }
    //判断是否是已发货的触底操作
    if(this.data.luntan==2){
      this.upDate(2,'ordersthree',this.data.ordersthree,yfh);
    }
    //判断是否是已完成的触底操作
    if(this.data.luntan==3){
      this.upDate(3,'ordersfour',this.data.ordersfour,ywc);
    }
  },
  upDate(num,key,value,sjy){
    var that=this
    if(!isTrue[num]){
      this.setData({
        isLoading:true,
        title:"正在加载..."
      });
    }
    if(!sjy.length){
      isTrue[num]=true;
      this.setData({
        title:"暂无更多...",
        //在页面中关闭加载动画
        isLoading:false,
      })
    }
    setTimeout(()=>{
      that.setData({
        //在当前的数据上加上新的触底数据
        [key]:value.concat(sjy.splice(0,10))
      });
    },150)
  }
});
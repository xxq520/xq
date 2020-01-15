const notification = require('../../utils/notification.js');
const storage = require("../../utils/storage.js");
const http = require("../../utils/http.js");
// const Quantity = require('../../component/quantity/index');
const constant = require("../../utils/constant.js");
const util = require('../../utils/util.js');
var app = getApp();
//用来保存商家的全选按钮是否选中
var arr=[];
var timer=''
//商品的总数、
Page({
  data: {
    //是删除还是结算
    edit:true,
    host: constant.imghost,
    //保存商品的总数量
    sum:0,
    //保存每个商家的选中状态
    arr:[],
    //商品的总价格
    sumPrice:0,
    //商品列表
    orderList1:[],
    orderListOld:[],
    //全选按钮状态
    checkAll:false,
    //是否显示转圈圈动画
    loading:true
  },
  onShow: function() {
    if(this.data.loadNum===2){
      this.onLoad();
    }
    this.setData({
      sumPrice:0,
      loadNum:2
    })
  },
  //点击去逛逛的时候跳转至首页
  goIndex(){
      wx.switchTab({
          url: '/pages/index/index'
      })
  },
  //点击编辑按钮事件
  edit(){
    var that=this
    this.setData({
      edit:!that.data.edit,
    });
    if(this.data.checkAll||this.data.edit){
      for(var i=0;i<this.data.orderList1.length;i++){
        var array=[]
        //让每一个商家的选中状态都为不选中
        array[i]=false
        for(var j=0;j<this.data.orderList1[i].length;j++){
          //判断是否是当前点击的商家的商品订单
          var subarr = "orderList1["+i+"]["+j+"].isTrue";
          that.setData({
            [subarr]:false,
            arr:array,
            checkAll:false
          });
        }
      }
    }
    this.sumPrice()
  },
  //点击结算按钮事件
  jiesuan(){
      var that=this
    //存储用户勾选的商品
    var arr=[];
    var newarr=[]
    var ids=['null'];
    var proid=[]
    for(var i=0;i<this.data.orderList1.length;i++){
      for(var j=0;j<this.data.orderList1[i].length;j++){
        if(this.data.orderList1[i][j].isTrue){
          arr.push(this.data.orderList1[i][j])
          ids.push(Number(this.data.orderList1[i][j].qprocedureId))
          newarr.push(Number(this.data.orderList1[i][j].id))
          proid.push(Number(this.data.orderList1[i][j].qprocedureId))
        }
      }
    }
    if(!arr.length){
      util.showFailToast({
        title: '请选择购买商品'
      });
    }else{
      //请求接口判断商品的库存是否充足

      http.request({
            url: '/close',
            data: {
              orderId:JSON.stringify(proid)
            },
            success: function(e) {
                //当所有的订单都是可以下单的话就跳转至订单详情页面结算
                that.closeOrder(ids,arr,newarr)
            }
      })
    }
  },
   closeOrder(ids,arr,newarr){
        function tos(arr){
            wx.hideLoading()
            setTimeout(()=>{
                util.showFailToast({
                    title:arr+'库存不足'
                });
            })
            setTimeout(()=>{
                wx.hideToast()
            },2000)
        }
       http.request({
           url: '/getQprocedure_shopping_cart',
           data: {
               id:JSON.stringify(ids)
           },
           success: function(e) {
               //循环对比每个商品的总件数和库存对比
               var isTrue=true
               for(var i=0;i<arr.length;i++){
                   for(var j=0;j<e.length;j++){
                       if(arr[i].qprocedureId==e[j].id){
                           //qkucun-syNum就是该商品的真实剩余数量
                           var qtotal=0;
                           var oneOrder=arr.filter(function (item,index) {
                             if(item.qprocedureId==arr[i].qprocedureId){
                               qtotal+=item.qtotal
                             }
                             return item.qprocedureId==arr[index].qprocedureId
                           })
                           console.log(qtotal)
                           if(qtotal>e[j].qkucun-e[j].syNum){
                               isTrue=false
                               setTimeout(()=>{
                                   //调用提示函数提示用户那件商品库存不足
                                   tos(arr[i].qprocedureName)
                               },40)
                               return
                           }
                       }
                   }
               }
               //如果商品的库存都判断充足
               if(isTrue){
                   for(let i=0;i<arr.length;i++){
                       http.request({
                           url: '/updateQorder',
                           data: {
                               id: arr[i].id,
                               qtotal:arr[i].qtotal,
                               qsum:arr[i].cost?arr[i].cost*arr[i].qtotal:arr[i].danjia*arr[i].qtotal
                           },
                           success: function (e) {
                             if(i==arr.length-1){
                               wx.navigateTo({
                                 url: '/pages/order/check?id=' + newarr.join(',') + '&xiadan=1',
                               })
                             }
                           }
                       },true)
                   }
               }
           }
       },true);
   },
  //加事件
  sup(e){
    var that=this
    //保存当前的商家的下标
    var index=e.currentTarget.dataset.index;
    //保存当前商品在该商家订单中的下标
    var parindex=e.currentTarget.dataset.par;
    var arr = "orderList1["+parindex+"]["+index+"].qtotal";
    this.setData({
      [arr]:that.data.orderList1[parindex][index].qtotal+1
    },()=>{
      that.changeOrder(e.currentTarget.dataset.id,that.data.orderList1[parindex][index].qtotal)
    });
    this.sumPrice()
  },
  changeOrder(id,num){
    // clearTimeout(timer)
    // timer=setTimeout(()=>{
      http.request({
        url: '/updateQorder',
        data: {
          id:id,
          // qshopid: shopid,
          qtotal: num
        },
        success: function(e) {

        }
      },true)
    // },300)
  },
  //减事件
  sub(e){
    var that=this
    //保存当前的商家的下标
    var index=e.currentTarget.dataset.index;
    //保存当前商品在该商家订单中的下标
    var parindex=e.currentTarget.dataset.par;
    var arr = "orderList1["+parindex+"]["+index+"].qtotal";
    this.setData({
      [arr]:that.data.orderList1[parindex][index].qtotal-1<=0?1:that.data.orderList1[parindex][index].qtotal-1
    },()=>{
      that.changeOrder(e.currentTarget.dataset.id,that.data.orderList1[parindex][index].qtotal)
    });
    this.sumPrice()
  },
  //点击商家选中事件
  sjcheck(e){
    //获取到商家在页面中渲染的下标
    var index=e.currentTarget.dataset.index;
    var that=this;
    var arr = "arr["+index+"]";
    if(this.data.edit) {
      for (var i = 0,l =this.data.orderList1.length;i<l;i++) {
        for (var j = 0,m=this.data.orderList1[i].length; j < m; j++) {
          //判断是否是当前点击的商家的商品订单
          if (i != index) {
            that.data.arr[i]=false;
            that.data.orderList1[i][j].isTrue=false;
          }
        }
      }
    }
    that.setData({
     arr: that.data.arr,
      orderList1: that.data.orderList1
    });
    this.setData({
      [arr]:!that.data.arr[index]
    });
    //点击商家选中按钮让其下面的所有的商品的选中状态和其一致
    for(var i=0;i<this.data.orderList1[index].length;i++){
      var arr = "orderList1["+index+"]["+i+"].isTrue";
      this.setData({
        [arr]:that.data.arr[index]
      })
    }
    //执行结算价格
    this.sumPrice()
  },
  //点击商品选中事件
  spcheck(e){
    //保存当前的商家的下标
    var index=e.currentTarget.dataset.index;
    //保存当前商品在该商家订单中的下标
    var parindex=e.currentTarget.dataset.par;
    var arr = "orderList1["+parindex+"]["+index+"].isTrue";
    var that=this;
    //循环取消其他不同商家订单中商品的选中状态为不选中
    if(this.data.edit){
      for(var i=0;i<this.data.orderList1.length;i++){
        var array=[];
        //让每一个商家的选中状态都为不选中
        array[i]=false;
        for(var j=0;j<this.data.orderList1[i].length;j++){
          //判断是否是当前点击的商家的商品订单
          if(i!=parindex){
            var subarr = "orderList1["+i+"]["+j+"].isTrue";
            that.setData({
              [subarr]:false,
              arr:array
            });
          }
        }
      }
    }
    //设置当前点击商品的选中状态
    this.setData({
      [arr]:!this.data.orderList1[parindex][index].isTrue
    });
    var isTrue=true;
    for(var i=0;i<this.data.orderList1[parindex].length;i++){
      if(!this.data.orderList1[parindex][i].isTrue){
        isTrue=false
      }
    }
    //判断如果用户选中当前商家中的所有的订单的话，就让商家的选中按钮为true
    var newarr="arr["+parindex+"]";
    this.setData({
      [newarr]:isTrue,
    });
    //执行结算价格
    this.sumPrice()
  },
  //点击全选事件
  // checkAll(){
  //   var that=this;
  //   that.setData({
  //     checkAll:!this.data.checkAll
  //   });
  //   for(let i=0;i<this.data.orderList1.length;i++){
  //     var arr = "arr["+i+"]";
  //     for(let j=0;j<this.data.orderList1[i].length;j++){
  //       var subarr = "orderList1["+i+"]["+j+"].isTrue";
  //       that.setData({
  //         [subarr]:that.data.checkAll,
  //         [arr]:that.data.checkAll
  //       })
  //     }
  //   }
  // },
  //点击删除事件
  del(){
    var that=this;
    var arr=[];
    for(let i=0;i<this.data.orderList1.length;i++){
      for(let j=0;j<this.data.orderList1[i].length;j++){
        if(that.data.orderList1[i][j].isTrue){
          arr.push(that.data.orderList1[i][j].id)
        }
      }
    }
    if(arr[0]){
      wx.showModal({
        title: '确认删除',
        content: '确认删除所选商品',
        success (res) {
          if (res.confirm) {
            delOrder(arr)
          } else if (res.cancel) {
          }
        }
      });
    }
    function delOrder(id){
      http.request({
        url: '/deleteQorder_shopping_cart',
        data: {
          id:id.toString()
        },
        success: function(e) {
          var newarr=that.data.orderList1
          var arr=[]
          for(let i=0;i<newarr.length;i++){
            arr[i]=false
            for(let j=0;j<newarr[i].length;j++){
              if(newarr[i][j].isTrue){
                newarr[i].splice(j,1);
                j=j-1
              }
            }
            //判断是否在商品中存在空数组
            if(newarr[i][0] == undefined) {
              newarr.splice(i,1);
              i = i - 1;
            }
          }
          that.setData({
            orderList1:newarr,
            arr:arr
          },()=>{
            that.sum()
          })
        }
      },true);
    }
  },
  onLoad: function(option) {
    var that=this
    http.request({
      url: '/getQorder',
      data: {
        qsubmitter: getApp().globalData.userOpen.openid,
        // qshopid: shopid,
        qstatus: 7
      },
      success: function(e) {
        // e=e.data
        var sum=0;
        for (var i = 0; i < e.length; i++) {
          var a = ''
          arr[i]=false
          for(var j=0;j<e[i].length;j++){
            sum+=1
            //设置每件商品的初始化的购买的数量
            //设置商品订单的是否选中的状态
            e[i][j].isTrue=false
            if (e[i][j].qprocedureName != null) {
              if (e[i][j].qprocedureName.indexOf('【') != -1) {
                a = e[i][j].qprocedureName.split("【")
              } else {
                a = e[i][j].qprocedureName;
              }
              e[i][j].danjia=e[i][j].cost?e[i][j].cost*e[i][j].qtotal:e[i][j].qsum/e[i][j].qtotal
              e[i][j].qprocedureName = a[0] || e[i][j].qprocedureName;
              e[i][j].orderstr = a[1].split("】")[0]
            }
            //判断如果数据未空的话就显示购物车中暂无商品去逛逛
            if(!e.length){
              that.setData({
                loading:false
              })
            }
          }
        }
        that.setData({
          dd1: e.length == 0 ? true : false,
          orderList1: e,
          sum:sum,
          arr:arr
        },()=>{
          //当数据请求完成的时候关闭转圈的动画
          that.setData({
            loading:false
          })
        });
      }
    },true);
    this.sumPrice()
  },
  //计算商品的总价格
  sumPrice(){
    var that=this;
    var sum=0;
    //循环每一个商家
    for(var i=0,l=this.data.orderList1.length;i<l;i++){
      //因为多个订单支付是不支持不同商家多个订单的
      //循环商家中的每一个商品
      for(var j=0,m=this.data.orderList1[i].length;j<m;j++){
        //判断每一个订单商品的状态是否为选中的状态
        if(this.data.orderList1[i][j].isTrue){
          //获取商品的单价
          if(this.data.orderList1[i][j].cost){
            sum+=that.data.orderList1[i][j].qtotal*that.data.orderList1[i][j].cost
          }else{
            var danjia=this.data.orderList1[i][j].qsum/this.data.orderList1[i][j].qtotal;
            sum+=that.data.orderList1[i][j].qtotal*that.data.orderList1[i][j].danjia
          }
         }
      }
    }
    that.setData({
      sumPrice:sum
    })
  },
  onReady: function() {
  },
  sum(){
    var sum=0;
    var e=this.data.orderList1
    for (var i = 0; i < e.length; i++) {
      for(var j=0;j<e[i].length;j++){
        sum+=1
      }
    }
    this.setData({
      sum:sum,
    });
  },
});
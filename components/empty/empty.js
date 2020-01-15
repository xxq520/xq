var EmptyConstant = require("./constant/EmptyConstant.js");
Component({
  properties: {
    emptyType: {
      type: Number,
      value: EmptyConstant.content
    },
    loadingTransparent: {
      type: Boolean,
      value: true
    },
    //自定义弹出层的图片地址
    imgLayouSrc:{
      type:String
    },
    //自定义弹出层的文字标题
    titleLayou:{
      type:String
    },
    //自定义弹出层的按钮是否显示
    hideBtn:{
      type:Boolean
    }
  },
  ready(){
    var that=this;
    //判断是否显示重新加载按钮
    if(!this.properties.hideBtn){
      this.setData({
        //自定义请求时弹出层的图片和文字
        customLayoutData: {
          emptyType:"custom",
          //自定义弹出层图片的url地址
          src:that.properties.imgLayouSrc,
          //自定义弹出层提示文字
          prompt:that.properties.titleLayou,
          btnPrompt: "重新加载"
        }
      })
    }else{
      this.setData({
        //自定义请求时弹出层的图片和文字
        customLayoutData: {
          emptyType:"custom",
          //自定义弹出层图片的url地址
          src:that.properties.imgLayouSrc,
          //自定义弹出层提示文字
          prompt:that.properties.titleLayou,
        }
      })
    }
  },
  data: {
    error: EmptyConstant.error,
    empty: EmptyConstant.empty,
    loading: EmptyConstant.loading,
    content: EmptyConstant.content,
    //请求时弹出层的为请求出错的样式
    errorLayoutData: {
      emptyType: EmptyConstant.error,
      src: "../empty/res/image/icon_empty_error.png",
      prompt: "加载出错了...",
      btnPrompt: "重新加载"
    },
    //请求时弹出层为数据为空样式
    emptyLayoutData: {
      emptyType: EmptyConstant.empty,
      src: "",
      prompt: "数据为空...",
      btnPrompt: "重新加载"
    },
    //定义请求时弹出层的为加载状态
    loadingLayoutData: {
      emptyType: EmptyConstant.loading,
      src: "../empty/res/image/icon_empty_loading.png",
      prompt: "加载中...",
      btnPrompt: null
    }
  },
  methods: {
    // 空布局中点击回调， 如点击重新加载按钮
    emptyCallback: function (event) {
      var emptyType = event.currentTarget.dataset.type;
      var emptyEventDetail = { emptyType: emptyType }
      var emptyEventOption = {}
      this.triggerEvent("emptyevent", emptyEventDetail, emptyEventOption)
    }

  }
})
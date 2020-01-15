Page({
  /*** 页面的初始数据*/
  data: {
    ggxq: []
  },
  onLoad: function(options) {
    if (options.ggxq != undefined) {
      const ggxq = JSON.parse(options.ggxq);
      this.setData({
        ggxq: ggxq
      })
    }
    console.log('页面参数', this.data.ggxq)
  },
})
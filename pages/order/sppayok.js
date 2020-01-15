Page({
    data: {
        //当用户是到店自取的时候使用的收货地址
        address: ""
    },
    onLoad: function (e) {
        console.log(e)
        if (e.order != undefined) {
            const order = JSON.parse(e.order);
            this.setData({
                order: order,
                address: e.address,
                user: wx.getStorageSync('user')
            })
        }
        if (e.id) {
            this.setData({
                id: e.id.split(',')
            })
        }
        if (e.yhq) {
            this.setData({
                yhq: JSON.parse(e.yhq)
            })
        }
    },
    shouye() {
        wx.switchTab({
            url: '/pages/index/index',
        })
    },
    chakan(e) {
        var that = this;
        if (this.data.id) {
            var arr = [];
            for (var i = 0; i < that.data.id.length; i++) {
                if (Number(that.data.id[i])) {
                    arr.push(that.data.id[i])
                }
            }
            console.log(arr)
            var yhq = that.data.yhq ? JSON.stringify(that.data.yhq) : ''
            wx.redirectTo({
                url: '/pages/order/check?id=' + arr.join(',') + '&yhq=' + yhq
            })
        } else {
            var yhq = that.data.yhq ? JSON.stringify(that.data.yhq) : ''
            wx.redirectTo({
                url: '/pages/order/check?id=' + e.currentTarget.dataset.id + '&yhq=' + yhq
            })
        }
    }
})
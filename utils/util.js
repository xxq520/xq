const constant = require("./constant.js");
const storage = require("./storage.js");

function showLoading(config) {
  wx.showLoading({
    title: config.title,
    mask: true
  })
}
//校验姓名
function isName(name) {
  var rgx = /^[\u4e00-\u9fa5]+|[A-Za-z]+|[\u4e00-\u9fa5]+$/
  if (!rgx.test(name)) {
    return false;
  }
  return true;
}
/**
 * 校验手机号
 */
function isPhone(phone) {
  var re = /(^(\d{2,4}[-_－—]?)?\d{3,8}([-_－—]?\d{3,8})?([-_－—]?\d{1,7})?$)|(^0?1[35]\d{9}$)/;
  if (phone.length == 11) {
    if (!(/^1\d{10}$/.test(phone))) {
      console.log('手机号错误')
      return false;
    }
  } else {
    if (!(/^((0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/).test(phone)) {
      console.log('固话号错误')
      return false;
    }
  }
  return true;
}


function parseImgUrl(data) {
  // console.log(data)
  if (data.length > 0 && data instanceof Array) {
    data = data.map(item => {
      return constant.imghost + item
    })
    // console.log(data)
    return data
  } else {
    return constant.host + '/img/' + data
  }
}



function showSuccessToast(config) {
  wx.showToast({
    title: config.title,
    icon: 'success',
    mask: true,
    duration: 2000,
    success: config.success
  });
}

function showFailToast(config) {
  setTimeout(()=>{
    wx.showToast({
      title: config.title,
      icon: "none"
    })
  },10)
  // wx.showToast({
  //   title: config.title,
  //   image: '/images/search_no.png',
  //   // mask: true,
  //   duration: 2000,
  //   // success: config.success
  // });
  setTimeout(function() {
    wx.hideToast()
  }, 2000);
}
/**
 * 获取当前时间
 */
function getNowDate() {
  var date = new Date();
  var sign1 = "-";
  var sign2 = ":";
  var year = date.getFullYear() // 年
  var month = date.getMonth() + 1; // 月
  var day = date.getDate(); // 日
  var hour = date.getHours(); // 时
  var minutes = date.getMinutes(); // 分
  var seconds = date.getSeconds() //秒
  var weekArr = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期天'];
  var week = weekArr[date.getDay()];
  // 给一位数数据前面加 “0”
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (day >= 0 && day <= 9) {
    day = "0" + day;
  }
  if (hour >= 0 && hour <= 9) {
    hour = "0" + hour;
  }
  if (minutes >= 0 && minutes <= 9) {
    minutes = "0" + minutes;
  }
  if (seconds >= 0 && seconds <= 9) {
    seconds = "0" + seconds;
  }
  var currentdate = year + sign1 + month + sign1 + day + ' ' + hour + sign2 + minutes + sign2 + seconds;
  return currentdate;
}


/**
 * 获取指定天数后的日期
 */
function DateAdd(sDate, days) {
  var arr = sDate.split(/[- : \/]/)
  var sdate = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5])
  sdate = sdate.valueOf();
  sdate = sdate + days * 24 * 60 * 60 * 1000;
  sdate = new Date(sdate);
  var year = sdate.getFullYear(); //年  
  var month = sdate.getMonth() + 1; //月  
  var day = sdate.getDate(); //天  
  if (day < 10) {
    day = "0" + day;
  }
  if (month < 10) {
    month = "0" + month;
  }
  var returnDate = year + "-" + month + "-" + day;
  return returnDate;
}
/**
 * 防止多次触控
 */
function throttle(fn, gapTime) {
  if (gapTime == null || gapTime == undefined) {
    gapTime = 1500
  }

  let _lastTime = null

  // 返回新的函数
  return function() {
    let _nowTime = +new Date()
    if (_nowTime - _lastTime > gapTime || !_lastTime) {
      fn.apply(this, arguments) //将this和参数传给原函数
      _lastTime = _nowTime
    }
  }
}
/**
 * 领取随机红包
 */
function sjhb(hbsum, hbnum, num) {
  console.log('红包金额', hbsum, hbnum, num)
  //hbsum=100 hbnum=20 num=2
  var pj = hbsum / hbnum //平均数 5
  //console.log('平均数', pj)
  var sjhb = (Math.random() * pj * 0.9).toFixed(2)
  if (hbnum < 10) {
    var sj = Math.random()
    if (sj > 0.5) {
      sjhb = pj + parseFloat(sjhb)
    } else(
      sjhb = pj - parseFloat(sjhb)
    )
  } else {
    if (pj == 0.01) {
      sjhb = 0.01
    } else {
      // console.log('随机', sjhb)
      if (num % 10 != 0) {
        var sj = Math.random()
        if (sj > 0.5) {
          sjhb = pj + parseFloat(sjhb)
        } else(
          sjhb = pj - parseFloat(sjhb)
        )
      };
    }
  }
  //  console.log('红包金额', sjhb)
  return sjhb

}
// 获取图片的 w，h
function getImgInfo(src, callback) {
  wx.getImageInfo({
    src: src,
    success(res) {
      console.log(res)
      callback && callback(res)
      return res
    }
  })
}
// 获取能在图片中按对应比例能够截取的最大尺寸
// 传入图片地址和需要展示的尺寸
// 获取能在图片中按对应比例能够截取的最大尺寸
// 传入图片地址和需要展示的尺寸
function getImgFromSize(src, w, h) {
  return new Promise((resolve, reject) => {
    let size = {}
    getImgInfo(src, (res) => {
      const imgW = res.width
      const imgH = res.height
      console.log(imgW, imgH)
      let maxWidth = ''
      let maxHeight = ''
      let dx = ''
      let dy = ''
      if ((imgW / imgH) > (w / h)) {
        // 在比例上，原始图片的宽度多出
        // 所以根据较短的一边来计算，按照高度imgH来计算最终截取尺寸
        maxWidth = imgH / h * w
        maxHeight = imgH
        dx = (imgW - maxWidth) / 2
        dy = 0
      } else {
        // 在比例上，原始图片的高度多出
        // 所以根据较短的一边来计算，按照宽度imgW来计算最终截取尺寸
        maxWidth = imgW
        maxHeight = imgW / w * h
        dx = 0
        dy = (imgH - maxHeight) / 2
      }
      resolve({
        maxWidth,
        maxHeight,
        dx,
        dy
      })
    })
  })
}
module.exports = {
  isName: isName,
  isPhone: isPhone,
  showSuccessToast: showSuccessToast,
  showFailToast: showFailToast,
  showLoading: showLoading,
  DateAdd: DateAdd,
  getNowDate: getNowDate,
  parseImgUrl: parseImgUrl,
  throttle: throttle,
  sjhb: sjhb,
  getImgFromSize: getImgFromSize,
  time:"'2019-12-25'",
  expression:/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g
};
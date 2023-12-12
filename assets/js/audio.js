/**
 * @name: audio
 * @description：audio
 * @author: wangxiui
 * @date: 2023/12/9 10:06
 */
function browserRedirect() {
  var sUserAgent = navigator.userAgent.toLowerCase();
  var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
  var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
  var bIsMidp = sUserAgent.match(/midp/i) == "midp";
  var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
  var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
  var bIsAndroid = sUserAgent.match(/android/i) == "android";
  var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
  var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
  var win_width = $(window).width();

  if (!bIsIphoneOs && !bIsMidp && !bIsUc7 && !bIsUc && !bIsAndroid && !bIsCE && !bIsWM && win_width) {
    $("html").css("font-size", "100px");
    $("html").css("max-width", "640px");
    $("html").css("margin", "0 auto");
    device = "pc";
  } else {
    var size = $(window).width() / 6.4;
    $("html").css("font-size", size);
    device = "mobile";
  }
}
browserRedirect();


if (document.body.clientWidth / document.body.clientHeight < 375 / 660) {
  $(".track").css({ "margin-top": 1.1 * document.body.clientHeight / 660 + "rem" });
}

let isDev = false;
let audio = document.getElementById("audio1");
//vue
var app = new Vue({
  el: '#app',
  data: {
    model: {},
    list: [],
    currGroupIndex: 0,
    currGroupItem: null,
    currIndex: 0,
    currItem: {},
    playMode: 0,
    rate: 1,//播放速度
    timing: 0,//定时时长
    duration: 0,
    isPlaying: false,
    icon: {
      play: "play.png"
    },
    query: {
      blid: '',
      bqcgid: '',
      bqcid: '',
    }

  },
  mounted: function () {
    //console.log(location.pathname)
    //let pn = location.pathname.split('/')
    //console.log(pn)
    //if (pn[1] == 'g') {
    //    this.query.bqcgid = pn[2]
    //} else if (pn[1] == 'b') {
    //    this.query.blid = pn[2]
    //} else if (pn[1] == 'qr') {
    //    this.query.bqcid = pn[2]
    //}
    this.query.blid = getQueryStringByName("blid")
    this.query.bqcgid = getQueryStringByName("bqcg_id")
    this.query.bqcid = getQueryStringByName("bqc_id") || "20301"
    this.getList();
  },
  methods: {
    getList: function () {
      let url = `/api/ashx/qrList.ashx?blid=${this.query.blid}&bqcg_id=${this.query.bqcgid}&bqc_id=${this.query.bqcid}`;
      let _this = this
      $.ajax({
        url,
        data: null,
        type: 'GET',
        dataType: 'JSON'
      }).done(function (r) {
        _this.model = r.data.model
        for (let item of r.data.list) {
          for (let ii of item.listBookQrCode) {
            _this.formatSrc(ii)
          }
        }
        _this.list = r.data.list
        _this.init()
        _this.setCurrItem(_this.currIndex)

      })
    },
    init() {
      if (this.query.blid) {
        this.currGroupIndex = 0
        this.currGroupItem = this.list[this.currGroupIndex]
        this.currIndex = 0
        this.currItem = this.list[0].listBookQrCode[0]
        return
      }
      if (this.query.bqcgid) {
        for (const i in this.list) {
          let item = this.list[i]
          if (this.query.bqcgid == item.bookQrCodeGroup.bqcg_id) {
            this.currGroupIndex = parseInt(i)
            this.currGroupItem = this.list[this.currGroupIndex]
            this.currIndex = 0
            this.currItem = this.list[this.currGroupIndex].listBookQrCode[this.currIndex]
            return
          }
        }
      }
      if (this.query.bqcid) {
        for (const i in this.list) {
          let item = this.list[i]
          for (const ii in item.listBookQrCode) {
            if (item.listBookQrCode[ii].bqc_id == this.query.bqcid) {
              this.currGroupIndex = parseInt(i)
              this.currGroupItem = this.list[this.currGroupIndex]
              this.currIndex = parseInt(ii)
              this.currItem = this.list[this.currGroupIndex].listBookQrCode[this.currIndex]
              return
            }
          }
        }
      }
    },
    formatSrc(f) {
      let src = "https://hldqrcode1.oss-cn-shanghai.aliyuncs.com/wapaudio/"
      let no = this.model.blNo.replace(/-/g, "")
      no = no.substr(no.length - 5)
      f.bqc_content = `${src}${no}/${f.bqc_no}.mp3`
    },
    prevGroup() {
      if (this.currGroupIndex == 0) {
        this.currGroupIndex = this.list.length - 1
      }
      else {
        this.currGroupIndex--
      }
      this.currGroupItem = this.list[this.currGroupIndex]
      this.setCurrItem(0)
    },
    nextGroup() {
      if (this.currGroupIndex == this.list.length - 1) {
        this.currGroupIndex = 0
      }
      else {
        this.currGroupIndex++
      }
      this.currGroupItem = this.list[this.currGroupIndex]
      this.setCurrItem(0)
    },
    setCurrItem: function (i) {
      console.log('curr' + i)
      let _this = this
      if (i < 0) {
        i = 0
      }
      if (i > this.currGroupItem.listBookQrCode.length) {
        i = this.currGroupItem.listBookQrCode.length - 1
      }
      //显示
      this.currIndex = i
      this.currItem = this.currGroupItem.listBookQrCode[i]
      //音频
      //audio.src = `mp3/${i}.wav`
      audio.src = this.currItem.bqc_content
      audio.playbackRate = this.rate;
      audio.load()
      this.play()

      //计数
      $.ajax({
        url: `/api/erweima/updateClick.ashx`,
        data: { "blId": this.currItem.blId, "bqc_id": this.currItem.bqc_id }
      });
    },
    play() {
      let _this = this
      audio.oncanplay = function () {
        _this.duration = transTime(audio.duration)
      }

      let p = audio.play()
      audio.playbackRate = this.rate;
      if (p !== undefined) {
        p.then(() => {
          _this.isPlaying = true
        });
      } else {
        _this.isPlaying = true
      }

    },
    changeSpeed(i) {
      this.rate = i
      audio.playbackRate = this.rate;
    },
    setTiming(i) {
      this.timing = i
    },
    playOrPause() {
      console.log("当前状态", this.isPlaying)
      //播放与暂停
      if (this.isPlaying) {
        this.isPlaying = false
        audio.pause()
      } else {
        this.play()

      }
    }
  },
  watch: {
    isPlaying(b) {
      if (b) {
        this.icon.play = "pause.png"
      } else {
        this.icon.play = "play.png"
      }
    }
  }
});

//弹框
$(".play_top>div").click(function () {
  let target = $(this).data('target');
  $(".tan").hide();
  $("#tan_" + target).show();
});
$(".tan").click(function () {
  $(".tan").hide();
});


//播放模式切换
$("#but_mode_single").click(function () {
  if (app.playMode === 1) {
    return
  }
  app.playMode = 1
  $(this).attr("src", "assets/img/inco_04b.png")
  $("#but_mode_order").attr("src", "assets/img/inco_05.png")
});

$("#but_mode_order").click(function () {
  if (app.playMode === 0) {
    return
  }
  app.playMode = 0
  $(this).attr("src", "assets/img/inco_05b.png")
  $("#but_mode_single").attr("src", "assets/img/inco_04.png")
});


initAudioEvent();

function initAudioEvent() {

  // 监听音频播放时间并更新进度条
  audio.addEventListener('timeupdate', function () {
    updateProgress(audio);
  }, false);

  // 监听播放完成事件
  audio.addEventListener('ended', function () {
    audioEnded();
  }, false);


  // 点击进度条跳到指定点播放
  // PS：此处不要用click，否则下面的拖动进度点事件有可能在此处触发，此时e.offsetX的值非常小，会导致进度条弹回开始处（简直不能忍！！）
  var progressBarBg = document.getElementById('progressBarBg');
  progressBarBg.addEventListener('mousedown', function (event) {
    // 只有音乐开始播放后才可以调节，已经播放过但暂停了的也可以
    if (!audio.paused || audio.currentTime != 0) {
      var pgsWidth = parseFloat(window.getComputedStyle(progressBarBg, null).width.replace('px', ''));
      var rate = event.offsetX / pgsWidth;
      audio.currentTime = audio.duration * rate;
      updateProgress(audio);
    }
  }, false);

  // 拖动进度点调节进度
  dragProgressDotEvent(audio);
}

/**
 * 鼠标拖动进度点时可以调节进度
 * @param {*} audio
 */
function dragProgressDotEvent(audio) {
  var dot = document.getElementById('progressDot');

  var position = {
    oriOffestLeft: 0, // 移动开始时进度条的点距离进度条的偏移值
    oriX: 0, // 移动开始时的x坐标
    maxLeft: 0, // 向左最大可拖动距离
    maxRight: 0 // 向右最大可拖动距离
  };
  var flag = false; // 标记是否拖动开始

  // 鼠标按下时
  dot.addEventListener('mousedown', down, false);
  dot.addEventListener('touchstart', down, false);

  // 开始拖动
  document.addEventListener('mousemove', move, false);
  document.addEventListener('touchmove', move, false);

  // 拖动结束
  document.addEventListener('mouseup', end, false);
  document.addEventListener('touchend', end, false);

  function down(event) {
    if (!audio.paused || audio.currentTime != 0) { // 只有音乐开始播放后才可以调节，已经播放过但暂停了的也可以
      flag = true;

      position.oriOffestLeft = dot.offsetLeft;
      position.oriX = event.touches ? event.touches[0].clientX : event.clientX; // 要同时适配mousedown和touchstart事件
      position.maxLeft = position.oriOffestLeft; // 向左最大可拖动距离
      position.maxRight = document.getElementById('progressBarBg').offsetWidth - position.oriOffestLeft; // 向右最大可拖动距离

      // 禁止默认事件（避免鼠标拖拽进度点的时候选中文字）
      if (event && event.preventDefault) {
        event.preventDefault();
      } else {
        event.returnValue = false;
      }

      // 禁止事件冒泡
      if (event && event.stopPropagation) {
        event.stopPropagation();
      } else {
        window.event.cancelBubble = true;
      }
    }
  }

  function move(event) {
    if (flag) {
      var clientX = event.touches ? event.touches[0].clientX : event.clientX; // 要同时适配mousemove和touchmove事件
      var length = clientX - position.oriX;
      if (length > position.maxRight) {
        length = position.maxRight;
      } else if (length < -position.maxLeft) {
        length = -position.maxLeft;
      }
      var progressBarBg = document.getElementById('progressBarBg');
      var pgsWidth = parseFloat(window.getComputedStyle(progressBarBg, null).width.replace('px', ''));
      var rate = (position.oriOffestLeft + length) / pgsWidth;
      audio.currentTime = audio.duration * rate;
      updateProgress(audio);
    }
  }

  function end() {
    flag = false;
  }
}

/**
 * 更新进度条与当前播放时间
 * @param {object} audio - audio对象
 */
function updateProgress(audio) {
  var value = audio.currentTime / audio.duration;
  document.getElementById('progressBar').style.width = value * 100 + '%';
  document.getElementById('progressDot').style.left = value * 100 + '%';
  document.getElementById('audioCurTime').innerText = transTime(audio.currentTime);
}

/**
 * 播放完成时把进度调回开始的位置
 */
function audioEnded() {
  document.getElementById('progressBar').style.width = 0;
  document.getElementById('progressDot').style.left = 0;
  document.getElementById('audioCurTime').innerText = transTime(0);
  console.log(app.playMode)
  if (app.playMode === 0) {
    console.log("当前是顺序播放")
    app.setCurrItem(app.currIndex + 1)
    audio.play()
  } else {
    console.log("当前是单区循环")
    audio.currentTime = 0
    audio.play()
  }
}

/**
 * 音频播放时间换算
 * @param {number} value - 音频当前播放时间，单位秒
 */
function transTime(value) {
  var time = "";
  var h = parseInt(value / 3600);
  value %= 3600;
  var m = parseInt(value / 60);
  var s = parseInt(value % 60);
  if (h > 0) {
    time = formatTime(h + ":" + m + ":" + s);
  } else {
    time = formatTime(m + ":" + s);
  }

  return time;
}

/**
 * 格式化时间显示，补零对齐
 * eg：2:4  -->  02:04
 * @param {string} value - 形如 h:m:s 的字符串
 */
function formatTime(value) {
  var time = "";
  var s = value.split(':');
  var i = 0;
  for (; i < s.length - 1; i++) {
    time += s[i].length == 1 ? ("0" + s[i]) : s[i];
    time += ":";
  }
  time += s[i].length == 1 ? ("0" + s[i]) : s[i];

  return time;
}

function getQueryStringByName(name) {
  var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
  if (result == null || result.length < 1) {
    return "";
  }
  return result[1];
}


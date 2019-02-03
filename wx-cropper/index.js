/**
 * wx-cropper 2.0
 * 基于微信小程序的图片裁剪工具
 * @author ifmiss
 */

// 裁剪图片的宽度设置
const CROPPER_WIDTH = 720

// 裁剪显示的最大比例，如果裁剪的图片过长，则做限制，默认最大宽高比例为 宽640 / 高960 (宽高比例)
const CROPPER_RATIO = 0.7

/**
 * 初始化裁剪的比例 如果是正方形则是 1
 * 比例为宽高比 建议区间为 0.25 - 4
 * 设置为0的时候则是不固定宽高
 */
const CROPPER_AREA_RATIO = 0

// 裁剪的位置
let CUT_L,  // 初始化拖拽元素的left值
    CUT_T,  // 初始化拖拽元素的top值
    CUT_R,  // 初始化拖拽元素的
    CUT_B,  // 初始化拖拽元素的

// 裁剪的宽度
    CUT_W,  // 初始化拖拽元素的宽度
    CUT_H,  //  初始化拖拽元素的高度

// 拖拽相关
    PAGE_X, // 手按下的x位置
    PAGE_Y, // 手按下y的位置
    T_PAGE_X, // 手移动的时候x的位置
    T_PAGE_Y, // 手移动的时候Y的位置x

// 图片比例
    IMG_RATIO,

// 图片实际宽高
    IMG_REAL_W,  // 图片实际的宽度
    IMG_REAL_H,   // 图片实际的高度

// 裁剪图片区域的信息
    CROPPER_IMG_W,
    CROPPER_IMG_H,

// 移动的比例
    DRAFG_MOVE_RATIO = 750 / wx.getSystemInfoSync().windowWidth,  //移动时候的比例,


    INIT_DRAG_POSITION = 0,   // 初始化屏幕宽度和裁剪区域的宽度之差，用于设置初始化裁剪的宽度

    DRAW_IMAGE_W, // 设置生成的图片宽度

// 最大可显示得图片宽度，需要设定最大值，否则安卓部分机器会闪退, 控制qualityWidth的最大值
    maxQW = 2550

/**
 * 最小裁剪宽度  由于设置了裁剪的UI样式，裁剪的宽高必须要有最小宽度，这个宽度是裁剪长或者宽的最短一方的宽度
 * 如 400 200
 * 那么如果只能设置为100的时候
 * 那么最小缩放到200 100的效果，之后只能放大不能缩小
 */
 const MIN_CROPPER_DIS = 160
 let MIN_CROPPER_DIS_X,
     MIN_CROPPER_DIS_Y

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 之后可以动态替换
    // imageSrc: 'http://www.bing.com/az/hprichbg/rb/BulgariaPerseids_ZH-CN11638911564_1920x1080.jpg',
    imageSrc: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1548138965392&di=8d000139a867a92e7552f6d70ab88c09&imgtype=0&src=http%3A%2F%2Fb-ssl.duitang.com%2Fuploads%2Fitem%2F201809%2F22%2F20180922160044_lxqwl.thumb.700_0.jpg',
    // imageSrc: 'http://pic.shejiben.com/mall/2013/10/25/20131025235159-933db4b4_m.jpg',
    // 是否显示图片(在图片加载完成之后设置为true)
    isShowImg: false,

    // 动态的宽高
    cropperW: CROPPER_WIDTH,
    cropperH: CROPPER_WIDTH,

    // 动态的left top值
    cropperL: 0,
    cropperT: 0,

    // 图片缩放值
    scaleP: 0,

    // 裁剪框 宽高
    cutL: 0,
    cutT: 0,
    cutB: 0,
    cutR: 0,

    qualityWidth: DRAW_IMAGE_W,

    innerAspectRadio: DRAFG_MOVE_RATIO,

    showCropper: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 初始化
    // this.loadImage();
  },

  /**
   * 选择本地图片
   * 基于底部中间的按钮的点击事件
   */
  getImage: function () {
    var _this = this
    wx.chooseImage({
      success: function (res) {
        _this.setData({
          isShowImg: false,
          imageSrc: res.tempFilePaths[0],
        })
        _this.loadImage();
      },
    })
  },

  /**
   * 初始化图片信息
   * 获取图片内容，并初始化裁剪框
   */
  loadImage: function () {
    var _this = this
    wx.showLoading({
      title: '图片加载中...',
    })

    wx.getImageInfo({
      src: _this.data.imageSrc,
      success: function success(res) {
        DRAW_IMAGE_W = IMG_REAL_W = res.width
        IMG_REAL_H = res.height
        IMG_RATIO = IMG_REAL_W / IMG_REAL_H

        MIN_CROPPER_DIS_X = IMG_RATIO >=1 ? MIN_CROPPER_DIS * IMG_RATIO : MIN_CROPPER_DIS

        // let MIN_RANGE = IMG_REAL_W > IMG_REAL_H ? IMG_REAL_W : IMG_REAL_H

        // // 用于设置图片的比例(以设置裁剪的比例，方便定位裁剪的left right top bottom)
        // INIT_DRAG_POSITION = MIN_RANGE > INIT_DRAG_POSITION ? INIT_DRAG_POSITION : MIN_RANGE

        // 拿到裁剪位置
        let cropperPosition = _this.initCropperPosition(IMG_RATIO, CROPPER_WIDTH)

        // 根据图片的宽高显示不同的效果   保证图片可以正常显示  
        if (IMG_RATIO >= 1) {
          _this.setData({
            cropperW: CROPPER_WIDTH,
            cropperH: CROPPER_WIDTH / IMG_RATIO,
            // 初始化left right
            cropperL: Math.ceil((CROPPER_WIDTH - CROPPER_WIDTH) / 2),
            cropperT: 0,
            cutL: cropperPosition.left,
            cutT: cropperPosition.top,
            cutR: cropperPosition.right,
            cutB: cropperPosition.bottom,
            // 图片缩放值
            scaleP: IMG_REAL_W / CROPPER_WIDTH,
            qualityWidth: DRAW_IMAGE_W > maxQW ? maxQW : DRAW_IMAGE_W,
            innerAspectRadio: IMG_RATIO
          })
        } else {
          // 此时需要判断图片的比例以设定显示裁剪区域的比例
          // let cropper_real_ratio = CROPPER_RATIO > IMG_RATIO ? CROPPER_RATIO : IMG_RATIO

          if (CROPPER_RATIO > IMG_RATIO) {
            CROPPER_IMG_W = CROPPER_WIDTH / CROPPER_RATIO * IMG_RATIO
            CROPPER_IMG_H = CROPPER_WIDTH / CROPPER_RATIO
          } else {
            CROPPER_IMG_W = CROPPER_WIDTH
            CROPPER_IMG_H = CROPPER_IMG_W / IMG_RATIO
          }

          // 动态生成新的CROPPER的真实宽度 高度
          // CROPPER_IMG_W = CROPPER_WIDTH * cropper_real_ratio
          // CROPPER_IMG_H = CROPPER_WIDTH / cropper_real_ratio / IMG_RATIO
          // console.log(cropper_real_ratio)
          // console.log(CROPPER_IMG_W)
          // console.log(CROPPER_IMG_H)
          // console.log(CROPPER_IMG_W / CROPPER_IMG_H)

          _this.setData({
            cropperW: CROPPER_IMG_W,
            cropperH: CROPPER_IMG_H,
            // 初始化left right
            cropperL: Math.ceil((CROPPER_WIDTH - CROPPER_IMG_W) / 2),
            cropperT: 0,

            cutL: cropperPosition.left,
            cutT: cropperPosition.top,
            cutR: cropperPosition.right,
            cutB: cropperPosition.bottom,
            // 图片缩放值
            scaleP: IMG_REAL_W / CROPPER_IMG_W,
            qualityWidth: DRAW_IMAGE_W > maxQW ? maxQW : DRAW_IMAGE_W,
            innerAspectRadio: IMG_RATIO
          })
        }
        _this.setData({
          isShowImg: true
        })
        wx.hideLoading()
      }
    })
  },

  /**
   * 初始化裁剪区域的
   * left right top bottom
   * 需要 CROPPER_AREA_RATIO 来判断
   * @return 返回裁剪的left, right, top bottom的值
   */
  initCropperPosition (radio) {
    let left = 0,
        right = 0,
        top = 0,
        bottom = 0,
        cropperW,
        cropperH
    // 如果 CROPPER_AREA_RATIO = 0 则不限制固定宽高 
    if (CROPPER_AREA_RATIO === 0) return { left, right, top,bottom }

    // 宽大于等于高
    if (radio >= 1) {
      cropperW = CROPPER_WIDTH
      cropperH = CROPPER_WIDTH / IMG_RATIO
      if (radio > CROPPER_AREA_RATIO) {
        return {
          left: Math.ceil((cropperW - cropperH * CROPPER_AREA_RATIO) / 2),
          right: Math.ceil((cropperW - cropperH * CROPPER_AREA_RATIO) / 2),
          top: 0,
          bottom: 0
        }
      }
      return {
        left: 0,
        right: 0,
        top: Math.ceil((cropperH - cropperW / CROPPER_AREA_RATIO) / 2),
        bottom: Math.ceil((cropperH - cropperW / CROPPER_AREA_RATIO) / 2)
      }
    }

    // 此时需要判断图片的比例以设定显示裁剪区域的比例
    let cropper_real_ratio = CROPPER_RATIO > IMG_RATIO ? CROPPER_RATIO : IMG_RATIO
    // 高大于宽
    cropperW = CROPPER_WIDTH / cropper_real_ratio * IMG_RATIO
    cropperH = CROPPER_WIDTH / cropper_real_ratio
    if (radio < CROPPER_AREA_RATIO) {
      return {
        left: 0,
        right: 0,
        top: Math.ceil((cropperH - cropperW / CROPPER_AREA_RATIO) / 2),
        bottom: Math.ceil((cropperH - cropperW / CROPPER_AREA_RATIO) / 2)
      }
    }
    return {
      left: Math.ceil((cropperW - cropperH * CROPPER_AREA_RATIO) / 2),
      right: Math.ceil((cropperW - cropperH * CROPPER_AREA_RATIO) / 2),
      top: 0,
      bottom: 0
    }
  },

  /**
   * 拖动时候触发的touchStart事件
   */
  contentStartMove(e) {
    PAGE_X = e.touches[0].pageX
    PAGE_Y = e.touches[0].pageY
  },

  /**
   * 拖动时候触发的touchMove事件
   */
  contentMoveing(e) {
    var _this = this
    var dragLengthX = (PAGE_X - e.touches[0].pageX) * DRAFG_MOVE_RATIO
    var dragLengthY = (PAGE_Y - e.touches[0].pageY) * DRAFG_MOVE_RATIO * DRAFG_MOVE_RATIO

    // 左移右移
    if (dragLengthX > 0) {
      if (this.data.cutL - dragLengthX < 0) dragLengthX = this.data.cutL
    } else {
      if (this.data.cutR + dragLengthX < 0) dragLengthX = -this.data.cutR
    }


    // 上移下移
    if (dragLengthY > 0) {
      if (this.data.cutT - dragLengthY < 0) dragLengthY = this.data.cutT
    } else {
      if (this.data.cutB + dragLengthY < 0) dragLengthY = -this.data.cutB
    }
    this.setData({
      cutL: this.data.cutL - dragLengthX,
      cutT: this.data.cutT - dragLengthY,
      cutR: this.data.cutR + dragLengthX,
      cutB: this.data.cutB + dragLengthY
    })


    PAGE_X = e.touches[0].pageX
    PAGE_Y = e.touches[0].pageY
  },

  contentTouchEnd() {

  },

  /**
   * 点击取消关闭裁剪页面
   */
  close() {
    // wx.redirectTo()
  },

  /**
   * 点击完成之后
   * 生成图片信息
   */
  getImageInfo() {
    var _this = this
    wx.showLoading({
      title: '图片生成中...',
    })
    // 将图片写入画布
    const ctx = wx.createCanvasContext('myCanvas')
    let w = this.data.qualityWidth
    let h = this.data.qualityWidth / IMG_RATIO
    ctx.drawImage(_this.data.imageSrc, 0, 0, w, h);
    ctx.draw(true, () => {
      // 获取画布要裁剪的位置和宽度   均为百分比 * 画布中图片的宽度    保证了在微信小程序中裁剪的图片模糊  位置不对的问题
      var canvasW = ((_this.data.cropperW - _this.data.cutL - _this.data.cutR) / _this.data.cropperW) * w
      var canvasH = ((_this.data.cropperH - _this.data.cutT - _this.data.cutB) / _this.data.cropperH) * h
      var canvasL = (_this.data.cutL / _this.data.cropperW) * w
      var canvasT = (_this.data.cutT / _this.data.cropperH) * h

      // 生成图片
      wx.canvasToTempFilePath({
        x: canvasL,
        y: canvasT,
        width: canvasW,
        height: canvasH,
        destWidth: canvasW,
        destHeight: canvasH,
        quality: 0.5,
        canvasId: 'myCanvas',
        success: function (res) {
          wx.hideLoading()
          // 成功获得地址的地方
          wx.previewImage({
            current: '', // 当前显示图片的http链接
            urls: [res.tempFilePath] // 需要预览的图片http链接列表
          })
        }
      })
    })
  },

  /**
   * 设置大小的时候触发的touchStart事件
   * 存数据
   */
  dragStart(e) {
    T_PAGE_X = e.touches[0].pageX
    T_PAGE_Y = e.touches[0].pageY
    CUT_L = this.data.cutL
    CUT_R = this.data.cutR
    CUT_B = this.data.cutB
    CUT_T = this.data.cutT
  },

  /**
   * 设置大小的时候触发的touchMove事件
   * 根据dragType判断类型
   * 4个方向的边线拖拽效果
   * 右下角按钮的拖拽效果
   */
  dragMove(e) {
    var _this = this
    var dragType = e.target.dataset.drag
    switch (dragType) {
      case 'right':
        var dragLength = (T_PAGE_X - e.touches[0].pageX) * DRAFG_MOVE_RATIO
        if (CUT_R + dragLength < 0) dragLength = - CUT_R
        if (CUT_R + dragLength + MIN_CROPPER_DIS_X > this.data.cropperW - this.data.cutL)  dragLength = (this.data.cropperW - this.data.cutL) - MIN_CROPPER_DIS_X - CUT_R

        if (CROPPER_AREA_RATIO) {
          // 底部线的限制 不允许超出
          // dragLength 最大不能超过CUT_B
          if (CUT_B + dragLength / CROPPER_AREA_RATIO <= 0) {
            this.setData({
              cutB: 0
            })
            return
          }
          this.setData({
            cutR: CUT_R + dragLength,
            cutB: CUT_B + dragLength / CROPPER_AREA_RATIO
          })
        } else {
          this.setData({
            cutR: CUT_R + dragLength
          })
        }
  
        break;
      case 'left':
        var dragLength = (T_PAGE_X - e.touches[0].pageX) * DRAFG_MOVE_RATIO
        if (CUT_L - dragLength < 0) dragLength = CUT_L
        if ((CUT_L - dragLength + MIN_CROPPER_DIS_X) > (this.data.cropperW - this.data.cutR)) dragLength = CUT_L - (this.data.cropperW - this.data.cutR) + MIN_CROPPER_DIS_X

        if (CROPPER_AREA_RATIO) {
          // 顶部线的限制 不允许超出
          // dragLength 最大不能超过CUT_T
          if (CUT_T - dragLength / CROPPER_AREA_RATIO < 0) {
            this.setData({
              cutT: 0
            })
            return
          }
          this.setData({
            cutL: CUT_L - dragLength,
            cutT: CUT_T - dragLength / CROPPER_AREA_RATIO
          })
        } else {
          this.setData({
            cutL: CUT_L - dragLength
          })
        }
        break;
      case 'top':
        var dragLength = (T_PAGE_Y - e.touches[0].pageY) * DRAFG_MOVE_RATIO
        if (CUT_T - dragLength < 0) dragLength = CUT_T
        if ((CUT_T - dragLength + MIN_CROPPER_DIS_Y) > this.data.cropperH - this.data.cutB) dragLength = CUT_T - (this.data.cropperH - this.data.cutB) + MIN_CROPPER_DIS_Y

        if (CROPPER_AREA_RATIO) {
          // left 线的限制 不允许超出
          // dragLength 最大不能超过CUT_L
          if (CUT_L - dragLength * CROPPER_AREA_RATIO < 0) {
            this.setData({
              cutL: 0
            })
            return
          }
          this.setData({
            cutL: CUT_L - dragLength * CROPPER_AREA_RATIO,
            cutT: CUT_T - dragLength
          })
        } else {
          this.setData({
            cutT: CUT_T - dragLength
          })
        }
        break;
      case 'bottom':
        var dragLength = (T_PAGE_Y - e.touches[0].pageY) * DRAFG_MOVE_RATIO
        if (CUT_B + dragLength < 0) dragLength = - CUT_B
        console.log(this.data.cropperH)
        console.log(this.data.cutT)
        console.log(MIN_CROPPER_DIS_Y)
        console.log(CUT_B)
        if (CUT_B + dragLength + MIN_CROPPER_DIS_Y > this.data.cropperH - this.data.cutT) dragLength = (this.data.cropperH - this.data.cutT) - MIN_CROPPER_DIS_Y - CUT_B

        if (CROPPER_AREA_RATIO) {
          // right 线的限制 不允许超出
          // dragLength 最大不能超过 CUT_R
          if (CUT_R + dragLength * CROPPER_AREA_RATIO < 0) {
            this.setData({
              cutR: 0
            })
            return
          }
          this.setData({
            cutR: CUT_R + dragLength * CROPPER_AREA_RATIO,
            cutB: CUT_B + dragLength
          })
        } else {
          this.setData({
            cutB: CUT_B + dragLength
          })
        }
        break;
      case 'rightBottom':
        var dragType = e.target.dataset.drag
        var dragLengthX = (T_PAGE_X - e.touches[0].pageX) * DRAFG_MOVE_RATIO
        var dragLengthY = (T_PAGE_Y - e.touches[0].pageY) * DRAFG_MOVE_RATIO
        if (CUT_B + dragLengthY < 0) dragLengthY = - CUT_B
        if (CUT_B + dragLengthY + MIN_CROPPER_DIS_Y > this.data.cropperH - this.data.cutT) dragLengthY = (this.data.cropperH - this.data.cutT) - MIN_CROPPER_DIS_Y - CUT_B
        if (CUT_R + dragLengthX < 0) dragLengthX = - CUT_R
        if (CUT_R + dragLengthX + MIN_CROPPER_DIS_X > this.data.cropperW - this.data.cutL) dragLengthX = (this.data.cropperW - this.data.cutL) - MIN_CROPPER_DIS_X - CUT_R

        if (CROPPER_AREA_RATIO) {
          // right 线的限制 不允许超出
          // dragLength 最大不能超过 CUT_R
          if (CUT_R + dragLengthY * CROPPER_AREA_RATIO < 0) {
            this.setData({
              cutR: 0
            })
            return
          }
          this.setData({
            cutR: CUT_R + dragLengthY * CROPPER_AREA_RATIO,
            cutB: CUT_B + dragLengthY
          })
        } else {
          this.setData({
            cutB: CUT_B + dragLengthY,
            cutR: CUT_R + dragLengthX
          })
        }
        break;
      default:
        break;
    }
  },

  showCut () {
    this.setData({
      showCropper: true
    })
  },

  hideCut () {
    this.setData({
      showCropper: false
    })
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
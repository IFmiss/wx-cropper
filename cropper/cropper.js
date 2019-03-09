// cropper/cropper.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    /**
     * @type         number
     * @description  组件裁剪显示区域的最大比例，如果裁剪的图片过长，则做限制，默认最大宽高比例为 宽640 / 高960 (宽高比例)
     * @example 1    如果CROPPER_WIDTH宽度是720px，那么裁剪区域的高度也就是 CROPPER_WIDTH / cropperRatio 为 720px;
     */
    cropperRatio: {
      type: Number,
      value: 1
    },

    /**
     * @type         number
     * @description  初始化的裁剪比例
     * @example 0    默认初始化的裁剪区域宽高为图片的宽高，且裁剪比例不固定
     * @example 0.5  宽高比例固定，且宽和高的比例为 1 : 2 的比例
     * @example 2    宽高比例固定，且宽和高的比例为 2 : 1 的比例
     */
    cutRatio: {
      type: Number,
      value: 1
    },

    /**
     * @type         string
     * @description  需要裁剪的图片地址
     */
    imageSrc: {
      type: String,
      value: ''
    },

    /**
     * @type         number
     * @description  裁剪区域的宽度
     */
    cropperWidth: {
      type: Number,
      value: 720
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    /**
     * @type         boolean
     * @description  图片在进行网络请求完成之后显示，showImg用于控制图片显示时机
     */
    showImg: false,

    /**
     * @
     */
    // 动态的宽高
    cropperW: null,
    cropperH: null,

    // 图片缩放值
    scaleP: 0,
    // 裁剪框 宽高
    cutL: 0,
    cutT: 0,
    cutB: 0,
    cutR: 0,

    qualityWidth: null,
    innerAspectRadio: null
  },

  /**
   * 组件的方法列表
   */
  methods: {
    close () {
      wx.hideLoading()
      this.triggerEvent('close')
    },

    /**
     * 初始化变量信息
     */
    initStaticDate () {
      this.drag = {
        CUT_L: null,  // 初始化拖拽元素的left值
        CUT_T: null,  // ...top值
        CUT_R: null,  // ...right值
        CUT_B: null,  // ...bottom值

        CUT_W: null,  // 初始化拖拽元素的宽度
        CUT_H: null,  // 初始化拖拽元素的高度

        IS_TOUCH_CONTENT: false,  // 是否是可拖动的状态（拖拽裁剪框）

        // 拖拽区域的时候设置
        TOUCH_OFFSET_X: null, // 手按下相对于裁剪框左边的距离
        TOUCH_OFFSET_Y: null, // 手按下相对于裁剪框上边的距离

        TOUCH_MAX_MOVE_SECTION_X: null, // 移动区域的时候移动的x方向最大区间
        TOUCH_MAX_MOVE_SECTION_Y: null, // 移动区域的时候移动的y方向最大区间

        MOVE_PAGE_X: null,  // 手移动的时候x的位置
        MOVE_PAGE_Y: null,  // 手移动的时候Y的位置
      }

      this.conf = {
        // 图片比例
        IMG_RATIO: null,

        // 图片实际宽高
        IMG_REAL_W: null,   // 图片实际的宽度
        IMG_REAL_H: null,   // 图片实际的高度

        // 裁剪除黑色区域以内的高度
        CROPPER_HEIGHT: null,
        CROPPER_WIDTH: null,

        // 裁剪图片区域的信息
        CROPPER_IMG_W: null,    // 也就是 data.cropperW
        CROPPER_IMG_H: null,    // 也就是 data.cropperH

        // 移动的比例
        DRAG_MOVE_RATIO: 750 / wx.getSystemInfoSync().windowWidth,  //移动时候的比例,

        INIT_DRAG_POSITION: 0,    // 初始化屏幕宽度和裁剪区域的宽度之差，用于设置初始化裁剪的宽度
        DRAW_IMAGE_W: null,       // 设置生成的图片宽度

        // 最大可显示得图片宽度，需要设定最大值，否则安卓部分机器会闪退, 控制qualityWidth的最大值
        MAX_QW: 2550,

        /**
         * 最小裁剪宽度  由于设置了裁剪的UI样式，裁剪的宽高必须要有最小宽度，这个宽度是裁剪长或者宽的最短一方的宽度
         * 如 400 200
         * 那么如果只能设置为100的时候
         * 那么最小缩放到200 100的效果，之后只能放大不能缩小
         */
        MIN_CROPPER_DIS: 100
      }
    },

    /**
     * 选择本地图片
     * 基于底部中间的按钮的点击事件
     */
    getImage: function () {
      const _this = this
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
     * 初始化加载图片
     */
    loadImage () {
      const _this = this

      wx.showLoading({
        title: '图片加载中...',
      })
      console.log(this.properties.imageSrc)
      wx.getImageInfo({
        src: this.properties.imageSrc,
        success: function (res) {
          /**
           * 获取图片真实宽高
           * 设置DRAW_IMAGE_W
           */
          _this.conf.DRAW_IMAGE_W = _this.conf.IMG_REAL_W = res.width
          _this.conf.IMG_REAL_H = res.height
          _this.conf.IMG_RATIO = _this.conf.IMG_REAL_W / _this.conf.IMG_REAL_H
          _this.conf.CROPPER_HEIGHT = _this.properties.cropperWidth / _this.conf.IMG_RATIO

          const scaleP = _this.conf.IMG_REAL_W / _this.properties.cropperWidth
          const qualityWidth = _this.conf.DRAW_IMAGE_W > _this.conf.MAX_QW ? _this.conf.MAX_QW : _this.conf.DRAW_IMAGE_W
          // const MIN_RANG
          const p = _this.initPosition()

          // 根据图片的宽高显示不同的效果 保证图片可以正常显示 (横屏)
          if (_this.conf.IMG_RATIO >= 1) {
            _this.setData ({
              cropperW: _this.properties.cropperWidth,
              cropperH: _this.conf.CROPPER_HEIGHT,

              // 初始化left right
              cutL: p.left,
              cutT: p.top,
              cutR: p.right,
              cutB: p.bottom,

              // 图片缩放值
              scaleP,
              qualityWidth
            })
          } else {
            // 竖屏初始化
            _this.setData ({
              cropperW: _this.conf.CROPPER_WIDTH,
              cropperH: _this.conf.CROPPER_HEIGHT,

              // 初始化left right
              cutL: p.left,
              cutT: p.top,
              cutR: p.right,
              cutB: p.bottom,

              // 图片缩放值
              scaleP,
              qualityWidth
            })
          }

          _this.setData({
            showImg: true
          })
          wx.hideLoading()
        } 
      })
    },

    /**
     * 初始化裁剪位置
     * 需要 cutRatio 来判断
     * @return 返回裁剪的left, right, top bottom的值
     */
    initPosition () {
      // 定义返回的对象
      let left = 0,
          right = 0,
          top = 0,
          bottom = 0
      // cutRatio为0 则为不等比裁剪
      if (this.properties.cutRatio === 0) return { left, right, top, bottom }

      // 定义差值比例
      const absReducerRadio = Math.abs(this.conf.IMG_RATIO - this.properties.cutRatio)

      // 如果图片宽度大于等于高度（横向）
      if (this.conf.IMG_RATIO >= 1) {
        // 获取基本宽度
        // 图片显示区域比裁剪比例大的时候
        if (this.conf.IMG_RATIO >= this.properties.cutRatio) {
          // left的值
          let leftRight = Math.ceil((this.properties.cropperWidth - (this.conf.CROPPER_HEIGHT * this.properties.cutRatio)) / 2)
          return {
            left: leftRight,
            right: leftRight,
            top: 0,
            bottom: 0
          }
        }
        // 否则
        const bottomTop = Math.ceil((this.conf.CROPPER_HEIGHT  - (this.properties.cropperWidth / this.properties.cutRatio)) / 2)
        return {
          left: 0,
          right: 0,
          top: bottomTop,
          bottom: bottomTop
        }
      }

      // 如果图片宽度小于高度 (竖向)
      // const r = _this.properties.cropperRatio > _this.conf.IMG_RATIO ? _this.properties.cropperRatio : _this.conf.IMG_RATIO
      if (this.properties.cropperRatio > this.conf.IMG_RATIO) {
        this.conf.CROPPER_WIDTH = this.properties.cropperWidth / this.properties.cropperRatio * this.conf.IMG_RATIO
        this.conf.CROPPER_HEIGHT = this.properties.cropperWidth / this.properties.cropperRatio
      } else {
        this.conf.CROPPER_WIDTH = this.properties.cropperWidth
        this.conf.CROPPER_HEIGHT = this.properties.cropperWidth / this.conf.IMG_RATIO
      }
      if (this.conf.IMG_RATIO >= this.properties.cutRatio) {
        const leftRight = Math.ceil((this.conf.CROPPER_WIDTH - (this.conf.CROPPER_HEIGHT * this.properties.cutRatio)) / 2)
        return {
          left: leftRight,
          right: leftRight,
          top: 0,
          bottom: 0
        }
      }
      const bottomTop = Math.ceil((this.conf.CROPPER_HEIGHT  - (this.conf.CROPPER_WIDTH / this.properties.cutRatio)) / 2)
      return {
        left: 0,
        right: 0,
        top: bottomTop,
        bottom: bottomTop
      }
    },

    /**
     * 上下左右四条线的拖拽效果
     */
    sideDragStart () {
    },

    /**
     * 裁剪框的拖动事件
     */
    contentDragStart (e) {
      this.drag.IS_TOUCH_CONTENT = true

      this.drag.TOUCH_OFFSET_X = e.touches[0].pageX - this.data.cutL
      this.drag.TOUCH_OFFSET_Y = e.touches[0].pageY - this.data.cutT

      /**
       * 获取可移动的最大值 xy方向
       */
      const cc = this.cropperCurrentInfo()
      this.drag.TOUCH_MAX_MOVE_SECTION_X = cc.x
      this.drag.TOUCH_MAX_MOVE_SECTION_Y = cc.y
    },

    /**
     * 获取裁剪区域信息
     */
    cropperCurrentInfo () {
      const x = this.data.cutL + this.data.cutR
      const y = this.data.cutT + this.data.cutB

      // 获取拖拽元素的宽高
      this.drag.CUT_W = this.data.cropperW - x
      this.drag.CUT_H = this.data.cropperH - y

      // 返回x, y
      return {
        x,
        y
      }
    },

    /**
     * 裁剪框拖动
     */
    contentDragMove (e) {
      const MOVE_X = e.touches[0].pageX - this.drag.TOUCH_OFFSET_X
      const MOVE_Y = e.touches[0].pageY - this.drag.TOUCH_OFFSET_Y

      const drag_x = Math.min(this.drag.TOUCH_MAX_MOVE_SECTION_X, Math.max(0, MOVE_X))
      const drag_y = Math.min(this.drag.TOUCH_MAX_MOVE_SECTION_Y, Math.max(0, MOVE_Y))

      this.setData({
        cutL: drag_x,
        cutR: this.data.cropperW - this.drag.CUT_W - drag_x,
        cutT: drag_y,
        cutB: this.data.cropperH - this.drag.CUT_H - drag_y,
      })
    }
  },
  
  created: function () {
    this.initStaticDate()
    // console.log(this.drag)
    // console.log(this.conf)
    // console.log('created')
  },

  attached: function () {
    console.log('attached')
    // this.loadImage()
  },

  ready: function () {
    console.log('ready')
  },

  moved: function () {
    console.log('moved')
  },

  detached: function () {
    console.log('detached')
  }
})

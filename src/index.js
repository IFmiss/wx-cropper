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
      value: 0.7
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
    },

    /**
     * @type          number
     * @description   最小裁剪的范围
     */
    minCropperW: {
      type: Number,
      value: 100
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
    innerAspectRadio: null,

    filePath: null
  },

  /**
   * 组件的方法列表
   */
  methods: {
    close() {
      wx.hideLoading()
      this.triggerEvent('close')
    },

    /**
     * 初始化变量信息
     */
    initStaticData() {
      this.drag = {
        CUT_L: null,  // 初始化拖拽元素的left值
        CUT_T: null,  // ...top值
        CUT_R: null,  // ...right值
        CUT_B: null,  // ...bottom值

        CUT_W: null,  // 初始化拖拽元素的宽度
        CUT_H: null,  // 初始化拖拽元素的高度

        IS_TOUCH_CONTENT: false,  // 是否是可拖动的状态（拖拽裁剪框）
        IS_TOUCH_SIDE: false,  // 是否可以拖拽边框
        IS_NO_DRAG: false, 

        // 拖拽区域的时候设置
        TOUCH_OFFSET_X: null, // 手按下相对于裁剪框左边的距离
        TOUCH_OFFSET_Y: null, // 手按下相对于裁剪框上边的距离

        TOUCH_MAX_MOVE_SECTION_X: null, // 移动区域的时候移动的x方向最大区间
        TOUCH_MAX_MOVE_SECTION_Y: null, // 移动区域的时候移动的y方向最大区间

        MOVE_PAGE_X: null,  // 手移动的时候x的位置
        MOVE_PAGE_Y: null,  // 手移动的时候Y的位置

        SPACE_TOP_POSITION: null,
        SPACE_LEFT_POSITION: null,
        SPACE_RIGHT_POSITION: null,
        SPACE_BOTTOM_POSITION: null
      }

      this.conf = {
        // 图片比例
        IMG_RATIO: null,

        // 图片实际宽高
        IMG_REAL_W: null,   // 图片实际的宽度
        IMG_REAL_H: null,   // 图片实际的高度

        // 裁剪除黑色区域以内的高度
        CROPPER_HEIGHT: null,   // 图片背景区域宽度
        CROPPER_WIDTH: null,    // 图标背景区域高度

        // 设置最小裁剪宽度高度
        CUT_MIN_W: null,  // 最小限制多宽
        CUT_MIN_H: null,  // 最小限制多高

        // 裁剪图片区域的信息
        // CROPPER_IMG_W: null,    // 也就是 data.cropperW
        // CROPPER_IMG_H: null,    // 也就是 data.cropperH

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
    getImage() {
      const _this = this
      wx.chooseImage({
        success: function (res) {
          _this.setData({
            isShowImg: false,
            filePath: res.tempFilePaths[0],
          })
          _this.loadImage(_this.data.filePath)
        },
      })
    },

    /**
     * 初始化加载图片
     */
    loadImage(src) {
      const _this = this

      wx.showLoading({
        title: '图片加载中...',
      })
      // console.log(this.properties.imageSrc)
      wx.getImageInfo({
        src: src ? src : this.properties.imageSrc,
        success: function (res) {
          /**
           * 获取图片真实宽高
           * 设置DRAW_IMAGE_W
           */
          _this.conf.DRAW_IMAGE_W = _this.conf.IMG_REAL_W = res.width
          _this.conf.IMG_REAL_H = res.height
          _this.conf.IMG_RATIO = Number((_this.conf.IMG_REAL_W / _this.conf.IMG_REAL_H).toFixed(5))
          _this.conf.CROPPER_HEIGHT = Math.ceil(_this.properties.cropperWidth / _this.conf.IMG_RATIO)

          const scaleP = Number((_this.conf.IMG_REAL_W / _this.properties.cropperWidth).toFixed(5))
          const qualityWidth = _this.conf.DRAW_IMAGE_W > _this.conf.MAX_QW ? _this.conf.MAX_QW : _this.conf.DRAW_IMAGE_W
          // const MIN_RANG
          const p = _this.initPosition()

          // 根据图片的宽高显示不同的效果 保证图片可以正常显示 (横屏)
          // console.log(_this.conf.IMG_RATIO)
          // console.log(_this.conf)
          // console.log(_this.drag)
          // console.log(_this.data)
          // console.log(p)
          if (_this.conf.IMG_RATIO >= 1) {
            _this.conf.CROPPER_WIDTH = _this.properties.cropperWidth
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
              qualityWidth,
              innerAspectRadio: _this.conf.IMG_RATIO,
              filePath: res.path
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
              qualityWidth,
              innerAspectRadio: _this.conf.IMG_RATIO,
              filePath: res.path
            })
          }

          // 设置裁剪最小限制
          _this.setMinCutInfo()

          _this.setData({
            showImg: true
          })

          wx.hideLoading()
        } 
      })
    },

    /**
     * 点击完成裁剪图片并返回图片信息
     * width 宽度
     * height  高度
     * url  图片的临时存储地址
     */
    getImageInfo() {
      const _this = this
      wx.showLoading({
        title: '图片生成中...',
      })
      this.drag.IS_NO_DRAG = true
      // 将图片写入画布
      const ctx = wx.createCanvasContext('wxCropperCanvas', _this)
      const w = this.data.qualityWidth
      const h = Math.ceil(this.data.qualityWidth / this.data.innerAspectRadio)
      ctx.drawImage(_this.data.filePath, 0, 0, w, h)
      ctx.draw(true, () => {
        // 获取画布要裁剪的位置和宽度   均为百分比 * 画布中图片的宽度    保证了在微信小程序中裁剪的图片模糊  位置不对的问题
        const canvasW = Math.ceil(((_this.data.cropperW - _this.data.cutL - _this.data.cutR) / _this.data.cropperW) * w)
        const canvasH = Math.ceil(((_this.data.cropperH - _this.data.cutT - _this.data.cutB) / _this.data.cropperH) * h)
        const canvasL = Math.ceil((_this.data.cutL / _this.data.cropperW) * w)
        const canvasT = Math.ceil((_this.data.cutT / _this.data.cropperH) * h)
        // console.log(canvasW, canvasH, canvasL, canvasT)
        // 生成图片
        wx.canvasToTempFilePath({
          x: canvasL,
          y: canvasT,
          width: canvasW,
          height: canvasH,
          destWidth: canvasW,
          destHeight: canvasH,
          quality: 0.9,
          canvasId: 'wxCropperCanvas',
          success: function (res) {
            // console.log(res.tempFilePath)
            const img = {
              path: res.tempFilePath,
              width: canvasW,
              height: canvasH
            }
            _this.triggerEvent('close', img)
          },
          complete: function () {
            // 结束之后可拖拽放大缩小
            // 关闭loading
            wx.hideLoading()
            _this.drag.IS_NO_DRAG = false
          }
        }, _this)
      })
    },

    /**
     * 设置最小裁剪宽度高度限制
     */
    setMinCutInfo() {
      this.conf.CUT_MIN_W = this.properties.minCropperW
      if (this.properties.cutRatio) {
        this.conf.CUT_MIN_H = this.conf.CUT_MIN_W / this.properties.cutRatio
        // console.log('this.conf.CUT_MIN_H', this.conf.CUT_MIN_H)
        return
      }
      this.conf.CUT_MIN_H = this.conf.CUT_MIN_W
      // console.log('this.conf.CUT_MIN_H', this.conf.CUT_MIN_H)
    },

    /**
     * 初始化裁剪位置
     * 需要 cutRatio 来判断
     * @return 返回裁剪的left, right, top bottom的值
     */
    initPosition() {
      // 定义返回的对象
      const left = 0,
        right = 0,
        top = 0,
        bottom = 0
      // cutRatio为0 且为横行  则为不等比裁剪
      if (this.properties.cutRatio === 0 && this.conf.IMG_RATIO >= 1) {
        return { left, right, top, bottom }
      }

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
      // 定义四个位置  如果不比例裁剪
      if (this.properties.cutRatio === 0) return { left, right, top, bottom }
      // 否则

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
     * 裁剪框的拖动事件
     */
    contentDragStart(e) {
      if (this.drag.IS_NO_DRAG) return
      this.drag.IS_TOUCH_CONTENT = true

      this.drag.TOUCH_OFFSET_X = (e.touches[0].pageX * this.conf.DRAG_MOVE_RATIO - this.data.cutL)
      this.drag.TOUCH_OFFSET_Y = (e.touches[0].pageY * this.conf.DRAG_MOVE_RATIO - this.data.cutT)

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
    cropperCurrentInfo() {
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
    contentDragMove(e) {
      if (this.drag.IS_NO_DRAG) return
      if (!this.drag.IS_TOUCH_CONTENT) return
      const MOVE_X = e.touches[0].pageX * this.conf.DRAG_MOVE_RATIO - this.drag.TOUCH_OFFSET_X
      const MOVE_Y = e.touches[0].pageY * this.conf.DRAG_MOVE_RATIO - this.drag.TOUCH_OFFSET_Y

      const drag_x = Math.min(this.drag.TOUCH_MAX_MOVE_SECTION_X, Math.max(0, MOVE_X))
      const drag_y = Math.min(this.drag.TOUCH_MAX_MOVE_SECTION_Y, Math.max(0, MOVE_Y))

      this.setData({
        cutL: Math.ceil(drag_x),
        cutR: Math.ceil(this.data.cropperW - this.drag.CUT_W - drag_x),
        cutT: Math.ceil(drag_y),
        cutB: Math.ceil((this.data.cropperH - this.drag.CUT_H - drag_y))
      })

      // 需要初始化
      this.drag.TOUCH_OFFSET_X = (e.touches[0].pageX * this.conf.DRAG_MOVE_RATIO - this.data.cutL)
      this.drag.TOUCH_OFFSET_Y = (e.touches[0].pageY * this.conf.DRAG_MOVE_RATIO - this.data.cutT)
    },

    /**
     * 裁剪框拖动结束
     */
    contentTouchEnd() {
      this.drag.IS_TOUCH_CONTENT = false
    },

    /**
     * 裁剪框4个方向的拖拽
     */
    sideDragStart(e) {
      if (this.drag.IS_NO_DRAG) return
      this.drag.IS_TOUCH_SIDE = true
      this.drag.MOVE_PAGE_X = e.touches[0].pageX
      this.drag.MOVE_PAGE_Y = e.touches[0].pageY

      // 初始化设置
      this.conf.CUT_T = this.data.cutT
      this.conf.CUT_L = this.data.cutL
      this.conf.CUT_R = this.data.cutR
      this.conf.CUT_B = this.data.cutB

      // 初始化最大移动区域
      this.drag.SPACE_TOP_POSITION = this.conf.CROPPER_HEIGHT - this.conf.CUT_B - this.conf.CUT_MIN_H
      this.drag.SPACE_BOTTOM_POSITION = this.conf.CROPPER_HEIGHT - this.conf.CUT_T - this.conf.CUT_MIN_H
      this.drag.SPACE_RIGHT_POSITION = this.conf.CROPPER_WIDTH - this.conf.CUT_L - this.conf.CUT_MIN_W
      this.drag.SPACE_LEFT_POSITION = this.conf.CROPPER_WIDTH - this.conf.CUT_R - this.conf.CUT_MIN_W
    },
    
    /**
     *  拖拽中
     */
    sideDragMove(e) {
      if (this.drag.IS_NO_DRAG) return
      if (!this.drag.IS_TOUCH_SIDE) return
      const type = e.target.dataset.drag
      if (this.properties.cutRatio === 0) {
        this.sideDragMoveDefault(e, type)
      } else {
        this.sideDragMoveConst(e, type)
      }
    },

    /**
     * 拖拽结束
     */
    sideDragEnd() {
      this.drag.IS_TOUCH_SIDE = false
      // console.log('sideDragEnd')
    },

    /**
     * 开始拖拽
     * 等比例的拖拽方式
     */
    sideDragMoveConst(e, type) {
      const xLength = (e.touches[0].pageX - this.drag.MOVE_PAGE_X) * this.conf.DRAG_MOVE_RATIO
      const yLength = (e.touches[0].pageY - this.drag.MOVE_PAGE_Y) * this.conf.DRAG_MOVE_RATIO
      switch (type) {
        case 'top':
          let top = this.conf.CUT_T + yLength
          top = Math.ceil(top >= this.drag.SPACE_TOP_POSITION ? this.drag.SPACE_TOP_POSITION : top)

          let topL = this.conf.CUT_L + yLength * this.properties.cutRatio
          topL = Math.ceil(topL >= this.drag.SPACE_LEFT_POSITION ? this.drag.SPACE_LEFT_POSITION : topL)

          if (topL < 0) {
            if (this.data.cutT <= 0) return
            if (this.data.cutL >= 0) return
            this.setData({
              cutL: 0
            })
            return
          }

          if (top <= 0) {
            this.setData({
              cutT: 0
            })
            return
          }

          this.setData({
            cutT: top,
            cutL: topL
          })
          break
        case 'left':
          let left = this.conf.CUT_L + xLength
          left = Math.ceil(left >= this.drag.SPACE_LEFT_POSITION ? this.drag.SPACE_LEFT_POSITION : left)

          let leftB = this.conf.CUT_B + xLength / this.properties.cutRatio
          leftB = Math.ceil(leftB >= this.drag.SPACE_BOTTOM_POSITION ? this.drag.SPACE_BOTTOM_POSITION : leftB)

          // console.log(leftB)
          // console.log(left)
          if (leftB < 0) {
            if (this.data.cutL <= 0) return
            if (this.data.cutB >= 0) return
            this.setData({
              cutB: 0
            })
            return
          }

          if (left <= 0) {
            this.setData({
              cutL: 0
            })
            return
          }

          this.setData({
            cutL: left,
            cutB: leftB
          })
          break
        case 'bottom':
          let bottom = this.conf.CUT_B - yLength
          bottom = Math.ceil(bottom >= this.drag.SPACE_BOTTOM_POSITION ? this.drag.SPACE_BOTTOM_POSITION : bottom)

          let bottomR = this.conf.CUT_R - yLength * this.properties.cutRatio
          bottomR = Math.ceil(bottomR >= this.drag.SPACE_RIGHT_POSITION ? this.drag.SPACE_RIGHT_POSITION : bottomR)

          if (bottomR < 0) {
            if (this.data.cutB <= 0) return
            if (this.data.cutR >= 0) return
            this.setData({
              cutR: 0
            })
            return
          }

          if (bottom <= 0) {
            this.setData({
              cutB: 0
            })
            return
          }

          this.setData({
            cutR: bottomR,
            cutB: bottom
          })
          break
        case 'right':
          let right = this.conf.CUT_R - xLength
          right = Math.ceil(right >= this.drag.SPACE_RIGHT_POSITION ? this.drag.SPACE_RIGHT_POSITION : right)

          let rightT = this.conf.CUT_T - xLength / this.properties.cutRatio
          rightT = Math.ceil(rightT >= this.drag.SPACE_TOP_POSITION ? this.drag.SPACE_TOP_POSITION : rightT)

          if (rightT < 0) {
            if (this.data.cutR <= 0) return
            if (this.data.cutT >= 0) return
            this.setData({
              cutT: 0
            })
            return
          }

          if (right <= 0) {
            this.setData({
              cutR: 0
            })
            return
          }

          this.setData({
            cutR: right,
            cutT: rightT
          })
          break
      }
    },

    /**
     * 非等比例拖拽的操作
     */
    sideDragMoveDefault(e, type) {
      const xLength = (e.touches[0].pageX - this.drag.MOVE_PAGE_X) * this.conf.DRAG_MOVE_RATIO
      const yLength = (e.touches[0].pageY - this.drag.MOVE_PAGE_Y) * this.conf.DRAG_MOVE_RATIO
      switch (type) {
        case 'top':
          let top = this.conf.CUT_T + yLength
          top = top <= 0 ? 0 : top
          top = Math.ceil(top >= this.drag.SPACE_TOP_POSITION ? this.drag.SPACE_TOP_POSITION : top)
          this.setData({
            cutT: top
          })
          break
        case 'bottom':
          let bottom = this.conf.CUT_B - yLength
          bottom = bottom <= 0 ? 0 : bottom
          bottom = Math.ceil(bottom >= this.drag.SPACE_BOTTOM_POSITION ? this.drag.SPACE_BOTTOM_POSITION : bottom)
          this.setData({
            cutB: bottom
          })
          break
        case 'right':
          let right = this.conf.CUT_R - xLength
          right = right <= 0 ? 0 : right
          right = Math.ceil(right >= this.drag.SPACE_RIGHT_POSITION ? this.drag.SPACE_RIGHT_POSITION : right)
          this.setData({
            cutR: right
          })
          break
        case 'left':
          let left = this.conf.CUT_L + xLength
          left = left <= 0 ? 0 : left
          left = Math.ceil(left >= this.drag.SPACE_LEFT_POSITION ? this.drag.SPACE_LEFT_POSITION : left)
          this.setData({
            cutL: left
          })
          break
        case 'rightBottom':
          let rightBottomR = this.conf.CUT_R - xLength
          rightBottomR = rightBottomR <= 0 ? 0 : rightBottomR
          rightBottomR = Math.ceil(rightBottomR >= this.drag.SPACE_RIGHT_POSITION ? this.drag.SPACE_RIGHT_POSITION : rightBottomR)

          let rightBottomB = this.conf.CUT_B - yLength
          rightBottomB = rightBottomB <= 0 ? 0 : rightBottomB
          rightBottomB = Math.ceil(rightBottomB >= this.drag.SPACE_BOTTOM_POSITION ? this.drag.SPACE_BOTTOM_POSITION : rightBottomB)
          this.setData({
            cutB: rightBottomB,
            cutR: rightBottomR
          })
          break
        default:
          break
      }
    },
  },
  
  created: function () {
    this.initStaticData()
    // console.log(this.drag)
    // console.log(this.conf)
    // console.log(this.data)
    // console.log(this.conf.DRAG_MOVE_RATIO)
  },

  attached: function () {
    // console.log('attached')
    this.loadImage()
  },

  ready: function () {
    // console.log('ready')
  },

  moved: function () {
    // console.log('moved')
  },

  detached: function () {
    // console.log('detached')
  }
})

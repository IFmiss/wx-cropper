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
      value: 0.6667
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
      value: 0
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

    qualityWidth: null,
    innerAspectRadio: null
  },

  /**
   * 组件的方法列表
   */
  methods: {
    close () {
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

        // 拖拽相关
        TOUCH_PAGE_X: null, // 手按下的x位置
        TOUCH_PAGE_Y: null, // 手按下y的位置

        MOVE_PAGE_X: null,  // 手移动的时候x的位置
        MOVE_PAGE_Y: null,  // 手移动的时候Y的位置
      }

      this.conf = {
        // 图片实际宽高
        IMG_REAL_W: null,   // 图片实际的宽度
        IMG_REAL_H: null,   // 图片实际的高度

        // 裁剪图片区域的信息
        CROPPER_IMG_W: null,    // 也就是 data.cropperW
        CROPPER_IMG_H: null,    // 也就是 data.cropperH

        // 移动的比例
        DRAFG_MOVE_RATIO: 750 / wx.getSystemInfoSync().windowWidth,  //移动时候的比例,

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
     * 初始化加载图片
     */
    loadImage () {
      const _this = this
      wx.showLoading({
        
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
    this.loadImage()
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

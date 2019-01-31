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
      default: 0.6667
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
      default: 0
    },

    /**
     * @type         string
     * @description  需要裁剪的图片地址
     */
    imageSrc: {
      type: String,
      default: ''
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
     * 
     */
  },

  /**
   * 组件的方法列表
   */
  methods: {
    close () {
      this.triggerEvent('close')
    }
  },
  
  created: function () {
    console.log('created')
  },

  attached: function () {
    console.log('attached')
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

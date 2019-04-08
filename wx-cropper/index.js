/**
 * wx-cropper 2.0
 * 基于微信小程序的图片裁剪工具
 * @author ifmiss
 */

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 是否使用showCropper
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
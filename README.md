## wx-cropper
基于原生的微信小程序的裁剪组件

### 引入
支持npm包管理的模式项目目录下执行
```code
npm i @dw/wx-cropper
```

也可以直接使用项目中的wx-cropper文件夹的文件，放到自己的项目中去

### 使用

在使用的页面的.json文件中注册
```json
{
  "usingComponents": {
    // "my-cropper": "./../wx-cropper/index"
  }
}
```

注册之后在使用的wxml的文件中引入该组件
```code
<my-cropper
  bind:close="hideCut"
  cutRatio="{{cutRatio}}"
  wx:if="{{showCropper}}"
  imageSrc="{{imageSrc}}"
  cropperRatio={{cropperRatio}}
  cropperWidth={{cropperWidth}}
  minCropperW={{minCropperW}}/>
```

### 参数配置
#### `close`: 事件  参数为img, 在点击关闭的时候没有这个参数，只有在生成图片的时候才有
```ts
  path: string;
  width: number;
  height: number;
```
```code
hideCut () {
  this.setData({
    showCropper: false
  })
  const img = arguments[0].detail
  if (img && img.path) {
    console.log(img)
    this.setData({
      imageInfo: img
    })
  }
}
```
#### `cutRatio`   初始化的裁剪比例
```js
/**
 * @type         number
 * @description  初始化的裁剪比例
 * @example 0    默认初始化的裁剪区域宽高为图片的宽高，且裁剪比例不固定
 * @example 0.5  宽高比例固定，且宽和高的比例为 1 : 2 的比例
 * @example 2    宽高比例固定，且宽和高的比例为 2 : 1 的比例
 */
```

#### `cropperRatio`   组件裁剪显示区域的最大比例
```js
/**
 * @type         number
 * @description  组件裁剪显示区域的最大比例，如果裁剪的图片过长，则做限制，默认最大宽高比例为 宽640 / 高960 (宽高比例)
 * @example 1    如果CROPPER_WIDTH宽度是720px，那么裁剪区域的高度也就是 CROPPER_WIDTH / cropperRatio 为 720px;
 */
```

#### `imageSrc`   需要裁剪的图片地址 支持本地和线上

#### `cropperWidth`   裁剪区域的宽度 默认720  居中显示

#### `minCropperW`    裁剪区域最小宽度， 如果是等比例 按照最短的计算

#### 裁剪区域固定宽高
![](https://github.com/IFmiss/wx-cropper/blob/v2/2.jpg)

```js
```

#### 裁剪之后的效果

![](https://github.com/IFmiss/wx-cropper/blob/v2/1.jpg) 
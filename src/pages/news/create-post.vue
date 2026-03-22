<template>
  <view class="create-post-container">
    <u-navbar title="发布动态" :autoBack="true" bgColor="#fff" :placeholder="true">
      <template #right>
        <u-button 
          type="primary" 
          shape="circle" 
          text="发布" 
          @click="handleSubmit" 
          :loading="isSubmitting"
		  class="navbar-btn"
        ></u-button>
      </template>
    </u-navbar>

    <!-- <view class="top-spacer"></view> -->

    <view class="editor-wrap">
      <textarea 
        v-model="postContent" 
        class="post-textarea" 
        placeholder="分享你的理财心得、股票见解..." 
        maxlength="500"
        :focus="true"
        placeholder-style="color:#bbb;"
      ></textarea>
      
      <view class="img-preview-list" v-if="mockImgs.length > 0">
        <image v-for="(img, idx) in mockImgs" :key="idx" :src="img" mode="aspectFill" class="preview-img"></image>
      </view>
    </view>

    <view class="tools-bar">
      <view class="tool-item" @click="insertStock">
        <view class="icon-wrap"><u-icon name="integral" color="#3c9cff" size="26"></u-icon></view>
        <text class="tool-txt">股票</text>
      </view>
      <view class="tool-item" @click="insertTopic">
        <view class="icon-wrap"><u-icon name="heart" color="#f56c6c" size="26"></u-icon></view>
        <text class="tool-txt">话题</text>
      </view>
      <view class="tool-item" @click="insertMockImage">
        <view class="icon-wrap"><u-icon name="camera" color="#5ac725" size="26"></u-icon></view>
        <text class="tool-txt">配图</text>
      </view>
    </view>
    
    <view class="safe-area-inset-bottom"></view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { createPostApi } from '@/api/community'

const postContent = ref('')
const isSubmitting = ref(false)
const mockImgs = ref([]) // 存放模拟上传的图片链接

// 逻辑保持不变
const insertStock = () => {
  const stockList = ['贵州茅台(600519)', '中芯国际(688981)', '北方华创(002371)', '东方财富(300059)']
  uni.showActionSheet({
    itemList: stockList,
    success: (res) => {
      postContent.value += `【${stockList[res.tapIndex]}】`
    }
  })
}

const insertTopic = () => {
  const topicList = ['#半导体大跌#', '#牛市来了#', '#茅台分红#']
  uni.showActionSheet({
    itemList: topicList,
    success: (res) => {
      postContent.value += `${topicList[res.tapIndex]} `
    }
  })
}

const insertMockImage = () => {
  if (mockImgs.value.length >= 3) return uni.showToast({ title: '最多3张', icon: 'none' })
  // 模拟图片链接
  mockImgs.value.push('https://cdn.uviewui.com/uview/album/3.jpg')
  uni.showToast({ title: '图片已上传', icon: 'success' })
}

const handleSubmit = async () => {
  if (!postContent.value.trim()) return uni.showToast({ title: '内容不能为空', icon: 'none' })
  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    const imgsStr = mockImgs.value.join(',')
    const res = await createPostApi({
      content: postContent.value,
      imgs: imgsStr
    })

    if (res.code === 200) {
      uni.showToast({ title: '发布成功！', icon: 'success' })
      setTimeout(() => { uni.navigateBack() }, 1000)
    }
  } catch (err) {
    console.log(err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.create-post-container { 
  min-height: 100vh; 
  background-color: #fff; 
  display: flex;
  flex-direction: column;
}

// .top-spacer {
//   height: 60rpx;
//   width: 100%;
// }
.navbar-btn {
	width: 150rpx;
	height: 60rpx;
	font-size: 32rpx;
	margin-right: 20rpx;
	margin-top: 5rpx;
}
.editor-wrap { 
  padding: 0 40rpx; // 👉 稍微增大边距
  flex: 1; 
}

.post-textarea { 
  width: 100%; 
  height: 400rpx; 
  font-size: 34rpx; // 👉 增大字体，更有质感
  line-height: 1.6; // 👉 增大行高
  color: #333; 
}

.img-preview-list { 
  display: flex; 
  gap: 20rpx; 
  margin-top: 30rpx; 
  .preview-img { 
    width: 200rpx; 
    height: 200rpx; 
    border-radius: 12rpx; 
    border: 1rpx solid #eee; 
  } 
}

// 👉 修正点：底部快捷工具栏对齐修正版
.tools-bar { 
  position: fixed; 
  bottom: 0; 
  left: 0; 
  width: 100%; 
  height: 120rpx; // 👉 稍微加高
  background-color: #fcfcfc; 
  border-top: 1rpx solid #eee; 
  display: flex; 
  flex-direction: row;
  align-items: center; 
  justify-content: flex-start; 
  padding: 0 40rpx; 
  gap: 60rpx; 
  padding-bottom: env(safe-area-inset-bottom); // 核心：全面屏安全区
  z-index: 10;
}

.tool-item { 
  display: flex; 
  flex-direction: row; 
  align-items: center; // 👉 核心：整体垂直居中对齐
  
  // 👉 包裹图标，确保对齐
  .icon-wrap {
    margin-right: 14rpx; // 👉 增大间距
    display: flex;
    align-items: center; // 👉 确保图标本身也垂直居中
    justify-content: center;
  }
  
  .tool-txt { 
    font-size: 30rpx; // 👉 加大字体
    color: #555; 
  } 
}

// 安全区占位
.safe-area-inset-bottom {
  height: env(safe-area-inset-bottom);
  width: 100%;
}
</style>
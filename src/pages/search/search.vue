<template>
  <view class="search-container">
    <view class="search-header flex-row align-center">
	  <u-icon name="arrow-left" size="22" color="#333" @click="goBack" class="back-icon"></u-icon>
      
      <view class="search-input-box flex-row align-center">
        <u-icon name="search" size="18" color="#999" customStyle="margin-right: 10rpx;"></u-icon>
        <input class="input-el" v-model="keyword" placeholder="低价小市值股战法" focus confirm-type="search" @confirm="handleSearch" />
        
        <view class="upload-icon-wrap" @click="chooseImageToSearch">
          <u-icon name="camera-fill" size="20" color="#a0a0a0"></u-icon>
        </view>
      </view>
      
      <text class="search-btn" @click="handleSearch">搜索</text>
    </view>

    <view class="section-box" v-if="historyList.length > 0">
      <view class="sec-header flex-row-between align-center">
        <text class="title">历史搜索</text>
        <u-icon name="trash" size="20" color="#999" @click="clearHistory"></u-icon>
      </view>
      <view class="tags-wrap flex-row">
        <view class="tag-item" v-for="(item, index) in historyList" :key="index" @click="clickTag(item)">
          {{ item }}
        </view>
      </view>
    </view>

   <view class="section-box">
	 <view class="sec-header flex-row-between align-center">
	   <text class="title">搜索发现</text>
	   <u-icon :name="showHot ? 'eye' : 'eye-off'" size="20" color="#999" @click="showHot = !showHot"></u-icon>
	 </view>
	 
	 <view class="hot-list flex-row" v-if="showHot">
	   <view class="hot-item flex-row align-center" v-for="(item, index) in hotList" :key="index" @click="clickTag(item.text)">
		 <text class="rank" :class="index < 3 ? 'rank-top' : ''">{{ index + 1 }}</text>
		 <text class="hot-text u-line-1">{{ item.text }}</text>
		 <text v-if="item.isHot" class="hot-emoji">🔥</text>
	   </view>
	 </view>

	 <view class="hidden-tip flex-center" v-else>
	   <text>当前搜索发现已隐藏</text>
	 </view>
   </view>
	   
  </view>
</template>

<script setup>
import { ref } from 'vue'

const keyword = ref('')
// 控制搜索发现是否显示的开关，默认打开
const showHot = ref(true)
// 模拟历史数据
const historyList = ref(['贵州茅台', '宁德时代', '低空经济概念', 'ETF基金'])

// 模拟搜索发现数据
const hotList = ref([
  { text: '低价小市值股战法', isHot: true },
  { text: 'A股三大指数集体高开', isHot: true },
  { text: '高股息资产受追捧', isHot: false },
  { text: '半导体板块异动拉升', isHot: false },
  { text: '黄金价格突破历史新高', isHot: true },
  { text: '固收+理财推荐', isHot: false }
])

const goBack = () => uni.navigateBack()

// 执行搜索逻辑
const handleSearch = () => {
  if (!keyword.value.trim()) {
    uni.showToast({ title: '请输入搜索内容', icon: 'none' })
    return
  }
  // 插入到历史记录前面，去重
  historyList.value = [keyword.value, ...historyList.value.filter(item => item !== keyword.value)].slice(0, 10)
  uni.showToast({ title: `搜索：${keyword.value}`, icon: 'none' })
}

// 点击标签快速搜索
const clickTag = (text) => {
  keyword.value = text
  handleSearch()
}

const clearHistory = () => {
  uni.showModal({
    title: '提示',
    content: '确认清空历史搜索吗？',
    success: (res) => {
      if (res.confirm) historyList.value = []
    }
  })
}

// 👉 触发图片上传功能
const chooseImageToSearch = () => {
  uni.chooseImage({
    count: 1,
    sourceType: ['album', 'camera'],
    success: (res) => {
      console.log('选中的图片路径：', res.tempFilePaths[0])
      uni.showToast({ title: '图片识别中...', icon: 'loading' })
      // TODO: 未来对接后端 Python 的图片识别/OCR 接口
    }
  })
}
</script>

<style lang="scss" scoped>
.search-container { min-height: 100vh; background-color: #fff; }

/* 1. 顶部搜索区域 */
.search-header {
  padding: 20rpx 30rpx;
  padding-top: calc(20rpx + var(--status-bar-height)); /* 状态栏 */
  background: #fff;
  
  .search-input-box {
    flex: 1;
    height: 70rpx;
    background-color: #f5f6fa;
    border-radius: 35rpx;
    padding: 0 24rpx;
    
    .input-el { flex: 1; font-size: 28rpx; color: #333; height: 100%; }
    
    .upload-icon-wrap {
      padding: 10rpx; /* 增加点击区域 */
      border-left: 1px solid #e0e0e0; /* 分割线 */
      margin-left: 10rpx;
    }
	
	.back-icon {
	  margin-right: 20rpx;
	}
  }
  
  .search-btn { font-size: 30rpx; color: #e62c2c; font-weight: bold; margin-left: 30rpx; }
}

/* 2. 通用区块标题 */
.section-box {
  padding: 40rpx 30rpx 0;
  
  .sec-header {
    margin-bottom: 30rpx;
    .title { font-size: 30rpx; font-weight: bold; color: #333; }
  }
}

/* 历史搜索标签 */
.tags-wrap {
  flex-wrap: wrap; 
  .tag-item {
    background-color: #f5f6fa;
    color: #666;
    font-size: 26rpx;
    padding: 12rpx 30rpx;
    border-radius: 30rpx;
    margin-right: 20rpx;
    margin-bottom: 20rpx;
    white-space: nowrap;
  }
}

/* 搜索发现列表 */
.hot-list {
  flex-wrap: wrap; 
  .hot-item {
    width: 50%; /* 一行放两个 */
    margin-bottom: 36rpx;
    padding-right: 20rpx;
    flex-shrink: 0; 
    box-sizing: border-box;

    .rank { 
      font-size: 28rpx; color: #999; font-weight: bold; width: 40rpx; 
      &.rank-top { color: #e62c2c; } 
    }
    .hot-text { font-size: 28rpx; color: #333; flex: 1; }
	.hot-emoji {
	  font-size: 28rpx;
	  margin-left: 8rpx;
	}
  }
}
</style>
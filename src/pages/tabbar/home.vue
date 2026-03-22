<template>
  <view class="home-container">
    <view class="top-header">
      <view class="status-bar-placeholder"></view>
      
      <view class="nav-bar u-flex u-col-center">
        <view class="scan-wrap" @click="handleScan">
          <u-icon name="scan" color="#ffffff" size="28"></u-icon>
        </view>
        
       <!-- <view class="search-box u-flex u-col-center">
          <u-icon name="search" color="rgba(255,255,255,0.8)" size="18"></u-icon>
          <text class="search-txt">输入股票代码/拼音/理财名称</text>
        </view> -->
		<view class="search-box u-flex u-col-center">
		  <u-icon name="search" color="rgba(255,255,255,0.8)" size="18"></u-icon>
		  <text class="search-txt">输入股票代码/拼音/理财名称</text>
		</view>
		
		<view class="ai-wrap" @click="goToAiChat">
		  <u-icon name="server-fill" color="#ffffff" size="28"></u-icon>
		</view>
		
      </view>
    </view>

    <view class="main-content">
      
      <view class="card-box menu-grid">
        <u-grid :border="false" col="4">
          <u-grid-item v-for="(item, index) in menus" :key="index" @click="showToast(item.name)">
            <view class="menu-item u-flex-col u-col-center">
              <u-icon :name="item.icon" :color="item.color" size="34"></u-icon>
              <text class="menu-txt">{{ item.name }}</text>
            </view>
          </u-grid-item>
        </u-grid>
      </view>

      <view class="card-box stock-list">
        <view class="list-header u-flex u-row-between u-col-center">
          <text class="title">热门自选</text>
          <u-icon name="arrow-right" color="#a0a0a0" size="16"></u-icon>
        </view>
        
        <view class="stock-item u-flex u-row-between u-col-center" v-for="(stock, i) in hotStocks" :key="i" @click="goToMarket">
          <view class="s-left">
            <text class="s-name u-line-1">{{ stock.name }}</text>
            <text class="s-code">{{ stock.code }}</text>
          </view>
          
          <view class="s-mid u-text-right">
            <text class="s-price" :class="stock.isUp ? 'red' : 'green'">{{ stock.price }}</text>
          </view>
          
          <view class="s-right u-flex u-row-right">
            <view class="s-percent" :class="stock.isUp ? 'bg-red' : 'bg-green'">
              {{ stock.percent }}
            </view>
          </view>
        </view>
      </view>
      
    </view>
    
    <u-toast ref="uToastRef"></u-toast>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const uToastRef = ref(null)

const menus = [
  { name: '行情中心', icon: 'grid-fill', color: '#ff4d4f' },
  { name: '模拟炒股', icon: 'play-right-fill', color: '#ff9900' },
  { name: '理财产品', icon: 'bag-fill', color: '#2979ff' },
  { name: '新手入门', icon: 'bookmark-fill', color: '#19be6b' }
]

const hotStocks = [
  { name: '贵州茅台', code: '600519', price: '1688.50', percent: '+1.25%', isUp: true },
  { name: '宁德时代', code: '300750', price: '205.10', percent: '-0.85%', isUp: false },
  { name: '智汇金融', code: '992036', price: '32.45', percent: '+2.10%', isUp: true }
]

const handleScan = () => {
  uni.scanCode({
    success: function (res) {
      console.log('条码内容：' + res.result)
    }
  })
}

const goToMarket = () => uni.switchTab({ url: '/pages/market/market' })
const goToAiChat = () => uni.navigateTo({ url: '/pages/ai/ai-chat' })
const showToast = (msg) => uToastRef.value.show({ type: 'default', message: msg })
</script>

<style lang="scss" scoped>
.home-container {
  min-height: 100vh;
  background-color: #f6f7fb;
  padding-bottom: 50rpx;
}

/* 顶部红色头部极致精简 */
.top-header {
  background: #ff4d4f;
  /* 高度调小，去掉不必要的留白 */
  padding: 20rpx 30rpx 80rpx; 
  position: relative;
  
  .status-bar-placeholder {
    height: 44rpx;
    width: 100%;
  }
  
  .nav-bar {
    padding-top: 10rpx;
    
    .scan-wrap {
      margin-right: 24rpx; /* 扫码和搜索框的间距 */
    }
    
    .search-box {
      flex: 1;
      height: 68rpx;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 34rpx;
      padding: 0 30rpx;
      
      .search-txt {
        color: rgba(255, 255, 255, 0.9);
        font-size: 26rpx;
		line-height: 68rpx;
        margin-left: 14rpx;
      }
    }
	.ai-wrap {
	  margin-left: 24rpx;
	}
  }
}

.main-content {
  /* 负边距，让下方的卡片插进红色的背景里，消灭死白 */
  margin-top: -50rpx; 
  padding: 0 30rpx;
  position: relative;
  z-index: 10;
}

.card-box {
  background: #fff;
  border-radius: 24rpx; /* 圆角改大，更现代 */
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03);
}

.menu-grid {
  padding: 20rpx 0;
  .menu-item {
	width: 100%; 
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	margin: 10rpx 0;
  }
  .menu-txt {
    font-size: 26rpx;
    color: #333;
    margin-top: 16rpx;
    font-weight: 500;
	text-align: center;
  }
}

.stock-list {
  padding: 30rpx;
  
  .list-header {
    margin-bottom: 30rpx;
    .title {
      font-size: 34rpx;
      font-weight: bold;
      color: #333;
    }
  }
  
  .stock-item {
    margin-bottom: 30rpx;
    padding-bottom: 30rpx;
    border-bottom: 1px solid #f5f5f5;
    
    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    
    .s-left {
      width: 40%;
      .s-name { font-size: 32rpx; color: #333; font-weight: bold; display: block; }
      .s-code { font-size: 24rpx; color: #999; margin-top: 6rpx; display: block; }
    }
    
    .s-mid {
      flex: 1;
      .s-price { font-size: 36rpx; font-weight: bold; font-family: 'Courier New', Courier, monospace; }
    }
    
    .s-right {
      width: 140rpx;
      .s-percent {
        width: 100%;
        height: 52rpx;
        line-height: 52rpx;
        text-align: center;
        color: #fff;
        border-radius: 10rpx;
        font-weight: bold;
        font-size: 28rpx;
      }
    }
    
    .red { color: #ff4d4f; }
    .green { color: #00b578; }
    .bg-red { background: #ff4d4f; }
    .bg-green { background: #00b578; }
  }
}
</style>
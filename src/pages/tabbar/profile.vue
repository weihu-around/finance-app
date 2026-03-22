<template>
  <view class="profile-container">
    <view class="header-bg">
      <view class="status-bar-placeholder"></view>
      
      <view v-if="!userStore.isLogin" class="unlogin-box">
        <view class="login-btn-rect" @click="goToLogin">
          <text class="btn-txt">立即登录/注册</text>
        </view>
      </view>

      <view v-else class="user-row-box u-flex u-row-between u-col-center">
        <view class="left u-flex u-col-center">
          <u-avatar :src="userInfo.avatar" size="76" class="user-avatar"></u-avatar>
          <view class="user-info">
            <text class="name">{{ userInfo.nickname }}</text>
            <text class="phone">138****9527</text>
          </view>
        </view>
        <view class="logout-btn-wrap">
          <u-button text="退出" class="logout-btn" @click="handleLogout"></u-button>
        </view>
      </view>
    </view>

    <view class="main-content">
      
      <view v-if="userStore.isLogin" class="assets-wrap">
        <view class="asset-card">
          <view class="card-header u-flex u-row-between u-col-center">
            <text class="label">总资产折算 (元)</text>
            <u-icon :name="showMoney ? 'eye' : 'eye-off'" color="#a0a0a0" size="22" @click="toggleMoney"></u-icon>
          </view>
          
          <view class="balance-box">
            <text class="symbol">¥</text>
            <u-count-to v-if="showMoney" :startVal="0" :endVal="1284530.50" :decimals="2" color="#ffffff" fontSize="36" bold></u-count-to>
            <text v-else class="mask-text">****</text>
          </view>

          <view class="card-stats">
            <view class="stat-item">
              <text class="s-label">昨日收益</text>
              <text class="s-value" :class="showMoney ? 'profit-red' : ''">{{ showMoney ? '+1,205.42' : '****' }}</text>
            </view>
            <view class="stat-item">
              <text class="s-label">累计盈亏</text>
              <text class="s-value" :class="showMoney ? 'profit-red' : ''">{{ showMoney ? '+12.45%' : '****' }}</text>
            </view>
          </view>
        </view>

        <view class="asset-distribution">
          <view class="list-header">资产分布</view>
          <u-cell-group :border="false">
            <u-cell v-for="(asset, i) in assetList" :key="i" :title="asset.name" :label="asset.desc" isLink :border="i !== assetList.length - 1">
              <template #icon>
                <u-icon name="integral-fill" :color="asset.color" size="28" class="asset-icon"></u-icon>
              </template>
              <template #value>
                <text class="cell-value">{{ showMoney ? asset.amount : '****' }}</text>
              </template>
            </u-cell>
          </u-cell-group>
        </view>
      </view>

      <view class="list-wrap">
        <u-cell-group :border="false">
          <u-cell icon="star" title="我的自选" isLink></u-cell>
          <u-cell icon="order" title="交易记录" isLink></u-cell>
          <u-cell icon="server-man" title="在线客服" isLink></u-cell>
          <u-cell icon="setting" title="系统设置" isLink :border="false"></u-cell>
        </u-cell-group>
      </view>

      <view class="version-txt">智汇理财 MVP v2.0.0</view>
    </view>
  </view>
</template>

<script setup>
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const showMoney = ref(true)
const toggleMoney = () => showMoney.value = !showMoney.value

const assetList = [
  { name: '活期储蓄', desc: '招商银行 (8888)', amount: '￥430,000.00', color: '#2979ff' },
  { name: '稳健基金', desc: '嘉实增长混合 A', amount: '￥650,430.50', color: '#e62c2c' },
  { name: '数字资产', desc: 'BTC / ETH 现货', amount: '￥204,100.00', color: '#ff9900' }
]

const goToLogin = () => uni.navigateTo({ url: '/pages/login/login' })

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出当前账号吗？',
    confirmColor: '#e62c2c',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        showMoney.value = true
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.profile-container {
  min-height: 100vh; 
  background-color: #f6f7fb;
  padding-bottom: 60rpx;
}

.header-bg {
  background: #e62c2c;
  height: 420rpx;
  padding-top: 50rpx;
  position: relative;
  .status-bar-placeholder { height: 44rpx; width: 100%; }
}

.unlogin-box {
  width: 100%;
  height: 200rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-btn-rect {
  background-color: #FDF1E6;
  border-radius: 12rpx;
  width: 440rpx;
  height: 88rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(230, 44, 44, 0.2);
  .btn-txt { font-size: 34rpx; font-weight: bold; color: #C93A2B; letter-spacing: 2rpx; }
}

.user-row-box {
  width: 100%;
  padding: 20rpx 40rpx;
  
  /* 👉 新增：头像统一样式 */
  .user-avatar {
    border: 4rpx solid rgba(255, 255, 255, 0.4);
    border-radius: 50%;
  }

  .user-info { 
    margin-left: 30rpx; color: #fff; 
    .name { font-size: 38rpx; font-weight: bold; display: block; } 
    .phone { font-size: 26rpx; opacity: 0.8; margin-top: 10rpx; display: block; } 
  }

  /* 👉 新增：退出按钮统一样式 (使用 !important 压制框架默认 border) */
  .logout-btn-wrap {
    .logout-btn {
      margin-left: 18rpx;
      height: 52rpx !important;
      border-color: rgba(255, 255, 255, 0.6) !important;
      font-weight: bold;
    }
  }
}

.main-content {
  margin-top: -160rpx;
  padding: 0 30rpx;
  position: relative;
  z-index: 10;
}

.assets-wrap { margin-bottom: 30rpx; }

.asset-card {
  background: linear-gradient(135deg, #2c2c2e 0%, #111112 100%);
  border-radius: 24rpx;
  padding: 40rpx;
  color: #fff;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
  margin-bottom: 30rpx;
  
  .card-header .label { font-size: 26rpx; opacity: 0.8; }
  .balance-box {
    margin: 30rpx 0 40rpx; display: flex; align-items: baseline; height: 70rpx;
    .symbol { font-size: 40rpx; margin-right: 10rpx; }
    .mask-text { font-size: 50rpx; letter-spacing: 10rpx; }
  }
  .card-stats {
    display: flex; border-top: 1rpx solid rgba(255, 255, 255, 0.08); padding-top: 30rpx;
    .stat-item {
      flex: 1;
      .s-label { font-size: 24rpx; opacity: 0.6; display: block; }
      .s-value { font-size: 30rpx; margin-top: 10rpx; display: block; font-weight: bold; font-family: 'Courier New', Courier, monospace; }
      .profit-red { color: #e62c2c; }
    }
  }
}

.asset-distribution {
  background: #fff;
  border-radius: 24rpx;
  padding: 10rpx 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03);
  
  .list-header {
    font-size: 32rpx; font-weight: bold; padding: 20rpx 0 20rpx 20rpx; position: relative; color: #303133;
    &::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 8rpx; height: 30rpx; background-color: #1c1c1e; border-radius: 4rpx; }
  }
  .cell-value { font-size: 30rpx; color: #303133; font-weight: bold; font-family: 'Courier New', Courier, monospace;}
  
  /* 👉 新增：穿透控制资产列表的左侧小图标 */
  .asset-icon { margin-right: 15rpx; }

  /* 👉 重点：利用深层选择器，统一控制这里的标题样式 */
  :deep(.u-cell) { 
    height: 120rpx; 
    .u-cell__title-text { font-weight: bold; color: #303133; font-size: 30rpx; }
  }
}

.list-wrap {
  background: #fff;
  border-radius: 24rpx;
  padding: 10rpx 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03);
  
  /* 👉 重点：利用深层选择器，统一控制底部列表的标题样式 */
  :deep(.u-cell) {
    margin: 20rpx 0 0 0;
    .u-cell__title-text { color: #333333 !important; font-weight: bold; font-size: 30rpx; }
  }
}

.version-txt {
  text-align: center; color: #c0c4cc; font-size: 22rpx; margin-top: 50rpx;
}
</style>
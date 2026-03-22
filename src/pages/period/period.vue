<template>
  <view class="period-container">
    <u-navbar title="周期设置" :autoBack="true" bgColor="#e62c2c" titleStyle="color: #fff; font-weight: bold;" leftIconColor="#fff" :placeholder="true"></u-navbar>
    
    <view class="list-header flex-row-between align-center">
      <text class="c-999">周期</text>
      <text class="c-999">拖动排序</text>
    </view>

    <view class="side-tips">
      <view class="tip-out">显示在外面</view>
      <view class="tip-in">收起在更多里</view>
    </view>

    <view class="drag-list">
      <view 
        class="drag-item flex-row-between align-center" 
        v-for="(item, index) in list" 
        :key="item.key"
        :class="{ 'is-dragging': draggingIndex === index }"
        @touchstart="onTouchStart($event, index)"
        @touchmove.prevent="onTouchMove($event)"
        @touchend="onTouchEnd"
      >
        <text class="item-name">{{ item.name }}</text>
        <u-icon name="list" color="#ccc" size="20"></u-icon>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMarketStore } from '@/store/market'

const marketStore = useMarketStore()
const list = ref([])

onMounted(() => {
  // 深拷贝一份数据用于本地排序操作
  list.value = JSON.parse(JSON.stringify(marketStore.periodList))
})

// =================👉 纯原生触摸拖拽排序逻辑 =================
const draggingIndex = ref(-1)
let initialY = 0      // 锚定刚按下时的 Y 坐标
let initialIndex = 0  // 锚定刚按下时的 索引
let itemHeight = 0    // 真实的物理像素高度

onMounted(() => {
  list.value = JSON.parse(JSON.stringify(marketStore.periodList))
  // 👉 核心修复 1：将 rpx 动态转换为当前设备的真实 px 值
  itemHeight = uni.upx2px(100) 
})

const onTouchStart = (e, index) => {
  draggingIndex.value = index
  initialIndex = index
  initialY = e.touches[0].clientY
}

const onTouchMove = (e) => {
  if (draggingIndex.value === -1) return
  const currentY = e.touches[0].clientY
  
  // 👉 核心修复 2：永远和第一次按下的初始位置做对比，绝不产生误差累计
  const moveDistance = currentY - initialY
  
  const moveCount = Math.round(moveDistance / itemHeight)
  let targetIndex = initialIndex + moveCount

  // 边界保护
  if (targetIndex < 0) targetIndex = 0
  if (targetIndex >= list.value.length) targetIndex = list.value.length - 1

  // 如果位置变了，执行数组元素交换
  if (targetIndex !== draggingIndex.value) {
    const temp = list.value[draggingIndex.value]
    list.value.splice(draggingIndex.value, 1)
    list.value.splice(targetIndex, 0, temp)
    
    // 只更新当前的高亮索引，不重置初始 Y 坐标！
    draggingIndex.value = targetIndex
  }
}

const onTouchEnd = () => {
  draggingIndex.value = -1
  marketStore.updatePeriodList(list.value)
}
</script>

<style lang="scss" scoped>
.period-container { min-height: 100vh; background-color: #fff; position: relative; }
.c-999 { color: #999; font-size: 26rpx; }

.list-header { padding: 20rpx 40rpx 20rpx 100rpx; background: #f9f9f9; border-bottom: 1px solid #eee; }

/* 左侧红蓝提示文字 */
.side-tips {
  position: absolute; left: 0; top: 100rpx; bottom: 0; width: 80rpx;
  .tip-out { position: absolute; top: 180rpx; left: 20rpx; width: 30rpx; color: #e62c2c; font-size: 24rpx; word-wrap: break-word; text-align: center; line-height: 1.2; }
  .tip-in { position: absolute; top: 650rpx; left: 20rpx; width: 30rpx; color: #2979ff; font-size: 24rpx; word-wrap: break-word; text-align: center; line-height: 1.2; }
}

.drag-list {
  padding-left: 80rpx; /* 留出左侧提示的空间 */
  .drag-item {
    height: 100rpx;
    padding-right: 40rpx;
    border-bottom: 1px solid #f5f5f5;
    background-color: #fff;
    transition: box-shadow 0.2s;
    
    /* 第5个元素底部加粗边框，区分内外 */
    &:nth-child(5) { border-bottom: 2px solid #e5e5e5; }
    
    .item-name { font-size: 30rpx; color: #333; }
    
    /* 拖拽时的悬浮高亮状态 */
    &.is-dragging { background-color: #f0f5ff; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1); z-index: 99; position: relative; }
  }
}
</style>
<template>
  <view class="market-container">
    <u-navbar bgColor="#e62c2c" leftIcon="" :placeholder="true">
      <template #center>
        <view class="navbar-stock-title flex-row align-center">
          <u-icon name="play-left-fill" color="#f2f2f2" size="16" @click="prevStock" customStyle="padding: 10rpx;"></u-icon>
          
          <view class="stock-info flex-column align-center">
            <text class="s-name">{{ currentStock.name }}</text>
            <text class="s-code">{{ currentStock.code }}</text>
          </view>
          
          <u-icon name="play-right-fill" color="#f2f2f2" size="16" @click="nextStock" customStyle="padding: 10rpx;"></u-icon>
        </view>
      </template>
      <template #right>
        <u-icon name="search" color="#fff" size="24" customStyle="margin-right: 20rpx;" @click="goToSearch"></u-icon>
      </template>
    </u-navbar>

    <view class="stock-header flex-row-between align-center">
      <view class="price-box">
        <text class="current-price" :style="{ color: priceColor }">{{ currentStock.price.toFixed(2) }}</text>
        <view class="price-detail flex-row align-center">
          <text class="diff" :style="{ color: priceColor }">{{ currentStock.diff > 0 ? '+' : '' }}{{ currentStock.diff.toFixed(2) }}</text>
          <text class="percent" :style="{ color: priceColor }">{{ currentStock.percent > 0 ? '+' : '' }}{{ currentStock.percent.toFixed(2) }}%</text>
        </view>
      </view>
      
      <view class="info-details flex-row">
        <view class="detail-col">
          <view class="item flex-row align-center"><text class="lbl">高</text><text class="val" :style="{ color: upColor }">{{ currentStock.high.toFixed(2) }}</text></view>
          <view class="item flex-row align-center"><text class="lbl">低</text><text class="val" :style="{ color: downColor }">{{ currentStock.low.toFixed(2) }}</text></view>
          <view class="item flex-row align-center"><text class="lbl">开</text><text class="val" :style="{ color: upColor }">{{ currentStock.open.toFixed(2) }}</text></view>
        </view>
        <view class="detail-col" style="margin-left: 30rpx;">
          <view class="item flex-row align-center"><text class="lbl">量</text><text class="val-unit">{{ currentStock.volume }}亿</text></view>
          <view class="item flex-row align-center"><text class="lbl">额</text><text class="val-unit">{{ currentStock.amount }}亿</text></view>
          <view class="item flex-row align-center"><text class="lbl">换</text><text class="val-unit">{{ currentStock.turnover }}%</text></view>
        </view>
      </view>
    </view>
	
	<view class="custom-tabs-container">
	  <view class="tabs-bar flex-row align-center">
		<view class="tab-items flex-row align-center">
		  <text 
			v-for="item in visiblePeriods" :key="item.key"
			class="t-item" :class="{ 'active': currentTab === item.key }"
			@click="selectPeriod(item.key)"
		  >{{ item.name }}</text>
		</view>
		
		<view class="more-btn flex-row-center" @click="toggleMore">
		  <text :class="{ 'active': isHiddenPeriodActive }">更多</text>
		  <view class="triangle-icon" :class="{ 'up': showMore }"></view>
		</view>
		
		<view class="setting-btn flex-row-center" @click="goToPeriodSetting">
		  <u-icon name="setting" size="20" color="#666"></u-icon>
		</view>
	  </view>

	  <view class="more-panel" v-show="showMore">
		<scroll-view class="panel-scroll" scroll-x="true" :show-scrollbar="false">
		  <view class="scroll-content">
			<view 
			  class="s-item" 
			  v-for="item in hiddenPeriods" :key="item.key"
			  :class="{ 'active': currentTab === item.key }"
			  @click="selectPeriod(item.key)"
			>
			  {{ item.name }}
			</view>
			
			<view class="s-item sort-item" @click="goToPeriodSetting">
			  <u-icon name="list" size="16" color="#666" customStyle="margin-right: 6rpx;"></u-icon>
			  <text>排序</text>
			</view>
		  </view>
		</scroll-view>
	  </view>
	</view>
	
    <view class="chart-wrapper">
      <view class="chart-tools flex-row-between align-center">
        <text class="mode-text">{{ isChineseMarket ? '🇨🇳 沪深A股模式' : '🇺🇸 国际/加密模式' }}</text>
        <view class="switch-btn flex-row align-center" @click="toggleMarketMode">
          <u-icon name="reload" size="14" :color="isChineseMarket ? '#e62c2c' : '#00b578'"></u-icon>
          <text class="btn-txt" :style="{ color: isChineseMarket ? '#e62c2c' : '#00b578' }">
            {{ isChineseMarket ? '红涨绿跌' : '绿涨红跌' }}
          </text>
        </view>
      </view>

      <l-echart ref="chartRef" @finished="onChartReady"></l-echart>
    </view>

    <view class="bottom-bar flex-row-between align-center">
      <u-button text="加自选" plain shape="circle" color="#e62c2c" customStyle="width: 45%; height: 70rpx; font-weight:bold;"></u-button>
      <u-button text="立即交易" shape="circle" color="#e62c2c" customStyle="width: 45%; height: 70rpx; font-weight:bold;"></u-button>
    </view>
    
    <u-toast ref="uToastRef"></u-toast>
  </view>
</template>

<script setup>
import * as echarts from 'echarts'
import { useMarketStore } from '@/store/market'

const marketStore = useMarketStore()

// =================👉 1. 全局市场模式状态 (红绿切换引擎) =================
const isChineseMarket = ref(true) // true: A股(红涨), false: 国际(绿涨)

// 计算属性：动态获取“涨”和“跌”的主题颜色 (用于头部价格文本)
const upColor = computed(() => isChineseMarket.value ? '#e62c2c' : '#00b578')
const downColor = computed(() => isChineseMarket.value ? '#00b578' : '#e62c2c')

// 计算属性：当前股票的整体现价颜色（大于0用涨色，小于0用跌色）
const priceColor = computed(() => {
  if (currentStock.value.diff > 0) return upColor.value
  if (currentStock.value.diff < 0) return downColor.value
  return '#333' // 平盘为黑色
})

// 一键切换市场模式
const toggleMarketMode = () => {
  isChineseMarket.value = !isChineseMarket.value
  renderChart() // 重新发射图表绘制指令！
}

// =================👉 2. 股票数据与 Tabs 管理 =================
const currentTab = ref('month')
const showMore = ref(false)
const visiblePeriods = computed(() => marketStore.periodList.slice(0, 5))
const hiddenPeriods = computed(() => marketStore.periodList.slice(5))
const isHiddenPeriodActive = computed(() => hiddenPeriods.value.some(item => item.key === currentTab.value))

const toggleMore = () => showMore.value = !showMore.value
const selectPeriod = (key) => {
  currentTab.value = key
  showMore.value = false
}
const goToPeriodSetting = () => uni.navigateTo({ url: '/pages/period/period' })
const goToSearch = () => uni.navigateTo({ url: '/pages/search/search' })

const stockData = [
  { name: '上证指数', code: '000001.SH', price: 4049.91, diff: 34.88, percent: 0.85, high: 4108.40, low: 4049.58, open: 4086.30, volume: 6.79, amount: 9512.3, turnover: 1.43 },
  { name: '深证成指', code: '399001.SZ', price: 11234.50, diff: -56.12, percent: -0.50, high: 11310.00, low: 11200.00, open: 11290.00, volume: 12.3, amount: 15400.1, turnover: 2.15 },
  { name: '腾讯控股', code: '00700.HK', price: 388.40, diff: 12.80, percent: 3.41, high: 390.00, low: 382.00, open: 385.00, volume: 0.45, amount: 178.5, turnover: 0.11 }
]
const currentStockIndex = ref(0)
const currentStock = computed(() => stockData[currentStockIndex.value])

const prevStock = () => { currentStockIndex.value = (currentStockIndex.value - 1 + stockData.length) % stockData.length }
const nextStock = () => { currentStockIndex.value = (currentStockIndex.value + 1) % stockData.length }

// =================👉 3. Echarts 渲染引擎 =================
const uToastRef = ref(null)
const chartRef = shallowRef(null)
let myChartInstance = null // 保存 init 后的实例对象

const mockData = [
  [3400, 3450, 3380, 3480], [3450, 3500, 3420, 3520], [3500, 3420, 3400, 3550],
  [3420, 3300, 3280, 3450], [3300, 3250, 3200, 3350], [3250, 3380, 3220, 3400],
  [3380, 3450, 3350, 3480], [3450, 3550, 3420, 3580], [3550, 3600, 3520, 3650],
  [3600, 3500, 3480, 3620], [3500, 3400, 3380, 3520], [3400, 3300, 3250, 3420],
  [3300, 3450, 3280, 3480], [3450, 3550, 3420, 3580], [3550, 3700, 3520, 3750],
  [3700, 3850, 3680, 3900], [3850, 4000, 3820, 4050], [4000, 3950, 3900, 4080],
  [3950, 4100, 3920, 4150], [4100, 4049.91, 4000, 4180]
]
const categoryData = ['22-08', '22-09', '22-10', '22-11', '22-12', '23-01', '23-02', '23-03', '23-04', '23-05', '23-06', '23-07', '23-08', '23-09', '23-10', '23-11', '23-12', '24-01', '24-02', '24-03']

function calculateMA(dayCount, data) {
  var result = [];
  for (var i = 0, len = data.length; i < len; i++) {
    if (i < dayCount) { result.push('-'); continue; }
    var sum = 0;
    for (var j = 0; j < dayCount; j++) { sum += data[i - j][1]; }
    result.push((sum / dayCount).toFixed(2));
  }
  return result;
}

// 核心战术：动态图表绘制函数
const renderChart = () => {
  if (!myChartInstance) return

  // 1. 获取当前模式对应的颜色
  const cUp = upColor.value // 当前的“涨”色
  const cDown = downColor.value // 当前的“跌”色

  // 2. 组装图表配置
  const option = {
    backgroundColor: '#ffffff',
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    grid: { left: '2%', right: '2%', bottom: '10%', top: '5%', containLabel: true },
    xAxis: { type: 'category', data: categoryData, boundaryGap: false, axisLine: { onZero: false, lineStyle: { color: '#e5e5e5' } }, axisLabel: { color: '#999', fontSize: 10 } },
    yAxis: { scale: true, splitArea: { show: false }, splitLine: { lineStyle: { type: 'dashed', color: '#f5f5f5' } }, axisLabel: { color: '#999', fontSize: 10 } },
    dataZoom: [{ type: 'inside', start: 30, end: 100 }],
    series: [
      { 
        name: 'K线图', 
        type: 'candlestick', 
        data: mockData, 
        // 🚀 把画笔颜色换成我们的动态颜色！
        itemStyle: { 
          color: cUp, 
          color0: cDown, 
          borderColor: cUp, 
          borderColor0: cDown 
        } 
      },
      { name: 'MA5', type: 'line', data: calculateMA(5, mockData), smooth: true, showSymbol: false, lineStyle: { opacity: 0.8, width: 1.5, color: '#fdbf2d' } }
    ]
  }

  // 3. 执行绘制
  myChartInstance.setOption(option)
}

// Lime-echart 初始化回调
const onChartReady = () => {
  if (!chartRef.value) return
  chartRef.value.init(echarts, chart => { 
    myChartInstance = chart // 保存实例
    renderChart() // 渲染
  })
}

// =================👉 4. 生命周期管理 =================
onShow(() => {
  const targetCode = uni.getStorageSync('targetStockCode')
  if (targetCode) {
    console.log('接收到资讯页传来的股票代码：', targetCode)
    uni.showToast({ title: `已切换至股票: ${targetCode}`, icon: 'none', duration: 2000 })
    uni.removeStorageSync('targetStockCode')
  }
})
</script>

<style lang="scss" scoped>
.market-container { min-height: 100vh; background-color: #f5f6fa; padding-bottom: calc(140rpx + env(safe-area-inset-bottom)); }

.navbar-stock-title {
  .stock-info { margin: 0 30rpx; .s-name { font-size: 28rpx; margin-top:4rpx;font-weight: bold; color: #fff;line-height:1.1; } .s-code { font-size: 18rpx; color: rgba(255,255,255,0.7); margin-top: 8rpx;line-height:1.1; } }
}

.stock-header {
  padding: 40rpx 30rpx; background-color: #fff; border-bottom-left-radius: 20rpx; border-bottom-right-radius: 20rpx; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03);
  .price-box { width: 42%; .current-price { font-size: 56rpx; font-weight: bold; font-family: 'Courier New', Courier, monospace; display: block; } .price-detail { margin-top: 10rpx; font-size: 24rpx; .diff { margin-right: 16rpx; } } }
  .info-details { flex: 1; .detail-col { flex: 1; .item { margin-bottom: 12rpx; &:last-child { margin-bottom: 0; } .lbl { font-size: 24rpx; color: #a0a0a0; margin-right: 15rpx; } .val, .val-unit { font-size: 24rpx; color: #333; font-weight: bold; font-family: 'Courier New', Courier, monospace; } } } }
}

// tab搜索样式
.custom-tabs-container {
  margin: 20rpx 30rpx 0; background: #fff; border-radius: 12rpx; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03); position: relative; z-index: 50;

  .tabs-bar {
    height: 88rpx; padding: 0 20rpx;
    .tab-items { flex: 1; justify-content: space-between; padding-right: 20rpx; }
    .t-item { font-size: 28rpx; color: #666; transition: all 0.2s; &.active { color: #e62c2c; font-weight: bold; position: relative; } &.active::after { content: ''; position: absolute; bottom: -16rpx; left: 50%; transform: translateX(-50%); width: 30rpx; height: 4rpx; background: #e62c2c; border-radius: 2rpx; } }
    
    .more-btn { 
      padding: 0 20rpx; border-left: 1px solid #f0f0f0; border-right: 1px solid #f0f0f0; font-size: 28rpx; color: #666; display: flex; align-items: center; justify-content: center;
      .active { color: #e62c2c; font-weight: bold; }
      .triangle-icon { width: 0; height: 0; border-left: 8rpx solid transparent; border-right: 8rpx solid transparent; border-top: 10rpx solid #999; margin-left: 8rpx; transition: transform 0.3s; &.up { transform: rotate(180deg); } }
    }
    .setting-btn { padding-left: 20rpx; }
  }

  /* 面板横向滚动 */
  .more-panel {
    position: absolute; top: 88rpx; left: 0; width: 100%; background: #fff; border-top: 1px solid #f5f5f5; border-bottom-left-radius: 12rpx; border-bottom-right-radius: 12rpx; box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.15); 
    box-sizing:border-box;
	padding: 16rpx 10rpx;
    
    .panel-scroll {
      width: 100%;
      white-space: nowrap;
      &::-webkit-scrollbar { display: none; }
    }

    .scroll-content {
      display: inline-flex; 
      align-items: center;
    }
    
    .s-item { 
      display: inline-flex; align-items: center; justify-content: center;
      padding: 0 30rpx; height: 60rpx; border: 1px solid #e5e5e5; border-radius: 8rpx; 
      font-size: 26rpx; color: #333; margin: 0 10rpx;flex-shrink: 0; 
      
      &.active { border-color: #e62c2c; color: #e62c2c; background: #fff5f5; }
      &.sort-item { background: #f9f9f9; color: #666; border-style: dashed; }
    }
  }
}

.chart-wrapper { 
  display: flex; flex-direction: column; padding: 0 0 20rpx 0; height: 660rpx; background-color: #fff; margin: 20rpx 30rpx 0; border-radius: 12rpx; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03); 
  /* 新增：图表控制台样式 */
  .chart-tools {
    padding: 20rpx 30rpx;
    border-bottom: 1px dashed #f0f0f0;
    margin-bottom: 10rpx;
    .mode-text { font-size: 24rpx; color: #666; font-weight: bold; }
    .switch-btn { 
      background: #f9f9f9; padding: 6rpx 16rpx; border-radius: 30rpx; border: 1px solid #eee; transition: all 0.2s;
      &:active { opacity: 0.7; }
      .btn-txt { font-size: 22rpx; margin-left: 6rpx; font-weight: bold; }
    }
  }
}
.bottom-bar { position: fixed; bottom: 0; left: 0; width: 100%; padding: 30rpx 30rpx; background: #fff; box-shadow: 0 -4rpx 10rpx rgba(0,0,0,0.05); padding-bottom: calc(30rpx + env(safe-area-inset-bottom)); z-index: 100; }
</style>
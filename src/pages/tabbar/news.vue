<template>
  <view class="news-container">
    <u-navbar leftIcon="" :placeholder="true" bgColor="#fff" customStyle="border-bottom: 1px solid #f5f5f5;">
      <template #center>
        <view class="navbar-center flex-row-center align-center">
          <text class="navbar-title">社区大厅</text>
        </view>
      </template>
      <template #right>
        <u-icon name="plus" color="#e62c2c" size="22" class="post-add-btn" @click="goCreatePost"></u-icon>
      </template>
    </u-navbar>

    <view class="post-list-wrap">
      <u-tabs 
        :list="communityTabs" 
        :current="currentTab"
        @change="onTabChange" 
        lineColor="#e62c2c" 
        activeStyle="color: #e62c2c; font-weight: bold;" 
        inactiveStyle="color: #666;"
        customStyle="background: #fff; border-bottom: 1px solid #f5f5f5;"
      ></u-tabs>

      <view class="card-list">
        <view 
          class="post-card-box" 
          v-for="(item, index) in postList" :key="item.id"
          @click="goToDetail(item.id)"
        >
          <view class="card-header flex-row align-center">
            <u-avatar 
              :src="item.avatar" 
              size="40" 
              class="user-avatar" 
              bgColor="#f0f2f5" 
              icon="user-circle-filled"
            ></u-avatar>
            <view class="user-info flex-column">
              <text class="name">{{ item.name }}</text>
              <text class="time c-999">{{ item.time }}</text>
            </view>
            <u-icon name="more-dot-fill" color="#ccc" size="20" class="more-icon"></u-icon>
          </view>
          
		  <view class="card-content">
			  <view class="text-body u-line-3">
				<text v-for="node in parseContent(item.content)" :key="node.id">
				  <text 
					v-if="node.type === 'stock'" 
					class="stock-link" 
					@click.stop="goToMarket(node.code)"
				  >{{ node.name }}</text>
				  
				  <text v-else>{{ node.text }}</text>
				</text>
			  </view>
		  </view>
          
          <view class="card-footer flex-row-between align-center">
            <view class="action-item flex-row-center align-center">
              <u-icon name="share" color="#999" size="18" class="action-icon"></u-icon>
              <text class="action-txt c-999">转发</text>
            </view>
            <view class="action-item flex-row-center align-center">
              <u-icon name="chat" color="#999" size="18" class="action-icon"></u-icon>
              <text class="action-txt c-999">{{ item.comments }}</text>
            </view>
			<!-- <view class="action-item" @click.stop="handleLike(item)">
			  <u-icon :name="item.isLiked ? 'heart-fill' : 'heart'" :color="item.isLiked ? '#e62c2c' : '#999'" size="20"></u-icon>
			  <text>{{ item.likes }}</text>
			</view> -->
            <view class="action-item flex-row-center align-center" @click.stop="handleLike(item)">
              <u-icon :name="item.isLiked ? 'heart-fill' : 'heart'" :color="item.isLiked ? '#e62c2c' : '#999'" size="18" class="action-icon"></u-icon>
              <text class="action-txt" :class="item.isLiked ? 'c-red' : 'c-999'">{{ item.likes }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <u-toast ref="uToastRef"></u-toast>
  </view>
</template>

<script setup>
import { getPostList, likePostApi } from '@/api/community'
import { useUserStore } from '@/store/user'
const userStore = useUserStore()

const uToastRef = ref(null)

const communityTabs = ref([
  { name: '最新动态', key: 'new' },
  { name: '热门话题', key: 'hot' }
])
const currentTab = ref(0)
const onTabChange = (item) => { currentTab.value = item.index }

const postList = ref([])

// =================👉 帖子内容高亮处理器 =================
const parseContent = (content) => {
  if (!content) return []
  
  // 使用正则拆分字符串。注意：保留正则外层的 ()，这样 split 时会把匹配到的标签也保留在数组里！
  const parts = content.split(/(【[\u4e00-\u9fa5]+\(\d{6}\)】)/g)
  
  return parts.filter(p => p).map((part, index) => {
    // 检查这个片段是不是股票标签
    const match = part.match(/【([\u4e00-\u9fa5]+)\((\d{6})\)】/)
    
    if (match) {
      // 是股票标签，提取出名字和代码
      return { id: index, type: 'stock', name: match[1], code: match[2], raw: part }
    } else {
      // 是普通文本
      return { id: index, type: 'text', text: part }
    }
  })
}
// 新建帖子
const goCreatePost = () => {
  if (!userStore.isLogin) {
    uni.showToast({ title: '请先登录才能发帖！', icon: 'none' })
    setTimeout(() => { uni.navigateTo({ url: '/pages/login/login' }) }, 1000)
    return
  }
  uni.navigateTo({ url: '/pages/news/create-post' }) 
}
//  点击股票名称，带着 code 跳转到行情页 (market.vue)
const goToMarket = (code) => {
    // 1. 因为 switchTab 不能带参数，我们把要跳转的股票代码存入全局缓存
    uni.setStorageSync('targetStockCode', code)
    
    // 2. 使用专用的 switchTab 跳转到行情页
    uni.switchTab({ url: '/pages/tabbar/market' })
  }

const goToDetail = (id) => {
  uni.navigateTo({ url: `/pages/news/post-detail?id=${id}` })
}

const handleLike = async (item) => {
  // 没登录直接踢去登录页
  if (!userStore.isLogin) {
    uni.showToast({ title: '请先登录！', icon: 'none' })
    setTimeout(() => { uni.navigateTo({ url: '/pages/login/login' }) }, 1000)
    return
  }

  // 判断当前是点赞还是取消点赞
  const action = item.isLiked ? 'unlike' : 'like'
  
  try {
    const res = await likePostApi(item.id, action)
    if (res.code === 200) {
      // 👉 核心：操作成功后，直接在前端修改状态，不需要重新拉取整个列表！
      item.likes = res.data.likes      // 更新真实数字
      item.isLiked = !item.isLiked     // 翻转红心状态
    }
  } catch (err) {
    console.log('点赞操作失败', err)
  }
}
// 获取列表 
const fetchPosts = async () => {
  try {
	  const res = await getPostList()
      postList.value = res.data
    } catch (err) {
      console.log('获取失败', err)
    }
}


// 每次页面一露脸，立刻向后端要数据
onShow(() => {
  fetchPosts()
})
</script>

<style lang="scss" scoped>
.c-999 { color: #999; }
.c-red { color: #e62c2c; }

.news-container {
  min-height: 100vh;
  background-color: #f6f7fb;
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}

/* 导航栏居中 */
.navbar-center {
  width: 100%;
  .navbar-title { font-size: 34rpx; font-weight: bold; color: #333; }
}
.post-add-btn { margin-right: 30rpx;}

/* 卡片列表 */
.card-list { padding: 20rpx 0; }
.post-card-box {
  background-color: #fff;
  margin-bottom: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.02);
  transition: all 0.1s;
  &:active { background-color: #f9f9f9; }

  .card-header {
    .user-avatar { margin-right: 20rpx; border: 1rpx solid #f0f0f0; border-radius: 50%; }
    .user-info { flex: 1; .name { font-size: 30rpx; font-weight: bold; color: #333; } .time { font-size: 22rpx; margin-top: 4rpx; } }
    .more-icon { margin-left: auto; }
  }

  .card-content {
    margin: 30rpx 0;
    .text-body { font-size: 28rpx; color: #333; line-height: 1.6; word-wrap: break-word; }
	.stock-link { color: #2979ff; font-weight: bold; margin: 0 4rpx; }
    .img-grid-wrap { margin-top: 24rpx; gap: 10rpx; }
    .single-img { width: 300rpx; height: 300rpx; border-radius: 12rpx; border: 1rpx solid #f0f0f0; }
    .grid-img-item { width: calc((100% - 20rpx) / 3); height: 200rpx; border-radius: 12rpx; border: 1rpx solid #f0f0f0; }
  }

  .card-footer {
    border-top: 1rpx solid #f5f5f5;
    padding-top: 24rpx;
    margin-top: 10rpx;
    .action-item { flex: 1; gap: 12rpx; .action-txt { font-size: 26rpx; } }
  }
}
</style>
<template>
  <view class="post-detail-container">
    <u-navbar title="帖子详情" :autoBack="true" bgColor="#fff" leftIconColor="#333" titleStyle="color:#333;font-weight:bold;" :placeholder="true"></u-navbar>
    
    <view class="detail-content-wrap">
      <view class="author-block flex-row-between align-center">
        <view class="left flex-row align-center">
          <u-avatar 
            :src="detailData.avatar" 
            size="48" 
            class="user-avatar" 
            bgColor="#f0f2f5" 
            icon="user-circle-filled"
          ></u-avatar>
          <view class="user-info flex-column">
            <text class="name">{{ detailData.name }}</text>
            <text class="time c-999">{{ detailData.time }} | 3824阅读</text>
          </view>
        </view>
        <u-button text="+ 关注" size="mini" shape="circle" class="follow-btn"></u-button>
      </view>

	<view class="text-body-full">
	  <text v-for="node in parseContent(detailData.content)" :key="node.id">
		<text v-if="node.type === 'stock'"  class="stock-link"  @click.stop="goToMarket(node.code)">{{ node.name }}</text>
		<text v-else>{{ node.text }}</text>
	  </text>
	</view>
      
      <view class="img-list-full" v-if="detailData.imgs?.length > 0">
        <image 
          v-for="(img, idx) in detailData.imgs" :key="idx" 
          :src="img" 
          mode="widthFix" 
          class="full-img" 
        />
      </view>
    </view>
    
    <view class="separator-line"></view>

    <view class="comment-section-wrap">
      <view class="section-header flex-row align-center">
        <text class="title">评论区</text>
        <text class="count c-999">({{ commentList.length }}条)</text>
      </view>
      
      <view class="comment-item flex-row" v-for="item in commentList" :key="item.id">
		<u-avatar 
		  :src="item.author_avatar" size="32" 
		  class="user-avatar-comment" 
		  bgColor="#f0f2f5" 
		  icon="user-circle-filled"
		></u-avatar>
		<view class="comment-info flex-column">
		  <text class="c-name">{{ item.author_name }}</text> <text class="c-content">{{ item.content }}</text>
		  <view class="c-footer flex-row-between align-center">
			<text class="c-time c-999">{{ item.time }}</text>
			<view class="c-likes c-999 flex-row align-center">
			  <u-icon name="heart" size="14" color="#ccc"></u-icon>
			  <text>0</text> 
			</view>
		  </view>
		</view>
	  </view>
	  
    </view>
    
    <view class="bottom-float-bar">
      <view class="float-content flex-row align-center">
        <view class="input-placeholder flex-row align-center" @click="handleFocusComment">
          <u-icon name="edit-pen" color="#a0a0a0" size="18" class="edit-icon"></u-icon>
          <text class="placeholder-txt c-999">文明用语，和气生财...</text>
        </view>
        
        <view class="action-icons flex-row align-center">
          <view class="icon-item flex-center"><u-icon name="chat" size="22" color="#666"></u-icon></view>
          <view class="icon-item flex-center" @click="handleLikePost">
            <u-icon :name="detailData.isLiked ? 'heart-fill' : 'heart'" :color="detailData.isLiked ? '#e62c2c' : '#666'" size="22"></u-icon>
          </view>
          <view class="icon-item flex-center"><u-icon name="star" size="22" color="#666"></u-icon></view>
          <view class="icon-item flex-center"><u-icon name="share" size="22" color="#666"></u-icon></view>
        </view>
      </view>
    </view>
    
	<u-popup :show="showCommentBox" mode="bottom" @close="showCommentBox = false" round="16">
	  <view class="real-input-box u-flex align-center" style="padding: 30rpx; margin-bottom: env(safe-area-inset-bottom);">
		<u-input v-model="newCommentText" placeholder="说点什么吧，大神..." border="surround" shape="circle" class="flex-1" :focus="showCommentBox"></u-input>
		<u-button type="primary" shape="circle" text="发送" customStyle="margin-left: 20rpx; width: 120rpx;" @click="submitComment"></u-button>
	  </view>
	</u-popup>
	
    <u-toast ref="uToastRef"></u-toast>
  </view>
</template>

<script setup>
import { getPostDetail, likePostApi, getCommentsApi, createCommentApi } from '@/api/community'
import { useUserStore } from '@/store/user'
	
const uToastRef = ref(null)
const postId = ref(null)
const userStore = useUserStore() 

// 新增：弹窗控制和输入内容
const showCommentBox = ref(false)
const newCommentText = ref('')

const detailData = ref({
	imgs: [],
    content: ''
})
const commentList = ref([])

// 高亮转换
const parseContent = (content) => {
  if (!content) return []
  const parts = content.split(/(【[\u4e00-\u9fa5]+\(\d{6}\)】)/g)
  return parts.filter(p => p).map((part, index) => {
    const match = part.match(/【([\u4e00-\u9fa5]+)\((\d{6})\)】/)
    if (match) {
      return { id: index, type: 'stock', name: match[1], code: match[2], raw: part }
    } else {
      return { id: index, type: 'text', text: part }
    }
  })
}

const goToMarket = (code) => {
  uni.setStorageSync('targetStockCode', code)
  uni.switchTab({ url: '/pages/tabbar/market' })
}

// 独立出一个拉取评论的方法
const fetchComments = async (id) => {
  try {
    const res = await getCommentsApi(id)
    if (res.code === 200) {
      commentList.value = res.data
    }
  } catch (err) {
    console.log('获取评论失败', err)
  }
}

// onLoad：进页面时不仅拉取帖子，还要拉取评论！
onLoad(async (options) => {
  const pid = options.id
  postId.value = pid
  if (pid) {
	const res = await getPostDetail(pid)
    detailData.value = res.data
    
    // 拉取完帖子，马上拉取评论！
    fetchComments(pid)
  }
})

// ... 中间你写的 parseContent 和 goToMarket 保持不变 ...

//  改造点击底部假输入框的方法 (大厂交互：拦截未登录)
const handleFocusComment = () => {
  if (!userStore.isLogin) {
    uni.showToast({ title: '请先登录才能评论！', icon: 'none' })
    // 如果没登录，1秒后踢去登录页
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/login/login' }) 
    }, 1000)
    return
  }
  // 如果已登录，拉起真实输入弹窗！
  showCommentBox.value = true
}

// 发送评论核心逻辑！
const submitComment = async () => {
  if (!newCommentText.value.trim()) {
    return uni.showToast({ title: '不能发空评论！', icon: 'none' })
  }
  
  try {
    // 调用机密接口，request.js 会自动带上登录之后存的 Token
    const res = await createCommentApi(postId.value, { content: newCommentText.value })
    
    if (res.code === 200) {
      uni.showToast({ title: '评论成功！', icon: 'success' })
      newCommentText.value = '' // 清空输入框
      showCommentBox.value = false // 收起弹窗
      fetchComments(postId.value) // 重新拉取一次评论列表，让刚才发的话显示出来！
    }
  } catch(err) {
    console.log('发表失败', err)
  }
}

const handleLikePost = async() => {
   if (!userStore.isLogin) {
	 uni.showToast({ title: '请先登录才能点赞！', icon: 'none' })
	 setTimeout(() => {
	   uni.navigateTo({ url: '/pages/login/login' }) 
	 }, 1000)
	 return
   }

   const action = detailData.value.isLiked ? 'unlike' : 'like'
   
   try {
     const res = await likePostApi(detailData.value.id, action)
     detailData.value.likes = res.data.likes
     detailData.value.isLiked = !detailData.value.isLiked
     
     if (action === 'like') {
       uni.showToast({ title: '点赞成功', icon: 'success', duration: 1500 })
     }
   } catch(err) {
     console.log('操作失败', err)
   }
}
</script>

<style lang="scss" scoped>
.c-999 { color: #999; }

.post-detail-container {
  min-height: 100vh;
  background-color: #fff;
  padding-bottom: calc(130rpx + env(safe-area-inset-bottom));
}

.detail-content-wrap {
  padding: 30rpx;
  
  .author-block {
    margin-bottom: 30rpx; 
    .left {
      flex: 1; overflow: hidden; 
      .user-avatar { margin-right: 24rpx; border: 1rpx solid #f0f0f0; border-radius: 50%; flex-shrink: 0; }
      .user-info { 
        flex: 1; overflow: hidden; 
        .name { font-size: 30rpx; font-weight: bold; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } 
        .time { font-size: 24rpx; margin-top: 6rpx; color: #a0a0a0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;} 
      }
    }
    .follow-btn { flex-shrink: 0; width: 120rpx; height: 56rpx;margin-left: 20rpx; background-color: #fdeaea !important; color: #e62c2c !important; border: none !important; font-weight: bold; padding: 0 24rpx !important; }
  }

  .text-body-full {
      margin: 40rpx 0;
      font-size: 30rpx; color: #333; line-height: 1.8; word-wrap: break-word; 
      
      /* 新增：股票链接的专属样式 */
      .stock-link {
        color: #2979ff; 
        font-weight: bold; 
        margin: 0 4rpx;
      }
    }
  
  .img-list-full { gap: 16rpx; display: flex; flex-direction: column; .full-img { width: 100%; border-radius: 16rpx; border: 1rpx solid #f2f2f2; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.02); } }
}

.separator-line { height: 12rpx; background-color: #f6f7fb; border-top: 1px solid #eee;}

.comment-section-wrap {
  padding: 40rpx 30rpx;
  .section-header { gap: 12rpx; margin-bottom: 30rpx; .title { font-size: 32rpx; font-weight: bold; color: #333; } .count { font-size: 26rpx; } }
  .comment-list { gap: 36rpx; display: flex; flex-direction: column;}
  .comment-item {
    gap: 20rpx;
    .user-avatar-comment { border: 1rpx solid #f0f0f0; border-radius: 50%; flex-shrink: 0;}
    .comment-info {
      flex: 1; gap: 6rpx;
      .c-name { font-size: 28rpx; font-weight: bold; color: #555; }
      .c-content { font-size: 28rpx; color: #333; line-height: 1.6; }
      .c-footer { margin-top: 10rpx; gap: 10rpx; .c-time { font-size: 22rpx; } .c-likes { gap: 8rpx; font-size: 24rpx; } }
    }
  }
}

.bottom-float-bar {
  position: fixed; bottom: 0; left: 0; width: 100%; 
  background-color: #fff; box-shadow: 0 -4rpx 16rpx rgba(0,0,0,0.04);
  padding: 16rpx 40rpx calc(20rpx + env(safe-area-inset-bottom)); 
  z-index: 100;
  border-top: 1rpx solid #f5f5f5;
  
  .float-content { height: 72rpx; gap: 30rpx; justify-content: space-between;}
  
  .input-placeholder {
    flex: 1; height: 100%; background-color: #f5f6fa; border-radius: 36rpx; 
    padding: 0 24rpx; gap: 10rpx; overflow: hidden;
    .placeholder-txt { font-size: 26rpx; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; .c-999 {color: #a0a0a0;}}
  }
  
  .action-icons {
    flex-shrink: 0; gap: 36rpx; 
    .icon-item { }
  }
}
</style>
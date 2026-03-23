<template>
  <view class="ai-chat-container">
    <u-navbar title="AI 智能理财顾问" :autoBack="true" bgColor="#fff" :placeholder="true"></u-navbar>

    <view class="mode-switch-wrap flex-row-center align-center">
      <text class="label">当前回复模式：</text>
      <u-subsection 
        :list="['常规模式 (等待)', '流式模式 (打字机)']" 
        :current="isStream ? 1 : 0" 
        @change="val => isStream = (val === 1)"
        activeColor="#2979ff"
        customStyle="width: 400rpx;"
      ></u-subsection>
    </view>

    <scroll-view scroll-y class="chat-window" :scroll-into-view="bottomId">
      <view class="msg-list">
        <view 
          class="msg-item" 
          v-for="(item, index) in msgList" 
          :key="index"
          :class="item.role === 'user' ? 'is-user' : 'is-ai'"
        >
          <u-avatar 
            :src="item.role === 'ai' ? 'https://cdn.uviewui.com/uview/album/2.jpg' : 'https://cdn.uviewui.com/uview/album/1.jpg'" 
            size="40" 
            class="avatar"
          ></u-avatar>
          
          <view class="bubble">
            <text class="text">{{ item.content }}</text>
            <text v-if="item.isGenerating" class="cursor-blink">|</text>
          </view>
        </view>
      </view>
      <view id="scroll-bottom-anchor" style="height: 20rpx;"></view>
    </scroll-view>

    <view class="input-bar flex-row align-center">
      <u-input 
        v-model="inputText" 
        placeholder="问问 AI 茅台还能买吗..." 
        border="surround" 
        shape="circle" 
        class="flex-1"
        @confirm="sendMessage"
      ></u-input>
      <u-button 
        type="primary" 
        shape="circle" 
        text="发送" 
        customStyle="margin-left: 20rpx; width: 120rpx;" 
        @click="sendMessage"
        :loading="isWaiting"
      ></u-button>
    </view>
  </view>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const isStream = ref(false) 
const inputText = ref('')
const msgList = ref([
  { role: 'ai', content: '您好，我是智汇理财 AI 助手。股市有风险，有什么我可以帮您分析的吗？', isGenerating: false }
])
const isWaiting = ref(false)
const bottomId = ref('')

const scrollToBottom = async () => {
  await nextTick()
  bottomId.value = 'scroll-bottom-anchor'
  setTimeout(() => { bottomId.value = '' }, 100) 
}

const sendMessage = async () => {
  if (!inputText.value.trim() || isWaiting.value) return
  
  const userMsg = inputText.value
  inputText.value = ''
  
  msgList.value.push({ role: 'user', content: userMsg })
  scrollToBottom()
  
  const aiMsgIndex = msgList.value.length
  msgList.value.push({ role: 'ai', content: '', isGenerating: true })
  isWaiting.value = true

  try {
    const backendUrl = 'http://127.0.0.1:5000/api/ai/chat'
	// const backendUrl = "http://192.168.1.7:5000/api/ai/chat"

    if (!isStream.value) {
      const res = await uni.request({
        url: backendUrl,
        method: 'POST',
        data: { message: userMsg, is_stream: false }
      })
      if (res.data.code === 200) {
        msgList.value[aiMsgIndex].content = res.data.data.content
      } else {
        msgList.value[aiMsgIndex].content = res.data.msg || '网络开小差了，请重试。'
      }
      msgList.value[aiMsgIndex].isGenerating = false
      scrollToBottom()
      isWaiting.value = false
      return
    }

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg, is_stream: true })
    })

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const chunkStr = decoder.decode(value, { stream: true })
      const lines = chunkStr.split('\n\n')
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6)
          if (dataStr === '[DONE]') break 
          
          try {
            const dataObj = JSON.parse(dataStr)
            
            // 👉 逻辑修复：拦截后端传来的报错信息，直接显示在屏幕上！
            if (dataObj.error) {
              msgList.value[aiMsgIndex].content += `\n[系统提示: ${dataObj.error}]\n可能是API Key未配置或后端网络异常。`
              scrollToBottom()
              continue
            }
            
            if (dataObj.content) {
              msgList.value[aiMsgIndex].content += dataObj.content
              scrollToBottom() 
            }
          } catch (e) {
            console.log('解析碎片失败', e)
          }
        }
      }
    }

  } catch (error) {
    msgList.value[aiMsgIndex].content = '接口连接失败，请检查 Flask 后端是否启动。'
  } finally {
    msgList.value[aiMsgIndex].isGenerating = false
    isWaiting.value = false
    scrollToBottom()
  }
}
</script>

<style lang="scss" scoped>
.ai-chat-container { height: 100vh; display: flex; flex-direction: column; background-color: #f6f7fb; }
.mode-switch-wrap { padding: 20rpx; background-color: #fff; border-bottom: 1px solid #eee; .label { font-size: 26rpx; color: #666; margin-right: 10rpx; } }
.chat-window { flex: 1; overflow: hidden; padding: 30rpx 20rpx; }
.msg-list { display: flex; flex-direction: column; padding-bottom: 40rpx;}

/* 👉 UI 修复：全新严谨的 Flex 气泡布局 */
.msg-item { 
  display: flex; 
  align-items: flex-start;
  width: 100%;
  padding-bottom: 40rpx;
}
.msg-item:last-child {
  margin-bottom: 0;
}

.msg-item.is-user { 
  flex-direction: row-reverse; /* 用户靠右 */
}

.msg-item.is-ai { 
  flex-direction: row; /* AI 靠左 */
}

.avatar { 
  flex-shrink: 0; /* 头像绝不被挤压 */
  margin: 0 20rpx; 
}

.bubble { 
  max-width: 65%; 
  padding: 20rpx 30rpx; 
  font-size: 30rpx; 
  line-height: 1.6; 
  word-break: break-all; /* 👉 极其重要：强制换行，防止英文或长标点冲破气泡 */
  position: relative;
}

.is-user .bubble { 
  background-color: #2979ff; 
  color: #fff; 
  border-radius: 20rpx 0 20rpx 20rpx; 
}

.is-ai .bubble { 
  background-color: #fff; 
  color: #333; 
  border-radius: 0 20rpx 20rpx 20rpx; 
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05); 
}

.cursor-blink { display: inline-block; width: 4rpx; background: currentColor; margin-left: 4rpx; animation: blink 1s step-end infinite; }

.input-bar { background-color: #fff; padding: 20rpx 30rpx calc(20rpx + env(safe-area-inset-bottom)); border-top: 1px solid #eee; }

@keyframes blink { 50% { opacity: 0; } }
</style>
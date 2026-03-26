<template>
  <view class="ai-chat-container">
    <u-navbar title="AI 智能理财顾问" :autoBack="true" bgColor="#fff" :placeholder="true"></u-navbar>

    <view class="mode-switch-wrap flex-row-center align-center">
      <text class="label">当前回复模式：</text>
      <u-subsection 
        :list="['常规模式 (等待)', '流式模式 (打字机)']" 
        :current="isStream ? 1 : 0" 
        @change="onModeChange"
        activeColor="#2979ff"
        customStyle="width: 400rpx;"
      ></u-subsection>
    </view>

    <view :prop="streamPayload" :change:prop="aiRender.handleStream" style="display: none;"></view>

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
        customStyle="margin-left: 20rpx; width: 180rpx;" 
        @click="sendMessage"
        :loading="isWaiting"
      ></u-button>
    </view>
  </view>
</template>

<script>
import { config } from '@/config/index.js'

export default {
  data() {
    return {
      isStream: false,
      inputText: '',
      msgList: [
        { role: 'ai', content: '您好，我是智汇理财 AI 助手。股市有风险，有什么我可以帮您分析的吗？', isGenerating: false }
      ],
      isWaiting: false,
      bottomId: '',
      streamPayload: null
    }
  },
  methods: {
    onModeChange(val) {
      this.isStream = (val === 1);
    },
    scrollToBottom() {
      this.$nextTick(() => {
        this.bottomId = 'scroll-bottom-anchor'
        setTimeout(() => { this.bottomId = '' }, 100)
      })
    },
    // ⬇️ ====== 给 renderjs 调用的 3 个方法，这次它绝对能找到！ ====== ⬇️
    receiveStreamData(text) {
      const lastIndex = this.msgList.length - 1
      if (lastIndex >= 0) {
        this.msgList[lastIndex].content += text
        this.scrollToBottom()
      }
    },
    handleStreamEnd() {
      const lastIndex = this.msgList.length - 1
      if (lastIndex >= 0) {
        this.msgList[lastIndex].isGenerating = false
      }
      this.isWaiting = false
      this.scrollToBottom()
    },
    handleStreamError(errMsg) {
      const lastIndex = this.msgList.length - 1
      if (lastIndex >= 0) {
        this.msgList[lastIndex].content += errMsg
        this.msgList[lastIndex].isGenerating = false
      }
      this.isWaiting = false
      this.scrollToBottom()
    },
    // ⬆️ ========================================================= ⬆️

    async sendMessage() {
      if (!this.inputText.trim() || this.isWaiting) return
      
      const userMsg = this.inputText
      this.inputText = ''
      
      this.msgList.push({ role: 'user', content: userMsg })
      this.scrollToBottom()
      
      const aiMsgIndex = this.msgList.length
      this.msgList.push({ role: 'ai', content: '', isGenerating: true })
      this.isWaiting = true

	  const backendUrl = `${config.baseUrl}/api/ai/chat`

      if (!this.isStream) {
        try {
          const res = await uni.request({
            url: backendUrl,
            method: 'POST',
            data: { message: userMsg, is_stream: false }
          })
          if (res.data && res.data.code === 200) {
            this.msgList[aiMsgIndex].content = res.data.data.content
          } else {
            this.msgList[aiMsgIndex].content = res.data?.msg || '网络开小差了，请重试。'
          }
        } catch (e) {
          this.msgList[aiMsgIndex].content = '接口连接失败，请检查 Flask 后端。'
        } finally {
          this.msgList[aiMsgIndex].isGenerating = false
          this.isWaiting = false
          this.scrollToBottom()
        }
        return
      }

      // 触发 renderjs
      this.streamPayload = {
        url: backendUrl,
        message: userMsg,
        timestamp: Date.now()
      }
    }
  }
}
</script>

<script module="aiRender" lang="renderjs">
export default {
  methods: {
    async handleStream(newValue, oldValue, ownerInstance, instance) {
      if (!newValue || !newValue.url || !newValue.message) return;

      try {
        const response = await fetch(newValue.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: newValue.message, is_stream: true })
        })

        if (!response.ok) {
           ownerInstance.callMethod('handleStreamError', '\n[系统提示: 后端接口异常]')
           return
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() 

          for (let line of lines) {
            line = line.trim()
            if (!line) continue 
            
            if (line.startsWith('data:')) {
              const dataStr = line.slice(5).trim()
              if (dataStr === '[DONE]') continue 
              
              try {
                const dataObj = JSON.parse(dataStr)
                if (dataObj.error) {
                  ownerInstance.callMethod('handleStreamError', `\n[系统提示: ${dataObj.error}]`)
                } else if (dataObj.content) {
                  ownerInstance.callMethod('receiveStreamData', dataObj.content)
                }
              } catch (e) {
                // 静默处理破损碎片
              }
            }
          }
        }
        
        ownerInstance.callMethod('handleStreamEnd')

      } catch (error) {
	    ownerInstance.callMethod('handleStreamError', `\n[底层抛错侦察]: ${error.name} - ${error.message || error}`)
        // ownerInstance.callMethod('handleStreamError', '\n接口连接失败，请检查网络。')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
/* 样式原封不动 */
.ai-chat-container { height: 100vh; display: flex; flex-direction: column; background-color: #f6f7fb; }
.mode-switch-wrap { padding: 20rpx; background-color: #fff; border-bottom: 1px solid #eee; .label { font-size: 26rpx; color: #666; margin-right: 10rpx; } }
.chat-window { flex: 1; overflow: hidden; padding: 30rpx 20rpx; }
.msg-list { display: flex; flex-direction: column; padding-bottom: 40rpx;}

.msg-item { display: flex; align-items: flex-start; width: 100%; padding-bottom: 40rpx;}
.msg-item:last-child { margin-bottom: 0;}
.msg-item.is-user { flex-direction: row-reverse; }
.msg-item.is-ai { flex-direction: row; }
.avatar { flex-shrink: 0; margin: 0 20rpx; }

.bubble { max-width: 65%; padding: 20rpx 30rpx; font-size: 30rpx; line-height: 1.6; word-break: break-all; position: relative;}
.is-user .bubble { background-color: #2979ff; color: #fff; border-radius: 20rpx 0 20rpx 20rpx; }
.is-ai .bubble { background-color: #fff; color: #333; border-radius: 0 20rpx 20rpx 20rpx; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05); }

.cursor-blink { display: inline-block; width: 4rpx; background: currentColor; margin-left: 4rpx; animation: blink 1s step-end infinite; }
.input-bar { background-color: #fff; padding: 20rpx 30rpx calc(20rpx + env(safe-area-inset-bottom)); border-top: 1px solid #eee; }
@keyframes blink { 50% { opacity: 0; } }
</style>
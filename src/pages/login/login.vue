<template>
  <view class="login-page">
	<u-navbar title=" " :autoBack="true" bgColor="transparent" leftIconColor="#333" :placeholder="true"></u-navbar>
    <view class="header">
      <text class="title">{{ isRegister ? '欢迎注册' : '欢迎登录' }}</text>
      <text class="subtitle">智汇金融 - 安全稳健的理财平台</text>
    </view>

    <view class="form-box">
      <u-form :model="form" ref="formRef" :rules="rules" labelPosition="top">
		<u-form-item prop="nickname" borderBottom v-if="isRegister">
			<u-input v-model="form.nickname" placeholder="请输入专属用户名" border="none" clearable prefixIcon="account"></u-input>
		</u-form-item>
        <u-form-item prop="phone" borderBottom customStyle="margin-top: 20rpx;">
          <u-input v-model="form.phone" placeholder="请输入11位手机号" border="none" clearable type="number" maxlength="11" prefixIcon="phone"></u-input>
        </u-form-item>
        
        <u-form-item prop="password" borderBottom customStyle="margin-top: 20rpx;">
          <u-input v-model="form.password" placeholder="请输入密码" border="none" clearable type="password" prefixIcon="lock"></u-input>
        </u-form-item>
      </u-form>

      <view class="btn-wrap">
		  <u-button type="primary" shape="circle" :text="isRegister ? '立即注册' : '极速登录'" @click="submitLogin" :loading="isLoading" color="#e62c2c"></u-button>
				  
		  <view class="toggle-text" @click="toggleMode">
			<text>{{ isRegister ? '已有账号？去登录' : '没有账号？去注册' }}</text>
		  </view>
        <!-- <u-button type="primary" shape="circle" text="极速登录" @click="submitLogin" :loading="isLoading" color="#e62c2c"></u-button> -->
      </view>
    </view>

    <u-toast ref="uToastRef"></u-toast>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { loginApi, registerApi } from '@/api/user'

const userStore = useUserStore()
const uToastRef = ref(null)
const formRef = ref(null)
const isLoading = ref(false)
const isRegister = ref(false)

const form = reactive({ phone: '', password: '', nickname: '' })

const rules = {
	nickname: [
	    { 
	      validator: (rule, value) => {
	        if (isRegister.value && !value) return false;
	        return true;
	      }, 
	      message: '请输入用户名', 
	      trigger: ['blur'] 
	    }
	],
  phone: [
    { required: true, message: '请输入手机号', trigger: ['blur'] },
    { validator: (rule, value) => /^1[3-9]\d{9}$/.test(value), message: '手机号格式不正确', trigger: ['blur'] }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: ['blur'] },
    { min: 6, message: '密码不能少于6位', trigger: ['blur'] }
  ]
}

onMounted(() => {
  if (formRef.value) formRef.value.setRules(rules)
})

// 切换模式的方法
const toggleMode = () => {
  isRegister.value = !isRegister.value
  form.password = '',
  form.nickname = '' 
}
const submitLogin = () => {
	formRef.value.validate().then(async valid => {
	    if (valid) {
	      isLoading.value = true
	      try {
	        const params = {
	          phone: form.phone,
	          password: form.password,
			  nickname: form.nickname
	        }
	
	        if (isRegister.value) {
	          // 👉 执行真实注册
	          await registerApi(params)
	          uToastRef.value.show({ type: 'success', message: '注册成功，请登录！' })
	          // 注册成功后，自动切回登录模式
	          isRegister.value = false
	          form.password = '',
			  form.nickname = ''
	        } else {
	          // 👉 执行真实登录
	          const res = await loginApi(params)
	          // 把后端返回的真实用户数据 (res.data) 存入 Pinia
	          userStore.login(res.data) 
	          uToastRef.value.show({ type: 'success', message: '登录成功！' })
	          
	          setTimeout(() => {
	            uni.switchTab({
	                url: '/pages/tabbar/profile'
			  })
	          }, 1000)
	        }
	      } catch (err) {
	        // request.js 里已经统一拦截报错了，这里可以不写提示
	        console.log('操作失败', err)
	      } finally {
	        isLoading.value = false
	      }
	    }
	  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background-color: #fff;
  padding: 60rpx 50rpx;
  
  .header {
    margin-bottom: 80rpx;
    margin-top: 60rpx;
    .title {
      font-size: 54rpx;
      font-weight: bold;
      color: #333;
      display: block;
    }
    .subtitle {
      font-size: 28rpx;
      color: #999;
      margin-top: 20rpx;
      display: block;
    }
  }
  
  .btn-wrap {
    margin-top: 80rpx;
	.toggle-text {
	    margin-top: 40rpx;
	    text-align: center;
	    font-size: 28rpx;
	    color: #666;
	}
  }
}
</style>
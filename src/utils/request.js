import { config } from '@/config/index.js'

export const request = (options) => {
  return new Promise((resolve, reject) => {
	const token = uni.getStorageSync('token')
	// 塞进请求头里 (Bearer 后面必须有个空格)
	const header = options.header || {}
	if (token) {
	  header['Authorization'] = 'Bearer ' + token
	}
    uni.request({
      url: config.baseUrl + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: header,
      success: (res) => {
        // 后端返回 200 才是真成功
        if (res.data.code === 200) {
          resolve(res.data) 
        } else {
          // 统一的错误弹窗提示
          uni.showToast({ title: res.data.msg || '请求失败', icon: 'none' })
          reject(res.data)
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络异常，请检查后端服务', icon: 'none' })
        reject(err)
      }
    })
  })
}
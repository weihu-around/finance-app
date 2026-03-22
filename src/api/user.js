// src/api/user.js
import { request } from '@/utils/request'

// 注册接口
export const registerApi = (data) => {
  return request({ url: '/api/user/register', method: 'POST', data })
}

// 登录接口
export const loginApi = (data) => {
  return request({ url: '/api/user/login', method: 'POST', data })
}
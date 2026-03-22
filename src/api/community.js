import { request } from '@/utils/request' 

// 1. 获取社区帖子列表
export const getPostList = () => {
  return request({ 
    url: '/api/community/posts', 
    method: 'GET' 
  })
}

// 2. 获取单个帖子详情
export const getPostDetail = (id) => {
  return request({ 
    url: `/api/community/posts/${id}`, 
    method: 'GET' 
  })
}

// 3. 点赞帖子
export const likePostApi = (id, action) => {
  return request({ 
    url: `/api/community/posts/${id}/like`, 
    method: 'POST',
	data: { action: action }
  })
}

// 4. 获取某个帖子的所有评论 (公开)
export const getCommentsApi = (postId) => {
  return request({ url: `/api/community/posts/${postId}/comments`, method: 'GET' })
}

// 5. 发表真实评论 (机密，request.js 会自动带上 Token！)
export const createCommentApi = (postId, data) => {
  return request({ url: `/api/community/posts/${postId}/comments`, method: 'POST', data })
}

// 6. 发表新帖子
export const createPostApi = (data) => {
  return request({ url: '/api/community/posts', method: 'POST', data })
}
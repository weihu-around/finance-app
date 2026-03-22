import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
	state: () => ({
		userInfo: uni.getStorageSync('userInfo') || null,
		isLogin: uni.getStorageSync('isLogin') || false,
		totalAssets: 1284530.50 // 模拟资产数据
	}),
	actions: {
		// 登录逻辑
		login(userData) {
			this.userInfo = userData;
			this.isLogin = true;
			uni.setStorageSync('userInfo', userData);
			uni.setStorageSync('isLogin', true);
			uni.setStorageSync('token', userData.token);
		},
		// 登出逻辑
		logout() {
			this.userInfo = null;
			this.isLogin = false;
			// 同步清除硬盘，擦除痕迹
			uni.removeStorageSync('userInfo');
			uni.removeStorageSync('isLogin');
			uni.removeStorageSync('token');
		}
	}
});
import { createSSRApp } from 'vue'
import * as Pinia from 'pinia' // 1. 引入 Pinia
import App from './App.vue'
import uviewPlus from 'uview-plus'

export function createApp() {
	const app = createSSRApp(App)
	
	// 2. 创建并挂载 Pinia
	const pinia = Pinia.createPinia()
	app.use(pinia)
	
	app.use(uviewPlus)
	
	return {
		app,
		Pinia // 必须返回，否则 H5 可能会报错
	}
}
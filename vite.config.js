import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite' //  引入自动导入插件

export default defineConfig({
  plugins: [
	  uni(),
	  // 配置自动导入框架
	  AutoImport({
		imports: [
		  'vue',       // 自动导入 ref, computed, watch, onMounted 等
		  'pinia',     // 自动导入 defineStore, storeToRefs 等
		  'uni-app'    // 自动导入 onLoad, onShow 等生命周期 (可选)
		],
		// 解决 ESLint 报错的问题 (如果你的项目配了 eslint 的话)
		eslintrc: {
		  enabled: true, 
		}
	  })
  ],
  // 加入这段 css 配置，强行静音 sass 的弃用警告
	css: {
	  preprocessorOptions: {
		scss: {
		  api: 'modern-compiler',
		  silenceDeprecations: ['legacy-js-api', 'import'],
		}
	  }
	},
  resolve: {
    alias: {
      // 设置路径别名，@ 符号指向 src 目录
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    // 如果你之后要调接口，可以在这里配跨域代理
    port: 3000,
    open: true
  }
})
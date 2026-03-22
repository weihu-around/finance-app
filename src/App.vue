<script>
export default {
  onLaunch: function () {
    // console.log('App Launch')
  },
  onShow: function () {
    // console.log('App Show')
  },
  onHide: function () {
    // console.log('App Hide')
  },
}
</script>

<style lang="scss">
/*每个页面公共css */
/* 引入 uview-plus 基础样式 */
@import "uview-plus/index.scss";
* {
	box-sizing: border-box;
}
.app-container {
	padding-bottom: 180rpx;
	box-sizing: border-box;
	min-height: 100vh; /* 保证高度撑满屏幕 */
}
.uni-tabbar-bottom .uni-tabbar {
	padding-top: 12rpx;
}

/* =================👉 全局原生 Flex 布局辅助类 ================= */
/* 1. 基础方向 */
.flex-row { display: flex; flex-direction: row; }
.flex-column { display: flex; flex-direction: column; }

/* 2. 主轴对齐方式 (基于 row) */
.flex-row-center { display: flex; flex-direction: row; justify-content: center; }
.flex-row-between { display: flex; flex-direction: row; justify-content: space-between; }
.flex-row-around { display: flex; flex-direction: row; justify-content: space-around; }

/* 3. 交叉轴对齐方式 */
.align-center { align-items: center; }
.align-stretch { align-items: stretch; }

/* 4. 居中捷径 */
.flex-center { display: flex; justify-content: center; align-items: center; }

/* 5. 换行 */
.flex-wrap { flex-wrap: wrap; }

</style>

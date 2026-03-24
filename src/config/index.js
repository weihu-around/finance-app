// src/config/index.js

let BASE_URL = '';

// 判断当前是否是开发环境（运行到浏览器或运行到真机调试）
if (process.env.NODE_ENV === 'development') {
    
    // 条件编译
    // #ifdef H5
    // 如果是在电脑浏览器(H5)运行，直接用本机回环地址
    BASE_URL = 'http://127.0.0.1:5000';
    // #endif

    // #ifndef H5
    // 如果不是H5（也就是真机App或小程序），必须用电脑的真实局域网/热点 IP
    // BASE_URL = 'http://172.16.181.203:5000'; 
	BASE_URL = 'http://192.168.137.1:5000'
    // #endif

} else {
    // 生产环境（也就是你以后打包出正式版 apk 发布时）
    BASE_URL = 'https://api.zhihui-finance.com'; 
}

export const config = {
    baseUrl: BASE_URL
};
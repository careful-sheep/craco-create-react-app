'use strict';

const proxyKey = process.argv[2] || 'default';
 
const setupProxy = {
    '/platform': 'http://10.136.157.23:8080',
    '/searchapi': 'http://10.136.157.23:8080'
};
 
module.exports = function () {
    let newProxy = [];
    const proxyObj = setupProxy;
    Object.keys(proxyObj).map((key) => [key, proxyObj[key]]).forEach(([key, value]) => {
        // 文档页面是模板直接渲染数据，为了本地开发方便和文档页单页模式，
        // 我们使用 ajax 请求文档 url 获取对应的 html 模板替换到页面上
        // （正常模式下应该是请求接口而不是请求 html）
        newProxy.push({ context: key, target: value, changeOrigin: true });
    });
    return newProxy;
};
 
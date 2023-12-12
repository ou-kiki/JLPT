
多 Git 仓库的 SSH-key 配置: https://www.hozen.site/archives/43/

代码示例
如果选择使用代理服务器，你可以使用以下方法来实现：

假设你有一个代理服务器地址 https://my-cors-proxy-server.com/，你可以将原始请求 URL 修改为通过代理服务器。
```js
// 原始 URL
let originalUrl = "https://www.ecustpress.cn/ashx/qrList.ashx?blid=&bqcg_id=&bqc_id=";

// 通过代理服务器的 URL
let proxiedUrl = `https://my-cors-proxy-server.com/${encodeURIComponent(originalUrl)}`;

// 使用代理 URL 发送请求
fetch(proxiedUrl)
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
```

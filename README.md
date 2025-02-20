[![Mermaid Live Editor](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/detailed/2ckppp/master&style=flat&logo=cypress)](https://dashboard.cypress.io/projects/2ckppp/runs) [![Join our Slack!](https://img.shields.io/static/v1?message=join%20chat&color=9cf&logo=slack&label=slack)](https://join.slack.com/t/mermaid-talk/shared_invite/enQtNzc4NDIyNzk4OTAyLWVhYjQxOTI2OTg4YmE1ZmJkY2Y4MTU3ODliYmIwOTY3NDJlYjA0YjIyZTdkMDMyZTUwOGI0NjEzYmEwODcwOTE) [![Netlify Status](https://api.netlify.com/api/v1/badges/27fa023d-7c73-4a3f-9791-b3b657a47100/deploy-status)](https://app.netlify.com/sites/mermaidjs/deploys)

# 欢迎贡献者！

如果你想加快 mermaid-live-editor 的开发进度，请加入 Slack 频道并联系 knsv。

# mermaid-live-editor

编辑、预览和分享 Mermaid 图表/流程图。

## 功能特点

- 实时编辑和预览流程图、序列图、甘特图
- 将结果保存为 SVG 格式
- 获取图表查看器的链接，以便与他人分享
- 获取图表编辑器的链接，以便他人可以修改并发送新的链接

## 在线演示

你可以在[这里](https://runcode.w3cschool.cn/mermaid/)试用在线版本。
或者试用[官方演示](https://mermaid.live/)

## Docker

### 运行已发布的镜像

```bash
docker run --platform linux/amd64 --publish 8000:8080 ghcr.io/mermaid-js/mermaid-live-editor
```

### 配置渲染器 URL

构建时设置 MERMAID_RENDERER_URL 构建参数来指定渲染服务。
示例：
默认为 `https://mermaid.ink`。
设置为空字符串可以禁用"操作

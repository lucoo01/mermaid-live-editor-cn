[![Mermaid Live Editor](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/detailed/2ckppp/master&style=flat&logo=cypress)](https://dashboard.cypress.io/projects/2ckppp/runs) [![加入我们的Slack!](https://img.shields.io/static/v1?message=join%20chat&color=9cf&logo=slack&label=slack)](https://join.slack.com/t/mermaid-talk/shared_invite/enQtNzc4NDIyNzk4OTAyLWVhYjQxOTI2OTg4YmE1ZmJkY2Y4MTU3ODliYmIwOTY3NDJlYjA0YjIyZTdkMDMyZTUwOGI0NjEzYmEwODcwOTE) [![Netlify状态](https://api.netlify.com/api/v1/badges/27fa023d-7c73-4a3f-9791-b3b657a47100/deploy-status)](https://app.netlify.com/sites/mermaidjs/deploys)

# 欢迎贡献者！

如果你想加快mermaid-live-editor的开发进度，请加入Slack频道并联系knsv。

# mermaid-live-editor

编辑、预览和分享mermaid图表/示意图。

## 功能

- 实时编辑和预览流程图、序列图、甘特图。
- 将结果保存为svg文件。
- 获取图表的查看链接，以便与他人分享。
- 获取图表的编辑链接，以便他人可以调整并发送新的链接回来。

## 在线演示

你可以在这里尝试一个在线版本[这里](https://mermaid.live/)。

## Docker

### 运行已发布的镜像

```bash
docker run --platform linux/amd64 --publish 8000:8080 ghcr.io/mermaid-js/mermaid-live-editor
```

### 配置渲染器URL

在构建时设置`MERMAID_RENDERER_URL`构建参数为渲染服务。
示例：
默认是`https://mermaid.ink`。
设置为空字符串以禁用“操作”下的PNG和SVG链接。

### 配置Kroki实例URL

在构建时设置`MERMAID_KROKI_RENDERER_URL`构建参数为你的Kroki实例。
默认是`https://kroki.io`。
设置为空字符串以禁用“操作”下的Kroki链接。

### 配置分析

在构建时设置`MERMAID_ANALYTICS_URL`构建参数为你的plausible实例，并设置`MERMAID_DOMAIN`为你的域名。
默认为空，禁用分析。

### 启用Mermaid Chart链接和推广

在构建时设置`MERMAID_IS_ENABLED_MERMAID_CHART_LINKS`构建参数为`true`。
默认为空，禁用保存到Mermaid Chart的按钮和推广横幅。

### 更新安全模态

点击安全链接时显示的模态假设分析、渲染器、Kroki和Mermaid图表已启用。如果需要，你可以通过修改`Privacy.svelte`来更新它。

### 开发

```bash
docker compose up --build
```

然后打开 http://localhost:3000

### 本地构建和运行镜像

#### 构建

```bash
docker build -t mermaid-js/mermaid-live-editor .
```

#### 运行

```bash
docker run --detach --name mermaid-live-editor --publish 8080:8080 mermaid-js/mermaid-live-editor
```

访问: <http://localhost:8080>

#### 停止

```bash
docker stop mermaid-live-editor
```

## 设置

以下链接将帮助你在本地系统中复制该仓库。

https://docs.github.com/en/get-started/quickstart/fork-a-repo

## 要求

- [volta](https://volta.sh/) 用于管理node版本。
- [Node.js](https://nodejs.org/en/). `volta install node`
- [yarn](https://yarnpkg.com/) 包管理器. `volta install yarn`

## 开发

```sh
yarn install
yarn dev -- --open
```

这个应用是用Svelte Kit创建的。

## 发布

当创建一个针对master的PR时，它将被Netlify构建和部署。
URL将在PR的评论中显示。

一旦PR被合并，它将自动发布。

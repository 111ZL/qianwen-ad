# 阿里云千问大模型互动广告 — 「一人公司·超级个体」

> **一人公司，千问驱动** — 你的超级员工，即刻上岗

基于阿里云百炼平台千问大模型构建的互动广告网页。用户扮演"一人公司CEO"，通过自然语言指令驱动不同岗位的 AI 员工（脚本千问、运营千问、美工千问），实时生成文案、运营方案和图片，展示千问大模型作为"AI时代操作系统"的核心能力。

---

## 🚀 快速开始

### 1. 环境要求

- **Python** >= 3.10
- **pip**

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 配置 API Key

复制环境变量模板并填写你的阿里云百炼 API Key：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
DASHSCOPE_API_KEY=sk-your-actual-api-key-here
PORT=3000
```

> 📌 **获取 API Key**：访问 [阿里云百炼控制台](https://dashscope.console.aliyun.com/apiKey) 创建并复制你的 API Key。

### 4. 启动服务

```bash
python app.py
```

打开浏览器访问 **http://localhost:3000**

---

## 📁 项目结构

```
.
├── app.py                # Flask 后端服务
├── requirements.txt      # Python 依赖
├── .env.example          # 环境变量模板
├── README.md             # 本文件
└── public/
    ├── index.html        # 前端页面
    ├── style.css         # 样式表（深色科技感主题）
    └── app.js            # 前端交互逻辑
```

---

## 🎮 使用指南

### 互动流程

1. **选择员工** — 点击左侧员工列表中的任意角色（脚本千问/运营千问/美工千问）
2. **下达指令** — 中间输入区自动填入示例指令，可自由修改
3. **生成内容** — 点击「🚀 立刻干活」或按 `Ctrl+Enter`
4. **查看成果** — 右侧展示区实时显示 AI 生成内容
5. **复制/下载** — 文本可一键复制，图片可下载保存

### AI 员工能力

| 员工 | 能力 | API 模型 |
|------|------|----------|
| ✍️ 脚本千问 | 广告文案、品牌故事、短视频脚本 | qwen-max |
| 📊 运营千问 | 数据分析、运营方案、KOL策略 | qwen-max |
| 🎨 美工千问 | 海报设计、Logo生成、产品渲染 | wanx2.1-t2i-turbo |
| 🎬 视频千问 | 15秒短视频（即将开放） | 敬请期待 |

### 🎯 公司创建器（彩蛋）

展开任务面板底部的「创建你的「一人公司」」区域，输入公司名称和行业，AI 将自动推荐使用运营千问并生成完整营销方案框架。

---

## 🛠 技术架构

### 前端
- **纯 HTML/CSS/JS** — 零框架依赖，轻量高效
- **深色科技感主题** — 玻璃态卡片、霓虹蓝紫渐变、粒子背景
- **响应式设计** — PC 三栏布局 / 移动端垂直堆叠
- **Canvas 粒子动画** — 背景动态粒子连线效果
- **CSS 动画** — 脉冲发光、shimmer 骨架屏、淡入效果

### 后端 (Python Flask)
- **API 代理** — 安全代理阿里云百炼平台 API（使用 urllib，零第三方 SDK 依赖）
- **频率限制** — 每 IP 10秒1次，防滥用
- **降级处理** — API Key 缺失或调用失败时自动返回预置示例
- **异步图片生成** — wanx 异步任务提交 + 轮询获取结果（最多等待 60 秒）

### API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/generate-text` | 文本生成（qwen-max） |
| `POST` | `/api/generate-image` | 图片生成（wanx2.1-t2i-turbo） |
| `GET` | `/api/health` | 健康检查 |

---

## 🔧 运行模式

### 演示模式（默认，无需 API Key）

未配置 API Key 时，所有请求返回高质量的预置演示内容，展示完整交互流程。适合快速体验和演示。

### 正式模式（需配置 API Key）

在 `.env` 中配置有效的 `DASHSCOPE_API_KEY` 后，所有请求通过真实的千问 API 生成内容。

---

## 🌐 部署建议

### 本地运行

```bash
pip install -r requirements.txt
python app.py
```

### Docker 部署

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 3000
CMD ["python", "app.py"]
```

---

## 📝 设计规范

| 属性 | 值 |
|------|------|
| 背景色 | `#0A0F1A` |
| 主色（阿里云蓝） | `#2F80ED` |
| 点缀色（霓虹紫） | `#9D4EDD` |
| 卡片样式 | 半透明玻璃态 + backdrop-filter blur |
| 字体 | 系统字体栈（PingFang SC / Microsoft YaHei） |

---

## ⚠️ 注意事项

- API Key 存储在 `.env` 文件中，**切勿提交到版本控制**
- 免费 API Key 有调用频率和次数限制，详见 [阿里云百炼文档](https://help.aliyun.com/zh/model-studio/)
- 图片生成（wanx）耗时约 30-60 秒，后端有轮询等待机制
- 所有员工角色本质上是调用同一个千问大模型 + 不同的提示词工程（Prompt Engineering）
- 符合广告法规要求：底部标注"广告"、频率限制提醒、隐私保护声明

---

## 📄 许可证

本项目仅供学习交流和广告演示使用。阿里云、千问及相关商标归阿里巴巴集团所有。

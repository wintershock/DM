# 算法面试教练 - 前端界面

这是算法面试教练系统的前端界面，支持与后端 API 集成。

## 📁 项目结构

```
frontend/
├── templates/
│   └── index.html          # 主页面模板
├── static/
│   ├── css/
│   │   └── styles.css      # 样式文件
│   └── js/
│       ├── problems.js     # 题库数据
│       └── app.jsx         # React 应用主文件
├── web_server.py           # FastAPI 后端示例
└── README.md               # 本文件
```

## 🚀 快速开始

### 方式一：与现有项目集成

1. **复制前端文件到你的项目**
```bash
# 假设你的项目结构是这样的
your-project/
├── src/              # 你的 Python 代码
├── frontend/         # 把这个目录复制过去
└── main.py
```

2. **在你的 FastAPI/Flask 应用中添加路由**

FastAPI 示例：
```python
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI()

# 挂载静态文件
app.mount("/static", StaticFiles(directory="frontend/static"), name="static")

# 服务首页
@app.get("/")
async def serve_frontend():
    return FileResponse("frontend/templates/index.html")

# 添加你的 API 路由...
@app.post("/api/session/start")
async def start_session(...):
    # 集成你的 Coach Orchestrator
    pass
```

3. **运行服务**
```bash
uvicorn main:app --reload --port 8000
```

4. **访问** http://localhost:8000

### 方式二：独立运行演示

```bash
# 安装依赖
pip install fastapi uvicorn

# 运行示例服务器
python web_server.py
# 或
uvicorn web_server:app --reload --port 8000
```

## 🔌 API 接口说明

前端期望后端提供以下 API：

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/session/start` | POST | 开始新会话 |
| `/api/session/{id}/message` | POST | 发送消息 |
| `/api/session/{id}/submit` | POST | 提交代码 |
| `/api/session/{id}/run` | POST | 运行代码 |
| `/api/session/{id}/hint` | POST | 获取提示 |

### 请求/响应示例

**开始会话**
```json
// POST /api/session/start
// Request
{ "problem_id": 1 }

// Response
{
  "session_id": "uuid-xxx",
  "message": "你好！我是你的面试教练...",
  "stage": 0
}
```

**发送消息**
```json
// POST /api/session/{id}/message
// Request
{
  "message": "我觉得可以用哈希表...",
  "code": "def twoSum(nums, target):..."
}

// Response
{
  "message": "很好的思路！...",
  "stage": 2
}
```

**提交代码**
```json
// POST /api/session/{id}/submit
// Request
{ "code": "def twoSum(nums, target):..." }

// Response
{
  "feedback": "代码分析结果...",
  "stage": 4,
  "passed": true
}
```

## 🎨 自定义

### 添加更多题目

编辑 `static/js/problems.js`：

```javascript
const problemLibrary = [
  {
    id: 1,
    title: "题目名称",
    titleEn: "English Name",
    difficulty: "easy",  // easy, medium, hard
    tags: ["数组", "哈希表"],
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    description: "题目描述...",
    examples: [
      { input: "...", output: "...", explanation: "..." }
    ],
    constraints: ["约束条件..."],
    starterCode: "def solution():
    pass"
  },
  // 添加更多题目...
];
```

### 修改样式

编辑 `static/css/styles.css` 来自定义主题颜色、字体等。

### 修改交互逻辑

编辑 `static/js/app.jsx` 来调整 React 组件行为。

## 🔧 与你的系统集成

参考 `web_server.py` 中的 TODO 注释，将 API 路由与你的核心模块连接：

```python
# 示例：集成你的 Coach Orchestrator
from your_module import CoachOrchestrator

@app.post("/api/session/start")
async def start_session(request: StartSessionRequest):
    coach = CoachOrchestrator()
    session = coach.start_session(problem_id=request.problem_id)
    return {
        "session_id": session.id,
        "message": session.initial_message,
        "stage": session.current_stage
    }
```

## 📝 开发说明

- 前端使用 React 18 + Babel（浏览器端编译）
- 不需要 Node.js 或 npm
- 支持离线演示模式（后端不可用时自动降级）
- 计时器、连接状态等已内置

## 🐛 常见问题

**Q: 页面显示 "Demo" 而不是 "Online"**
A: 前端无法连接到 `/api/health`，请确保后端服务正在运行。

**Q: 如何添加用户认证？**
A: 在 FastAPI 中添加 OAuth2/JWT 中间件，前端会自动携带 Cookie。

**Q: 如何支持多语言？**
A: 修改 `problems.js` 和 `app.jsx` 中的文本，或集成 i18n 库。

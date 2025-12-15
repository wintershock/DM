# LeetCoach（算法面试教练）

LeetCoach 是一个对话式的算法面试练习系统：你可以像在真实面试中一样用自然语言沟通、提交代码、请求提示；系统会在内部用状态机编排流程，并通过大语言模型（LLM）以“苏格拉底式提问 + 渐进提示”的方式推动你自己发现问题、修正思路，直到完成一道题。

该仓库目录名可能仍为 `interview-coach-v2`（历史原因），但本文档与对外展示统一使用 **LeetCoach**。

## 1. 你能获得什么

- **自然对话训练**：像聊天一样练题，不强制表单/步骤化界面
- **可控的训练流程**：内部状态机将一次练题拆成“等待代码 → 引导 → 追问 → 教学 → 完成”
- **自动代码评估与分流**：根据你的输入（代码/思路/求助/跳过）决定下一步策略
- **渐进式提示**：最多 5 次引导（提示强度逐步提升），仍未解决则进入教学阶段
- **多模型支持**：Mock（开发/测试）、通义千问、OpenAI、Anthropic
- **可测试**：提供 `pytest` 用例覆盖关键会话分支，便于回归

## 2. 工作流（高层概览）

```text
用户输入（代码/思路/求助/跳过）
  ├─ 识别为代码提交
  │    ├─ 评估为正确  -> 进入追问（默认 3 问） -> 完成
  │    └─ 评估为错误  -> 进入引导（最多 5 轮） -> 教学 -> 完成
  └─ 识别为求助/讨论
       -> 进入引导（最多 5 轮） -> 教学 -> 完成
```

## 3. 项目结构（按职责划分）

```text
interview-coach-v2/
  src/                 # CLI 主程序 + 核心编排逻辑
    main.py            # CLI 入口：python -m src.main
    coach_engine.py    # 会话状态机/编排器（核心）
    llm_client.py      # LLM 客户端抽象 + Mock/Qwen/OpenAI/Anthropic 适配
    prompt_library.py  # 统一的 Prompt 构建库（意图识别/评估/引导/追问/教学）
    problem_library.py # 题库与测试用例
    models.py          # Session / Phase / State 等数据模型
  frontend/            # 可选 Web Demo（FastAPI + 静态页面）
  config/              # 配置（环境变量读取等）
  tests/               # 自动化测试（pytest）
  test_qwen.py          # 通义千问连通性测试脚本
  requirements.txt
  README.md
```

## 4. 环境准备

- Python：建议 **3.9+**
- 安装依赖：

```bash
pip install -r requirements.txt
```

## 5. 运行（CLI，推荐从这里开始）

> 入口在 `src/main.py`，因此运行命令统一为 `python -m src.main`。

### 5.1 Mock 模式（无需任何 API Key）

```bash
python -m src.main
```

说明：若你选择真实 Provider 但连接失败，程序也会自动回退到 Mock。

### 5.2 通义千问（Qwen）

Bash：

```bash
export DASHSCOPE_API_KEY="your-key"  # 或 QWEN_API_KEY
python -m src.main --provider qwen
python -m src.main --provider qwen --model qwen-max
```

PowerShell（Windows）：

```powershell
$env:DASHSCOPE_API_KEY="your-key"  # 或 $env:QWEN_API_KEY
python -m src.main --provider qwen
python -m src.main --provider qwen --model qwen-max
```

### 5.3 OpenAI

Bash：

```bash
export OPENAI_API_KEY="your-key"
python -m src.main --provider openai
```

PowerShell：

```powershell
$env:OPENAI_API_KEY="your-key"
python -m src.main --provider openai
```

### 5.4 Anthropic

Bash：

```bash
export ANTHROPIC_API_KEY="your-key"
python -m src.main --provider anthropic
```

PowerShell：

```powershell
$env:ANTHROPIC_API_KEY="your-key"
python -m src.main --provider anthropic
```

### 5.5 启动时指定题目 / 随机题目

```bash
python -m src.main --provider qwen -p "两数之和"
python -m src.main --provider qwen --random
```

### 5.6 CLI 内置命令

- **`problems`**：查看题目列表
- **`select X`**：选择题目（名称包含 `X`）
- **`new`**：随机开始新题目
- **`status`**：查看当前状态（阶段、次数等）
- **`help`**：帮助
- **`quit` / `exit`**：退出

## 6. Web Demo（可选）

本仓库提供了一个可选的 Web Demo 位于 `frontend/`（FastAPI + 静态页面）。

- 相关说明见：`frontend/README.md`
- 启动方式（示例）：

```bash
python frontend/web_server.py
# 或
uvicorn frontend.web_server:app --reload --port 8000
```

## 7. 配置

### 7.1 环境变量（用于 API Key）

| 变量 | 说明 |
|------|------|
| `DASHSCOPE_API_KEY` | 通义千问 API Key |
| `QWEN_API_KEY` | 通义千问 API Key（别名） |
| `OPENAI_API_KEY` | OpenAI API Key |
| `ANTHROPIC_API_KEY` | Anthropic API Key |

### 7.2 命令行参数（CLI）

| 参数 | 说明 |
|------|------|
| `--provider` | `mock` / `qwen` / `openai` / `anthropic` |
| `--model` | 模型名（例如 `qwen-plus` / `qwen-max` / `gpt-4`） |
| `--problem`, `-p` | 指定题目名称 |
| `--random`, `-r` | 随机题目 |
| `--api-key` | API Key（也可用环境变量） |

## 8. 题库

题库与测试用例位于 `src/problem_library.py`。内置题目包含：

| 题目 | 难度 |
|------|------|
| 两数之和 | Easy |
| 有效的括号 | Easy |
| 反转链表 | Easy |
| 二分查找 | Easy |
| 合并两个有序链表 | Easy |
| 最大子数组和 | Medium |
| 爬楼梯 | Easy |
| 零钱兑换 | Medium |

## 9. 测试与开发

### 9.1 运行单元测试

```bash
python -m pytest tests/
```

### 9.2 测试通义千问连接

```bash
python test_qwen.py
```

## 10. 常见问题（FAQ）

### 10.1 我配置了 provider，但程序提示“无法连接”然后回退到 Mock？

- 检查 API Key 环境变量是否已正确设置
- 检查网络是否可访问对应 API
- 尝试显式指定 `--model`

### 10.2 Windows 下 `export` 不生效怎么办？

请使用 PowerShell：

```powershell
$env:DASHSCOPE_API_KEY="your-key"
```

或使用 CMD：

```bat
set DASHSCOPE_API_KEY=your-key
```

## 11. License

MIT

"""
算法面试教练 - 后端服务 (集成通义千问 API)

使用方法：
1. 设置环境变量: export DASHSCOPE_API_KEY="your-api-key"
2. 安装依赖: pip install fastapi uvicorn dashscope
3. 运行: python web_server.py 或 uvicorn web_server:app --reload --port 8000
4. 访问: http://localhost:8000
"""

import os
import uuid
from typing import Optional, List, Dict
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import dashscope
from dashscope import Generation

# ============================================
# 配置
# ============================================

# 设置 DashScope API 地址
dashscope.base_http_api_url = 'https://dashscope.aliyuncs.com/api/v1'

# 从环境变量读取 API Key，或者直接在这里设置
# 方式1: 设置环境变量 export DASHSCOPE_API_KEY="sk-xxx"
# 方式2: 直接在下面填入你的 API Key
DASHSCOPE_API_KEY = os.getenv("DASHSCOPE_API_KEY") or os.getenv("QWEN_API_KEY")

# 模型选择 
# 可选: qwen-turbo, qwen-plus, qwen-max, qwen-coder-plus-latest
QWEN_MODEL = "qwen-coder-plus-latest"

# ============================================
# FastAPI 应用
# ============================================

app = FastAPI(
    title="算法面试教练",
    description="基于通义千问的算法面试教练",
    version="1.0.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# 数据模型
# ============================================

class StartSessionRequest(BaseModel):
    problem_id: int

class MessageRequest(BaseModel):
    message: str
    code: Optional[str] = None

class SubmitCodeRequest(BaseModel):
    code: str

class RunCodeRequest(BaseModel):
    code: str

# ============================================
# 题库
# ============================================

PROBLEMS = {
    1: {
        "id": 1,
        "title": "两数之和",
        "title_en": "Two Sum",
        "difficulty": "easy",
        "description": """给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。
你可以假设每种输入只会对应一个答案，并且你不能使用两次相同的元素。
你可以按任意顺序返回答案。""",
        "examples": [
            {"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "因为 nums[0] + nums[1] == 9"},
        ],
        "constraints": ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "只会存在一个有效答案"],
        "optimal_time": "O(n)",
        "optimal_space": "O(n)",
        "solution_approach": "使用哈希表存储已遍历的数字及其索引，对于每个数字检查 target - num 是否在哈希表中",
        "common_mistakes": ["忘记处理空数组", "返回相同索引两次", "没有考虑负数情况"]
    },
    2: {
        "id": 2,
        "title": "有效的括号",
        "title_en": "Valid Parentheses",
        "difficulty": "easy",
        "description": """给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串 s，判断字符串是否有效。
有效字符串需满足：左括号必须用相同类型的右括号闭合，左括号必须以正确的顺序闭合。""",
        "examples": [
            {"input": 's = "()"', "output": "true", "explanation": ""},
            {"input": 's = "()[]{}"', "output": "true", "explanation": ""},
            {"input": 's = "(]"', "output": "false", "explanation": ""}
        ],
        "constraints": ["1 <= s.length <= 10^4", "s 仅由括号 '()[]{}' 组成"],
        "optimal_time": "O(n)",
        "optimal_space": "O(n)",
        "solution_approach": "使用栈，遇到左括号入栈，遇到右括号检查栈顶是否匹配",
        "common_mistakes": ["忘记检查栈是否为空", "忘记最后检查栈是否清空", "括号匹配逻辑错误"]
    },
    3: {
        "id": 3,
        "title": "最大子数组和",
        "title_en": "Maximum Subarray",
        "difficulty": "medium",
        "description": """给你一个整数数组 nums，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。""",
        "examples": [
            {"input": "nums = [-2,1,-3,4,-1,2,1,-5,4]", "output": "6", "explanation": "连续子数组 [4,-1,2,1] 的和最大，为 6"}
        ],
        "constraints": ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
        "optimal_time": "O(n)",
        "optimal_space": "O(1)",
        "solution_approach": "Kadane 算法：维护当前子数组和，如果变为负数则重新开始",
        "common_mistakes": ["初始值设置错误", "没有处理全负数数组", "混淆局部最大和全局最大"]
    },
    4: {
        "id": 4,
        "title": "爬楼梯",
        "title_en": "Climbing Stairs",
        "difficulty": "easy",
        "description": """假设你正在爬楼梯。需要 n 阶你才能到达楼顶。每次你可以爬 1 或 2 个台阶。你有多少种不同的方法可以爬到楼顶呢？""",
        "examples": [
            {"input": "n = 2", "output": "2", "explanation": "有两种方法：1+1 或 2"},
            {"input": "n = 3", "output": "3", "explanation": "有三种方法：1+1+1、1+2、2+1"}
        ],
        "constraints": ["1 <= n <= 45"],
        "optimal_time": "O(n)",
        "optimal_space": "O(1)",
        "solution_approach": "斐波那契数列：f(n) = f(n-1) + f(n-2)",
        "common_mistakes": ["递归没有记忆化导致超时", "边界条件 n=1 和 n=2 处理错误"]
    },
    5: {
        "id": 5,
        "title": "无重复字符的最长子串",
        "title_en": "Longest Substring Without Repeating Characters",
        "difficulty": "medium",
        "description": """给定一个字符串 s，请你找出其中不含有重复字符的最长子串的长度。""",
        "examples": [
            {"input": 's = "abcabcbb"', "output": "3", "explanation": '无重复字符的最长子串是 "abc"'},
            {"input": 's = "bbbbb"', "output": "1", "explanation": '无重复字符的最长子串是 "b"'}
        ],
        "constraints": ["0 <= s.length <= 5 * 10^4"],
        "optimal_time": "O(n)",
        "optimal_space": "O(min(n,m))",
        "solution_approach": "滑动窗口 + 哈希表记录字符最后出现位置",
        "common_mistakes": ["窗口边界更新错误", "哈希表更新时机错误", "空字符串处理"]
    },
    6: {
        "id": 6,
        "title": "反转链表",
        "title_en": "Reverse Linked List",
        "difficulty": "easy",
        "description": """给你单链表的头节点 head，请你反转链表，并返回反转后的链表。""",
        "examples": [
            {"input": "head = [1,2,3,4,5]", "output": "[5,4,3,2,1]", "explanation": ""}
        ],
        "constraints": ["链表中节点的数目范围是 [0, 5000]"],
        "optimal_time": "O(n)",
        "optimal_space": "O(1)",
        "solution_approach": "迭代：用三个指针 prev, curr, next 逐个反转；或递归",
        "common_mistakes": ["丢失 next 指针", "没有正确处理空链表", "返回错误的头节点"]
    },
    7: {
        "id": 7,
        "title": "三数之和",
        "title_en": "3Sum",
        "difficulty": "medium",
        "description": """给你一个整数数组 nums，判断是否存在三元组 [nums[i], nums[j], nums[k]] 满足 i != j、i != k 且 j != k，同时还满足 nums[i] + nums[j] + nums[k] == 0。请返回所有和为 0 且不重复的三元组。""",
        "examples": [
            {"input": "nums = [-1,0,1,2,-1,-4]", "output": "[[-1,-1,2],[-1,0,1]]", "explanation": ""}
        ],
        "constraints": ["3 <= nums.length <= 3000"],
        "optimal_time": "O(n²)",
        "optimal_space": "O(1)",
        "solution_approach": "排序 + 双指针：固定一个数，用双指针找另外两个数",
        "common_mistakes": ["没有去重导致重复三元组", "双指针移动逻辑错误", "排序后忘记处理"]
    },
    8: {
        "id": 8,
        "title": "LRU 缓存",
        "title_en": "LRU Cache",
        "difficulty": "hard",
        "description": """请你设计并实现一个满足 LRU (最近最少使用) 缓存约束的数据结构。实现 LRUCache 类，get 和 put 必须以 O(1) 的平均时间复杂度运行。""",
        "examples": [
            {"input": '["LRUCache", "put", "put", "get", "put", "get"]', "output": "[null, null, null, 1, null, -1]", "explanation": ""}
        ],
        "constraints": ["1 <= capacity <= 3000"],
        "optimal_time": "O(1)",
        "optimal_space": "O(capacity)",
        "solution_approach": "哈希表 + 双向链表：哈希表存储 key 到节点的映射，双向链表维护访问顺序",
        "common_mistakes": ["链表操作顺序错误", "忘记更新哈希表", "容量满时删除逻辑错误"]
    }
}

# ============================================
# 会话管理
# ============================================

class Session:
    def __init__(self, session_id: str, problem_id: int):
        self.session_id = session_id
        self.problem_id = problem_id
        self.problem = PROBLEMS.get(problem_id, PROBLEMS[1])
        self.stage = 0  # 0-6 对应七个阶段
        self.history: List[Dict[str, str]] = []
        self.hint_level = 0  # 当前提示级别
        self.attempt_count = 0  # 代码提交次数
        
    def add_message(self, role: str, content: str):
        self.history.append({"role": role, "content": content})
    
    def get_conversation_context(self) -> List[Dict[str, str]]:
        """获取对话历史，格式化为 Qwen API 需要的格式"""
        return self.history[-10:]  # 只保留最近10轮对话避免 token 超限

# 会话存储
sessions: Dict[str, Session] = {}

# ============================================
# Prompt 模板
# ============================================

SYSTEM_PROMPT = """你是一位经验丰富的算法面试教练，采用苏格拉底式教学方法。

你的核心原则：
1. 【永远不要直接给出答案】- 通过提问引导学生自己思考
2. 【循序渐进】- 从简单问题开始，逐步深入
3. 【鼓励为主】- 肯定学生的正确思路，温和指出问题
4. 【严格评估】- 对代码正确性要求严格，宁可误判正确为错误，也不放过错误代码

当前面试阶段说明：
- 阶段0 (题意确认): 确保学生理解题目要求
- 阶段1 (思路口述): 引导学生说出解题思路
- 阶段2 (复杂度分析): 讨论时间和空间复杂度
- 阶段3 (代码实现): 学生开始写代码
- 阶段4 (边界检查): 检查代码的边界情况
- 阶段5 (Follow-up): 提出变体问题或优化
- 阶段6 (总结回顾): 总结解题模式和收获

回复要求：
- 使用中文
- 适当使用 emoji 增加亲和力
- 每次回复聚焦一个问题
- 回复控制在 200 字以内
"""

def get_stage_prompt(stage: int, problem: dict) -> str:
    """根据阶段生成特定的提示"""
    prompts = {
        0: f"""当前阶段：题意确认
题目：{problem['title']}
描述：{problem['description']}

你的任务：
- 确认学生是否理解题目
- 如果学生理解正确，表扬并引导进入下一阶段
- 如果理解有偏差，通过提问帮助纠正""",
        
        1: f"""当前阶段：思路口述
题目：{problem['title']}
参考思路：{problem['solution_approach']}

你的任务：
- 引导学生说出解题思路
- 如果学生没有思路，给出启发性问题
- 不要直接说出答案
- 如果学生提到暴力解法，追问是否有更优解""",
        
        2: f"""当前阶段：复杂度分析
题目：{problem['title']}
最优时间复杂度：{problem['optimal_time']}
最优空间复杂度：{problem['optimal_space']}

你的任务：
- 询问学生思路的复杂度
- 如果复杂度分析正确，引导进入代码阶段
- 如果分析有误，通过提问帮助纠正""",
        
        3: f"""当前阶段：代码实现
题目：{problem['title']}

你的任务：
- 鼓励学生开始写代码
- 如果学生遇到困难，给出小提示
- 不要写出完整代码""",
        
        4: f"""当前阶段：边界检查
题目：{problem['title']}
常见错误：{', '.join(problem['common_mistakes'])}

你的任务：
- 引导学生思考边界情况
- 提出具体的边界测试用例
- 询问代码是否处理了这些情况""",
        
        5: f"""当前阶段：Follow-up 追问
题目：{problem['title']}

你的任务：
- 提出变体问题或优化方向
- 例如：如果数组是有序的呢？如果要找所有解呢？
- 讨论其他可能的解法""",
        
        6: f"""当前阶段：总结回顾
题目：{problem['title']}
解题模式：{problem['solution_approach']}

你的任务：
- 总结这道题的核心技巧
- 提炼可复用的解题模式
- 给出鼓励性的评价"""
    }
    return prompts.get(stage, prompts[0])


def get_code_review_prompt(problem: dict, code: str) -> str:
    """代码评审提示"""
    return f"""你需要评审学生提交的代码。

题目：{problem['title']}
题目描述：{problem['description']}
参考思路：{problem['solution_approach']}
常见错误：{', '.join(problem['common_mistakes'])}

学生代码：
```python
{code}
```

评审要求：
1. 【严格评估】- 仔细检查代码逻辑是否完全正确
2. 如果代码有任何问题（逻辑错误、边界问题、效率问题），通过提问引导学生发现
3. 不要直接指出错误，而是问"你考虑过...情况吗？"
4. 如果代码完全正确，给出肯定并进入下一阶段
5. 回复控制在 150 字以内

请以面试教练的身份回复："""


def get_hint_prompt(problem: dict, hint_level: int) -> str:
    """分层提示"""
    hints = [
        f"💡 想想这道题的核心在于什么？有什么数据结构可以帮助我们？",
        f"💡 提示：考虑使用 {problem['solution_approach'].split('：')[0] if '：' in problem['solution_approach'] else '哈希表或双指针'}",
        f"💡 更具体的提示：{problem['solution_approach']}"
    ]
    return hints[min(hint_level, len(hints) - 1)]

# ============================================
# Qwen API 调用
# ============================================

def call_qwen(messages: List[Dict[str, str]], system_prompt: str = SYSTEM_PROMPT) -> str:
    """调用通义千问 API"""
    if not DASHSCOPE_API_KEY:
        return "抱歉，未配置 DASHSCOPE_API_KEY（或 QWEN_API_KEY），请先设置环境变量后再试。"
    try:
        # 构建完整的消息列表，包含 system prompt
        full_messages = [{"role": "system", "content": system_prompt}] + messages
        
        response = Generation.call(
            api_key=DASHSCOPE_API_KEY,  # 直接传入 api_key
            model=QWEN_MODEL,
            messages=full_messages,
            result_format='message',
            temperature=0.7,
            max_tokens=500,
            top_p=0.9,
        )
        
        if response.status_code == 200:
            return response.output.choices[0].message.content
        else:
            print(f"Qwen API Error: {response.code} - {response.message}")
            return f"抱歉，API 调用失败：{response.message}"
            
    except Exception as e:
        print(f"Qwen API Exception: {e}")
        return f"抱歉，服务暂时不可用：{str(e)}"

# ============================================
# API 路由
# ============================================

@app.get("/api/health")
async def health_check():
    """健康检查"""
    api_status = "ok" if DASHSCOPE_API_KEY else "no_api_key"
    return {
        "status": "ok",
        "api_status": api_status,
        "model": QWEN_MODEL
    }

@app.get("/api/problems")
async def list_problems():
    """获取题目列表"""
    return {
        "problems": [
            {
                "id": p["id"],
                "title": p["title"],
                "title_en": p["title_en"],
                "difficulty": p["difficulty"]
            }
            for p in PROBLEMS.values()
        ]
    }

@app.post("/api/session/start")
async def start_session(request: StartSessionRequest):
    """开始新会话"""
    session_id = str(uuid.uuid4())
    problem_id = request.problem_id if request.problem_id in PROBLEMS else 1
    
    session = Session(session_id, problem_id)
    sessions[session_id] = session
    
    # 生成开场白
    problem = session.problem
    stage_prompt = get_stage_prompt(0, problem)
    
    messages = [{"role": "user", "content": f"学生选择了题目「{problem['title']}」，请开始面试。{stage_prompt}"}]
    
    welcome_message = call_qwen(messages, SYSTEM_PROMPT)
    session.add_message("assistant", welcome_message)
    
    return {
        "session_id": session_id,
        "message": welcome_message,
        "stage": session.stage,
        "problem": {
            "id": problem["id"],
            "title": problem["title"]
        }
    }

@app.post("/api/session/{session_id}/message")
async def send_message(session_id: str, request: MessageRequest):
    """发送消息"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    session.add_message("user", request.message)
    
    # 构建上下文
    stage_prompt = get_stage_prompt(session.stage, session.problem)
    context_messages = session.get_conversation_context()
    
    # 添加阶段信息到最后一条消息
    if context_messages:
        enhanced_content = context_messages[-1]["content"] + f"\n\n[系统提示: {stage_prompt}]"
        context_messages = context_messages[:-1] + [{"role": context_messages[-1]["role"], "content": enhanced_content}]
    
    # 调用 Qwen
    response = call_qwen(context_messages, SYSTEM_PROMPT)
    session.add_message("assistant", response)
    
    # 阶段推进逻辑
    stage_keywords = {
        0: ["理解", "明白", "正确", "没问题", "很好"],
        1: ["思路", "想法", "方法", "不错", "可以"],
        2: ["复杂度", "O(n)", "分析得对", "正确"],
        3: ["代码", "写", "实现"],
        4: ["边界", "测试", "检查"],
        5: ["变体", "优化", "如果"],
    }
    
    current_keywords = stage_keywords.get(session.stage, [])
    if any(kw in response for kw in current_keywords) and session.stage < 6:
        if "下一" in response or "接下来" in response or "开始" in response:
            session.stage = min(session.stage + 1, 6)
    
    return {
        "message": response,
        "stage": session.stage
    }

@app.post("/api/session/{session_id}/submit")
async def submit_code(session_id: str, request: SubmitCodeRequest):
    """提交代码"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    session.attempt_count += 1
    
    # 代码评审
    review_prompt = get_code_review_prompt(session.problem, request.code)
    messages = session.get_conversation_context() + [{"role": "user", "content": review_prompt}]
    
    feedback = call_qwen(messages, SYSTEM_PROMPT)
    session.add_message("assistant", feedback)
    
    if session.stage < 4:
        session.stage = 4
    
    return {
        "feedback": feedback,
        "stage": session.stage,
        "attempt_count": session.attempt_count
    }

@app.post("/api/session/{session_id}/run")
async def run_code(session_id: str, request: RunCodeRequest):
    """模拟运行代码"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    problem = session.problem
    
    run_prompt = f"""请模拟执行以下代码，使用题目的示例输入进行测试。

题目：{problem['title']}
示例输入：{problem['examples'][0]['input']}
预期输出：{problem['examples'][0]['output']}

代码：
```python
{request.code}
```

请逐步追踪代码执行过程，然后给出运行结果。如果代码有语法错误或逻辑问题，指出来。
回复格式：
1. 执行追踪（简要）
2. 运行结果
3. 是否与预期一致"""

    messages = [{"role": "user", "content": run_prompt}]
    output = call_qwen(messages, "你是一个代码执行模拟器，请准确追踪代码执行过程。")
    
    return {
        "output": output,
        "success": True
    }

@app.post("/api/session/{session_id}/hint")
async def get_hint(session_id: str):
    """获取提示"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    hint = get_hint_prompt(session.problem, session.hint_level)
    session.hint_level += 1
    
    session.add_message("assistant", hint)
    
    return {
        "hint": hint,
        "hint_level": session.hint_level
    }

# ============================================
# 静态文件服务
# ============================================

frontend_dir = os.path.join(os.path.dirname(__file__), "static")
templates_dir = os.path.join(os.path.dirname(__file__), "templates")

if os.path.exists(frontend_dir):
    app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

@app.get("/", response_class=HTMLResponse)
async def serve_frontend():
    """服务前端页面"""
    index_path = os.path.join(templates_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    else:
        return HTMLResponse(content="""
        <html>
            <head><title>算法面试教练</title></head>
            <body style="font-family: sans-serif; padding: 40px; text-align: center;">
                <h1>🎯 算法面试教练 API</h1>
                <p>API 服务正在运行</p>
                <p>请将前端文件放置在 templates/ 和 static/ 目录</p>
                <p><a href="/docs">查看 API 文档</a></p>
            </body>
        </html>
        """)

# ============================================
# 启动
# ============================================

if __name__ == "__main__":
    import uvicorn
    
    print(f"""
    ╔═══════════════════════════════════════════════════════════════╗
    ║              算法面试教练 - Interview Coach                    ║
    ╠═══════════════════════════════════════════════════════════════╣
    ║  🚀 启动服务...                                               ║
    ║  📍 访问地址: http://localhost:8000                           ║
    ║  📚 API文档:  http://localhost:8000/docs                      ║
    ╠═══════════════════════════════════════════════════════════════╣
    ║  ⚙️  配置:                                                    ║
    ║      - 模型: {QWEN_MODEL}                                     ║
    ║      - API Key: {'已配置 ✓' if DASHSCOPE_API_KEY else '未配置 ✗'}                                 ║
    ╚═══════════════════════════════════════════════════════════════╝
    """)
    
    uvicorn.run(app, host="0.0.0.0", port=8000)

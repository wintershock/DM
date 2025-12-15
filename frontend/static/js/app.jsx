const { useState, useEffect, useRef } = React;

// API Configuration
const API_BASE_URL = window.location.origin + '/api';

// API Service
const api = {
    // Start a new coaching session
    async startSession(problemId) {
        const response = await fetch(`${API_BASE_URL}/session/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ problem_id: problemId })
        });
        return response.json();
    },
    
    // Send a message to the coach
    async sendMessage(sessionId, message, code = null) {
        const response = await fetch(`${API_BASE_URL}/session/${sessionId}/message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, code })
        });
        return response.json();
    },
    
    // Submit code for review
    async submitCode(sessionId, code) {
        const response = await fetch(`${API_BASE_URL}/session/${sessionId}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });
        return response.json();
    },
    
    // Run code
    async runCode(sessionId, code) {
        const response = await fetch(`${API_BASE_URL}/session/${sessionId}/run`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });
        return response.json();
    },
    
    // Get hint
    async getHint(sessionId) {
        const response = await fetch(`${API_BASE_URL}/session/${sessionId}/hint`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        return response.json();
    },
    
    // Health check
    async healthCheck() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            return response.ok;
        } catch {
            return false;
        }
    }
};

// Icons
const Icons = {
    Code: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
    ),
    BookOpen: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
    ),
    Chat: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
    ),
    Play: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
    ),
    Send: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
    ),
    Lightbulb: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
            <path d="M9 18h6"></path>
            <path d="M10 22h4"></path>
        </svg>
    ),
    Refresh: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2v6h-6"></path>
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
            <path d="M3 22v-6h6"></path>
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
        </svg>
    ),
    Clock: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
    ),
    Target: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="6"></circle>
            <circle cx="12" cy="12" r="2"></circle>
        </svg>
    ),
    CheckCircle: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
    )
};

// Problem Selector Modal
const ProblemSelectorModal = ({ isOpen, onClose, problems, currentProblemId, onSelectProblem }) => {
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    
    if (!isOpen) return null;
    
    const filteredProblems = problems.filter(p => {
        const matchesDifficulty = filter === 'all' || p.difficulty === filter;
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             p.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             p.tags.some(tag => tag.includes(searchQuery));
        return matchesDifficulty && matchesSearch;
    });
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="card" style={{
                width: '700px',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }} onClick={e => e.stopPropagation()}>
                <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600 }}>📚 选择题目</h2>
                        <button onClick={onClose} style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: '#94a3b8',
                            lineHeight: 1
                        }}>×</button>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <input
                            type="text"
                            placeholder="搜索题目名称或标签..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '10px 14px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '10px',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        />
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {[
                                { key: 'all', label: '全部' },
                                { key: 'easy', label: '简单' },
                                { key: 'medium', label: '中等' },
                                { key: 'hard', label: '困难' }
                            ].map(f => (
                                <button
                                    key={f.key}
                                    onClick={() => setFilter(f.key)}
                                    style={{
                                        padding: '8px 14px',
                                        borderRadius: '20px',
                                        border: filter === f.key ? 'none' : '1px solid #e2e8f0',
                                        background: filter === f.key 
                                            ? (f.key === 'easy' ? '#dcfce7' : f.key === 'medium' ? '#fef3c7' : f.key === 'hard' ? '#fee2e2' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)')
                                            : 'white',
                                        color: filter === f.key
                                            ? (f.key === 'easy' ? '#16a34a' : f.key === 'medium' ? '#d97706' : f.key === 'hard' ? '#dc2626' : 'white')
                                            : '#64748b',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
                    {filteredProblems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                            没有找到匹配的题目
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {filteredProblems.map(problem => (
                                <div
                                    key={problem.id}
                                    onClick={() => onSelectProblem(problem)}
                                    style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: problem.id === currentProblemId ? '2px solid #667eea' : '1px solid #e2e8f0',
                                        background: problem.id === currentProblemId ? '#f8f7ff' : 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                                <span style={{ fontWeight: 600, fontSize: '15px' }}>{problem.title}</span>
                                                <span style={{ color: '#94a3b8', fontSize: '13px' }}>{problem.titleEn}</span>
                                                {problem.id === currentProblemId && (
                                                    <span style={{
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        color: 'white',
                                                        padding: '2px 8px',
                                                        borderRadius: '10px',
                                                        fontSize: '11px',
                                                        fontWeight: 500
                                                    }}>当前</span>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                <span className={`tag tag-${problem.difficulty}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                                                    {problem.difficulty === 'easy' ? '简单' : problem.difficulty === 'medium' ? '中等' : '困难'}
                                                </span>
                                                {problem.tags.map((tag, i) => (
                                                    <span key={i} className="tag tag-category" style={{ fontSize: '11px', padding: '2px 8px' }}>
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', fontSize: '12px', color: '#94a3b8' }}>
                                            <div>时间: <span className="code-font" style={{ color: '#059669' }}>{problem.timeComplexity}</span></div>
                                            <div>空间: <span className="code-font" style={{ color: '#2563eb' }}>{problem.spaceComplexity}</span></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>
                            共 {filteredProblems.length} 道题目
                        </span>
                        <button onClick={onClose} className="btn-secondary" style={{ padding: '8px 20px' }}>
                            关闭
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Problem Panel
const ProblemPanel = ({ problem, onChangeProblem }) => {
    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="panel-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="panel-title">
                        <div className="panel-icon" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
                            <Icons.BookOpen />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '2px' }}>{problem.title}</h2>
                            <p style={{ fontSize: '13px', color: '#94a3b8' }}>{problem.titleEn}</p>
                        </div>
                    </div>
                    <button onClick={onChangeProblem} className="btn-icon" title="更换题目" style={{ marginLeft: '8px' }}>
                        <Icons.Refresh />
                    </button>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                    <span className={`tag tag-${problem.difficulty}`}>
                        {problem.difficulty === 'easy' ? '简单' : problem.difficulty === 'medium' ? '中等' : '困难'}
                    </span>
                    {problem.tags.map((tag, i) => (
                        <span key={i} className="tag tag-category">{tag}</span>
                    ))}
                </div>
            </div>
            
            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '10px' }}>题目描述</h3>
                    <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#334155', whiteSpace: 'pre-line' }}>
                        {problem.description}
                    </p>
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '12px' }}>示例</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {problem.examples.map((example, i) => (
                            <div key={i} className="example-block">
                                <div className="code-font" style={{ fontSize: '13px', marginBottom: '6px' }}>
                                    <span style={{ color: '#64748b' }}>输入：</span>
                                    <span style={{ color: '#059669' }}>{example.input}</span>
                                </div>
                                <div className="code-font" style={{ fontSize: '13px' }}>
                                    <span style={{ color: '#64748b' }}>输出：</span>
                                    <span style={{ color: '#2563eb' }}>{example.output}</span>
                                </div>
                                {example.explanation && (
                                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
                                        💡 {example.explanation}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '10px' }}>提示条件</h3>
                    <div>
                        {problem.constraints.map((constraint, i) => (
                            <div key={i} className="constraint-item">
                                <span className="constraint-dot"></span>
                                <span className="code-font">{constraint}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="complexity-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <Icons.Target />
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#7c3aed' }}>目标复杂度</span>
                    </div>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <div>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>时间复杂度</span>
                            <div className="code-font" style={{ fontSize: '16px', fontWeight: 600, color: '#059669', marginTop: '2px' }}>
                                {problem.timeComplexity}
                            </div>
                        </div>
                        <div>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>空间复杂度</span>
                            <div className="code-font" style={{ fontSize: '16px', fontWeight: 600, color: '#2563eb', marginTop: '2px' }}>
                                {problem.spaceComplexity}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Code Editor
const CodeEditor = ({ code, setCode, onRun, onSubmit, isRunning, isSubmitting }) => {
    const lines = code.split('\n');
    const lineNumbersRef = useRef(null);
    
    const handleScroll = (e) => {
        if (lineNumbersRef.current) {
            lineNumbersRef.current.scrollTop = e.target.scrollTop;
        }
    };
    
    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const newCode = code.substring(0, start) + '    ' + code.substring(end);
            setCode(newCode);
            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 4;
            }, 0);
        }
    };
    
    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="panel-title">
                    <div className="panel-icon" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' }}>
                        <Icons.Code />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '2px' }}>代码编辑器</h2>
                        <p style={{ fontSize: '13px', color: '#94a3b8' }}>Python 3</p>
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={onRun} 
                        disabled={isRunning}
                        className="btn-secondary" 
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
                    >
                        {isRunning ? <div className="spinner"></div> : <Icons.Play />}
                        {isRunning ? '运行中...' : '运行'}
                    </button>
                    <button 
                        onClick={onSubmit} 
                        disabled={isSubmitting}
                        className="btn-primary" 
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        {isSubmitting ? <div className="spinner"></div> : <Icons.CheckCircle />}
                        {isSubmitting ? '提交中...' : '提交代码'}
                    </button>
                </div>
            </div>
            
            <div style={{ flex: 1, padding: '20px', overflow: 'hidden' }}>
                <div className="code-editor" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div className="code-editor-header">
                        <div className="code-editor-dot" style={{ background: '#ef4444' }}></div>
                        <div className="code-editor-dot" style={{ background: '#f59e0b' }}></div>
                        <div className="code-editor-dot" style={{ background: '#22c55e' }}></div>
                        <span style={{ marginLeft: '12px', color: '#94a3b8', fontSize: '13px' }}>solution.py</span>
                    </div>
                    
                    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                        <div 
                            ref={lineNumbersRef}
                            className="line-numbers code-font"
                            style={{ padding: '16px 0', fontSize: '14px', lineHeight: 1.6, overflow: 'hidden', minWidth: '50px' }}
                        >
                            {lines.map((_, i) => (
                                <div key={i + 1}>{i + 1}</div>
                            ))}
                        </div>
                        
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            onScroll={handleScroll}
                            onKeyDown={handleKeyDown}
                            className="code-font"
                            style={{ flex: 1, padding: '16px' }}
                            placeholder="# 在这里编写你的代码..."
                            spellCheck="false"
                        />
                    </div>
                </div>
            </div>
            
            <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#94a3b8' }}>
                    <span>行 {lines.length}</span>
                    <span>字符 {code.length}</span>
                </div>
                <div className="status-badge">
                    <span className="status-dot"></span>
                    准备就绪
                </div>
            </div>
        </div>
    );
};

// Chat Panel
const ChatPanel = ({ conversation, currentStage, onSendMessage, onRequestHint, isTyping, onChangeProblem, isConnected }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation, isTyping]);
    
    const handleSend = () => {
        if (input.trim() && !isTyping) {
            onSendMessage(input.trim());
            setInput('');
        }
    };
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    
    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="panel-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="panel-title">
                        <div className="panel-icon" style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' }}>
                            <Icons.Chat />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '2px' }}>面试教练</h2>
                            <p style={{ fontSize: '13px', color: '#94a3b8' }}>Socratic Coaching</p>
                        </div>
                    </div>
                    <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                        <span className={`status-dot ${isConnected ? '' : 'error'}`}></span>
                        {isConnected ? '已连接' : '未连接'}
                    </div>
                </div>
                
                <div style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                        {stages.map((stage, i) => (
                            <div 
                                key={stage.id}
                                className={`progress-step ${i < currentStage ? 'completed' : ''} ${i === currentStage ? 'active' : ''}`}
                            />
                        ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                        <span>{stages[currentStage]?.icon}</span>
                        <span>当前阶段：<strong style={{ color: '#475569' }}>{stages[currentStage]?.name}</strong></span>
                    </div>
                </div>
            </div>
            
            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {conversation.map((msg, i) => (
                        <div 
                            key={i} 
                            className={msg.role === 'coach' ? 'chat-coach' : msg.role === 'error' ? 'chat-error' : 'chat-user'}
                            style={{ padding: '14px 16px', maxWidth: '95%', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <div className={`avatar ${msg.role === 'coach' ? 'avatar-coach' : 'avatar-user'}`}>
                                    {msg.role === 'coach' ? '🎓' : msg.role === 'error' ? '⚠️' : '👤'}
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>
                                    {msg.role === 'coach' ? '面试教练' : msg.role === 'error' ? '系统提示' : '你'}
                                </span>
                            </div>
                            <div style={{ fontSize: '14px', lineHeight: 1.7, color: '#334155', whiteSpace: 'pre-line', paddingLeft: '42px' }}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    
                    {isTyping && (
                        <div className="chat-coach" style={{ padding: '14px 16px', alignSelf: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <div className="avatar avatar-coach">🎓</div>
                                <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>面试教练</span>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', paddingLeft: '42px' }}>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                            </div>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>
            </div>
            
            <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9' }}>
                <div className="input-area" style={{ padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="输入你的回答或提问..."
                        disabled={isTyping}
                        style={{ flex: 1, fontSize: '14px', lineHeight: 1.5, maxHeight: '100px' }}
                        rows={1}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className="btn-primary"
                        style={{ 
                            padding: '10px', 
                            borderRadius: '10px',
                            opacity: input.trim() && !isTyping ? 1 : 0.5,
                            cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed'
                        }}
                    >
                        <Icons.Send />
                    </button>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    <button className="quick-action" onClick={onRequestHint} disabled={isTyping}>
                        <Icons.Lightbulb />
                        请求提示
                    </button>
                    <button className="quick-action" onClick={onChangeProblem}>
                        <Icons.Refresh />
                        换一道题
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main App
const App = () => {
    const [currentProblem, setCurrentProblem] = useState(problemLibrary[0]);
    const [code, setCode] = useState(problemLibrary[0].starterCode);
    const [conversation, setConversation] = useState([]);
    const [currentStage, setCurrentStage] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [showProblemSelector, setShowProblemSelector] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timer, setTimer] = useState(0);
    
    // Timer effect
    useEffect(() => {
        const interval = setInterval(() => {
            setTimer(t => t + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    // Check API connection and start session
    useEffect(() => {
        const initSession = async () => {
            const connected = await api.healthCheck();
            setIsConnected(connected);
            
            if (connected) {
                try {
                    const result = await api.startSession(currentProblem.id);
                    setSessionId(result.session_id);
                    if (result.message) {
                        setConversation([{ role: 'coach', content: result.message }]);
                    }
                    if (result.stage !== undefined) {
                        setCurrentStage(result.stage);
                    }
                } catch (error) {
                    console.error('Failed to start session:', error);
                    setConversation([{
                        role: 'coach',
                        content: `你好！我是你的算法面试教练 👋\n\n今天我们来练习「${currentProblem.title}」这道题目。请先仔细阅读左侧的题目描述，然后用你自己的话复述一下题目的要求。`
                    }]);
                }
            } else {
                // Fallback to demo mode
                setConversation([{
                    role: 'coach',
                    content: `你好！我是你的算法面试教练 👋\n\n（演示模式 - 后端未连接）\n\n今天我们来练习「${currentProblem.title}」这道题目。请先仔细阅读左侧的题目描述，然后用你自己的话复述一下题目的要求。`
                }]);
            }
        };
        
        initSession();
    }, [currentProblem.id]);
    
    const handleSelectProblem = async (problem) => {
        setCurrentProblem(problem);
        setCode(problem.starterCode);
        setCurrentStage(0);
        setTimer(0);
        setShowProblemSelector(false);
        
        if (isConnected) {
            try {
                const result = await api.startSession(problem.id);
                setSessionId(result.session_id);
                setConversation([{ role: 'coach', content: result.message || `让我们来练习「${problem.title}」！请先描述一下你对题目的理解。` }]);
            } catch (error) {
                setConversation([{
                    role: 'coach',
                    content: `让我们来练习「${problem.title}」这道题！👋\n\n请先仔细阅读左侧的题目描述，然后用你自己的话复述一下题目的要求。`
                }]);
            }
        } else {
            setConversation([{
                role: 'coach',
                content: `让我们来练习「${problem.title}」这道题！👋\n\n（演示模式）\n\n请先仔细阅读左侧的题目描述，然后用你自己的话复述一下题目的要求。`
            }]);
        }
    };
    
    const handleSendMessage = async (message) => {
        setConversation(prev => [...prev, { role: 'user', content: message }]);
        setIsTyping(true);
        
        if (isConnected && sessionId) {
            try {
                const result = await api.sendMessage(sessionId, message, code);
                setIsTyping(false);
                setConversation(prev => [...prev, { role: 'coach', content: result.message }]);
                if (result.stage !== undefined) {
                    setCurrentStage(result.stage);
                }
            } catch (error) {
                setIsTyping(false);
                setConversation(prev => [...prev, { 
                    role: 'error', 
                    content: '抱歉，发生了错误。请稍后重试。' 
                }]);
            }
        } else {
            // Demo mode response
            setTimeout(() => {
                setIsTyping(false);
                let response = "";
                let nextStage = currentStage;
                
                if (currentStage === 0) {
                    response = `很好！你理解得很到位 ✨\n\n现在让我们进入下一个阶段。请先不要急着写代码，先用语言描述一下你打算如何解决这个问题。\n\n🤔 你能想到最直观的解法是什么？`;
                    nextStage = 1;
                } else if (currentStage === 1) {
                    response = `不错的思路！👍\n\n让我问你一个问题：这个解法的时间复杂度是多少？有没有办法优化？\n\n💡 提示：想想有什么数据结构可以帮助我们。`;
                    nextStage = 2;
                } else if (currentStage === 2) {
                    response = `很好的分析！🎯\n\n现在你可以开始写代码了。记住：\n• 边写边解释你的思路\n• 注意边界条件的处理\n• 完成后我们会一起检查`;
                    nextStage = 3;
                } else {
                    response = `好的，让我看看你的思路... 🔍\n\n你的方向是对的！继续加油！`;
                }
                
                setConversation(prev => [...prev, { role: 'coach', content: response }]);
                setCurrentStage(nextStage);
            }, 1500);
        }
    };
    
    const handleRequestHint = async () => {
        setIsTyping(true);
        
        if (isConnected && sessionId) {
            try {
                const result = await api.getHint(sessionId);
                setIsTyping(false);
                setConversation(prev => [...prev, { role: 'coach', content: result.hint || result.message }]);
            } catch (error) {
                setIsTyping(false);
                setConversation(prev => [...prev, { 
                    role: 'error', 
                    content: '获取提示失败，请稍后重试。' 
                }]);
            }
        } else {
            setTimeout(() => {
                setIsTyping(false);
                setConversation(prev => [...prev, { 
                    role: 'coach', 
                    content: '💡 提示：想想这道题的核心在于什么？有没有什么数据结构可以帮助我们更高效地解决问题？' 
                }]);
            }, 1000);
        }
    };
    
    const handleRun = async () => {
        setIsRunning(true);
        
        if (isConnected && sessionId) {
            try {
                const result = await api.runCode(sessionId, code);
                setIsRunning(false);
                setConversation(prev => [...prev, { 
                    role: 'coach', 
                    content: result.output || '代码运行完成！' 
                }]);
            } catch (error) {
                setIsRunning(false);
                setConversation(prev => [...prev, { 
                    role: 'error', 
                    content: '代码运行失败，请检查语法。' 
                }]);
            }
        } else {
            setTimeout(() => {
                setIsRunning(false);
                alert('演示模式：运行代码功能需要连接后端');
            }, 500);
        }
    };
    
    const handleSubmit = async () => {
        setIsSubmitting(true);
        setIsTyping(true);
        
        if (isConnected && sessionId) {
            try {
                const result = await api.submitCode(sessionId, code);
                setIsSubmitting(false);
                setIsTyping(false);
                setConversation(prev => [...prev, { role: 'coach', content: result.feedback || result.message }]);
                if (result.stage !== undefined) {
                    setCurrentStage(result.stage);
                }
            } catch (error) {
                setIsSubmitting(false);
                setIsTyping(false);
                setConversation(prev => [...prev, { 
                    role: 'error', 
                    content: '提交失败，请稍后重试。' 
                }]);
            }
        } else {
            setTimeout(() => {
                setIsSubmitting(false);
                setIsTyping(false);
                setConversation(prev => [...prev, {
                    role: 'coach',
                    content: `我看到你提交了代码，让我来看看... 🔍\n\n（演示模式）\n\n代码整体结构不错！实际使用时，我会详细分析你的代码逻辑和边界情况处理。`
                }]);
                setCurrentStage(4);
            }, 2000);
        }
    };
    
    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <ProblemSelectorModal
                isOpen={showProblemSelector}
                onClose={() => setShowProblemSelector(false)}
                problems={problemLibrary}
                currentProblemId={currentProblem.id}
                onSelectProblem={handleSelectProblem}
            />
            
            <header className="header" style={{ padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <h1 style={{ fontSize: '20px', fontWeight: 700 }}>🎯 算法面试教练</h1>
                    <span style={{ 
                        fontSize: '11px', 
                        padding: '4px 10px', 
                        background: 'rgba(255,255,255,0.2)', 
                        borderRadius: '20px',
                        fontWeight: 500
                    }}>
                        {isConnected ? 'Online' : 'Demo'}
                    </span>
                    <button 
                        onClick={() => setShowProblemSelector(true)}
                        style={{
                            padding: '6px 14px',
                            background: 'rgba(255,255,255,0.15)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '20px',
                            color: 'white',
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        📚 题库 ({problemLibrary.length})
                    </button>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', opacity: 0.9 }}>
                        <Icons.Clock />
                        <span>练习时间: {formatTime(timer)}</span>
                    </div>
                    <div style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '50%', 
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600
                    }}>
                        K
                    </div>
                </div>
            </header>
            
            <main style={{ flex: 1, display: 'flex', padding: '20px', gap: '20px', overflow: 'hidden' }}>
                <div className="card" style={{ width: '28%', minWidth: '320px', overflow: 'hidden' }}>
                    <ProblemPanel 
                        problem={currentProblem} 
                        onChangeProblem={() => setShowProblemSelector(true)}
                    />
                </div>
                
                <div className="card" style={{ flex: 1, overflow: 'hidden' }}>
                    <CodeEditor 
                        code={code} 
                        setCode={setCode}
                        onRun={handleRun}
                        onSubmit={handleSubmit}
                        isRunning={isRunning}
                        isSubmitting={isSubmitting}
                    />
                </div>
                
                <div className="card" style={{ width: '30%', minWidth: '360px', overflow: 'hidden' }}>
                    <ChatPanel 
                        conversation={conversation}
                        currentStage={currentStage}
                        onSendMessage={handleSendMessage}
                        onRequestHint={handleRequestHint}
                        isTyping={isTyping}
                        onChangeProblem={() => setShowProblemSelector(true)}
                        isConnected={isConnected}
                    />
                </div>
            </main>
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));

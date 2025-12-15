// Problem Library - can be loaded from backend API later
const problemLibrary = [
    {
        id: 1,
        title: "两数之和",
        titleEn: "Two Sum",
        difficulty: "easy",
        tags: ["数组", "哈希表"],
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        description: `给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。

你可以假设每种输入只会对应一个答案，并且你不能使用两次相同的元素。

你可以按任意顺序返回答案。`,
        examples: [
            {
                input: "nums = [2,7,11,15], target = 9",
                output: "[0,1]",
                explanation: "因为 nums[0] + nums[1] == 9 ，返回 [0, 1]。"
            },
            {
                input: "nums = [3,2,4], target = 6",
                output: "[1,2]",
                explanation: ""
            },
            {
                input: "nums = [3,3], target = 6",
                output: "[0,1]",
                explanation: ""
            }
        ],
        constraints: [
            "2 <= nums.length <= 10⁴",
            "-10⁹ <= nums[i] <= 10⁹",
            "-10⁹ <= target <= 10⁹",
            "只会存在一个有效答案"
        ],
        starterCode: `def twoSum(nums, target):
    # 在这里实现你的解法
    pass`
    },
    {
        id: 2,
        title: "有效的括号",
        titleEn: "Valid Parentheses",
        difficulty: "easy",
        tags: ["栈", "字符串"],
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        description: `给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串 s ，判断字符串是否有效。

有效字符串需满足：
1. 左括号必须用相同类型的右括号闭合。
2. 左括号必须以正确的顺序闭合。
3. 每个右括号都有一个对应的相同类型的左括号。`,
        examples: [
            { input: 's = "()"', output: "true", explanation: "" },
            { input: 's = "()[]{}"', output: "true", explanation: "" },
            { input: 's = "(]"', output: "false", explanation: "" }
        ],
        constraints: [
            "1 <= s.length <= 10⁴",
            "s 仅由括号 '()[]{}' 组成"
        ],
        starterCode: `def isValid(s):
    # 在这里实现你的解法
    pass`
    },
    {
        id: 3,
        title: "最大子数组和",
        titleEn: "Maximum Subarray",
        difficulty: "medium",
        tags: ["数组", "动态规划", "分治"],
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        description: `给你一个整数数组 nums ，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。

子数组是数组中的一个连续部分。`,
        examples: [
            { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "连续子数组 [4,-1,2,1] 的和最大，为 6。" },
            { input: "nums = [1]", output: "1", explanation: "" },
            { input: "nums = [5,4,-1,7,8]", output: "23", explanation: "" }
        ],
        constraints: [
            "1 <= nums.length <= 10⁵",
            "-10⁴ <= nums[i] <= 10⁴"
        ],
        starterCode: `def maxSubArray(nums):
    # 在这里实现你的解法
    pass`
    },
    {
        id: 4,
        title: "爬楼梯",
        titleEn: "Climbing Stairs",
        difficulty: "easy",
        tags: ["动态规划", "记忆化搜索"],
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        description: `假设你正在爬楼梯。需要 n 阶你才能到达楼顶。

每次你可以爬 1 或 2 个台阶。你有多少种不同的方法可以爬到楼顶呢？`,
        examples: [
            { input: "n = 2", output: "2", explanation: "有两种方法可以爬到楼顶：1. 1 阶 + 1 阶  2. 2 阶" },
            { input: "n = 3", output: "3", explanation: "有三种方法可以爬到楼顶：1. 1+1+1  2. 1+2  3. 2+1" }
        ],
        constraints: ["1 <= n <= 45"],
        starterCode: `def climbStairs(n):
    # 在这里实现你的解法
    pass`
    },
    {
        id: 5,
        title: "无重复字符的最长子串",
        titleEn: "Longest Substring Without Repeating Characters",
        difficulty: "medium",
        tags: ["哈希表", "字符串", "滑动窗口"],
        timeComplexity: "O(n)",
        spaceComplexity: "O(min(n,m))",
        description: `给定一个字符串 s ，请你找出其中不含有重复字符的最长子串的长度。`,
        examples: [
            { input: 's = "abcabcbb"', output: "3", explanation: '因为无重复字符的最长子串是 "abc"，所以其长度为 3。' },
            { input: 's = "bbbbb"', output: "1", explanation: '因为无重复字符的最长子串是 "b"，所以其长度为 1。' },
            { input: 's = "pwwkew"', output: "3", explanation: '因为无重复字符的最长子串是 "wke"，所以其长度为 3。' }
        ],
        constraints: [
            "0 <= s.length <= 5 * 10⁴",
            "s 由英文字母、数字、符号和空格组成"
        ],
        starterCode: `def lengthOfLongestSubstring(s):
    # 在这里实现你的解法
    pass`
    },
    {
        id: 6,
        title: "反转链表",
        titleEn: "Reverse Linked List",
        difficulty: "easy",
        tags: ["链表", "递归"],
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        description: `给你单链表的头节点 head ，请你反转链表，并返回反转后的链表。`,
        examples: [
            { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]", explanation: "" },
            { input: "head = [1,2]", output: "[2,1]", explanation: "" },
            { input: "head = []", output: "[]", explanation: "" }
        ],
        constraints: [
            "链表中节点的数目范围是 [0, 5000]",
            "-5000 <= Node.val <= 5000"
        ],
        starterCode: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

def reverseList(head):
    # 在这里实现你的解法
    pass`
    },
    {
        id: 7,
        title: "三数之和",
        titleEn: "3Sum",
        difficulty: "medium",
        tags: ["数组", "双指针", "排序"],
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        description: `给你一个整数数组 nums ，判断是否存在三元组 [nums[i], nums[j], nums[k]] 满足 i != j、i != k 且 j != k ，同时还满足 nums[i] + nums[j] + nums[k] == 0 。请你返回所有和为 0 且不重复的三元组。

注意：答案中不可以包含重复的三元组。`,
        examples: [
            { input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]", explanation: "不同的三元组是 [-1,0,1] 和 [-1,-1,2]。" },
            { input: "nums = [0,1,1]", output: "[]", explanation: "唯一可能的三元组和不为 0。" },
            { input: "nums = [0,0,0]", output: "[[0,0,0]]", explanation: "唯一可能的三元组和为 0。" }
        ],
        constraints: [
            "3 <= nums.length <= 3000",
            "-10⁵ <= nums[i] <= 10⁵"
        ],
        starterCode: `def threeSum(nums):
    # 在这里实现你的解法
    pass`
    },
    {
        id: 8,
        title: "LRU 缓存",
        titleEn: "LRU Cache",
        difficulty: "hard",
        tags: ["设计", "哈希表", "链表", "双向链表"],
        timeComplexity: "O(1)",
        spaceComplexity: "O(capacity)",
        description: `请你设计并实现一个满足 LRU (最近最少使用) 缓存约束的数据结构。

实现 LRUCache 类：
• LRUCache(int capacity) 以正整数作为容量 capacity 初始化 LRU 缓存
• int get(int key) 如果关键字 key 存在于缓存中，则返回关键字的值，否则返回 -1
• void put(int key, int value) 如果关键字 key 已经存在，则变更其数据值 value；如果不存在，则向缓存中插入该组 key-value。

函数 get 和 put 必须以 O(1) 的平均时间复杂度运行。`,
        examples: [
            { input: '["LRUCache", "put", "put", "get", "put", "get"]\\n[[2], [1, 1], [2, 2], [1], [3, 3], [2]]', output: "[null, null, null, 1, null, -1]", explanation: "缓存容量为2，依次执行操作后的结果。" }
        ],
        constraints: [
            "1 <= capacity <= 3000",
            "0 <= key <= 10⁴",
            "0 <= value <= 10⁵"
        ],
        starterCode: `class LRUCache:
    def __init__(self, capacity: int):
        # 初始化缓存
        pass

    def get(self, key: int) -> int:
        # 获取缓存值
        pass

    def put(self, key: int, value: int) -> None:
        # 设置缓存值
        pass`
    }
];

// Interview stages
const stages = [
    { id: 0, name: "题意确认", icon: "📋" },
    { id: 1, name: "思路口述", icon: "💭" },
    { id: 2, name: "复杂度分析", icon: "📊" },
    { id: 3, name: "代码实现", icon: "💻" },
    { id: 4, name: "边界检查", icon: "🔍" },
    { id: 5, name: "Follow-up", icon: "🚀" },
    { id: 6, name: "总结回顾", icon: "📝" }
];

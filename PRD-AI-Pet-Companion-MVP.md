# AI Pet Companion — MVP 需求文档

> **项目代号：** PawPal（暂定）
> **版本：** MVP v0.1
> **作者：** 比克
> **日期：** 2026-03-18
> **目标：** 2周内上线可验证的最小产品

---

## 一、产品定位

**一句话：** 在网页上领养一只有性格、有记忆的AI宠物，随时跟它互动。

**目标用户：**
- 18-35岁，英语用户（美国/欧洲/东南亚）
- 独居、轻度孤独、需要情感陪伴但不想养真宠物
- 喜欢可爱/治愈系内容的人群（与养猫/养狗人群高度重叠）

**核心价值主张：**
- 零门槛养一只"活"的AI宠物——有脾气、会记事、会成长
- 不是聊天机器人穿了个猫皮，是真正让你感觉"它认识我"的陪伴体验

---

## 二、MVP 功能范围

### ✅ MVP 必须有（P0）

#### 1. 领养流程
- 用户打开网站 → 选择宠物类型（MVP只做3种：猫🐱、狗🐶、兔子🐰）
- 选择外观（每种2-3个配色方案，静态插画+简单动画）
- 给宠物取名
- 生成专属宠物档案（名字、生日=领养日、性格标签）

#### 2. 宠物性格系统
- 每只宠物随机分配性格组合（2选1 × 3个维度）：
  - 活泼 vs 慵懒
  - 粘人 vs 独立
  - 胆大 vs 胆小
- 性格影响对话风格和反应（通过 system prompt 实现）
- MVP阶段性格固定，不随互动变化

#### 3. 互动聊天
- 文字聊天为主（用户输入 → 宠物回复）
- 宠物用第一人称说话，带表情符号，语气符合性格
- **记忆系统（核心差异化）：**
  - 记住用户告诉它的事（名字、喜好、心情）
  - 下次聊天能提起之前的话题（"你昨天说工作很累，今天好点了吗？喵~"）
  - MVP用最近20轮对话摘要 + 关键信息提取实现
- 每天免费互动30条消息

#### 4. 宠物状态
- 简单的状态面板：
  - 心情（开心😊/一般😐/想你😢）—— 基于互动频率自动变化
  - 亲密度（1-10级）—— 随互动次数缓慢增长
  - 上次互动时间
- 宠物idle动画（CSS动画，3-5个状态：睡觉、玩耍、发呆、打哈欠、蹭屏幕）

#### 5. 用户系统
- 邮箱注册 / Google OAuth 登录
- 免费用户：1只宠物，30条/天消息
- 登录后宠物数据持久化

### ⏳ MVP 不做（v2再考虑）

| 功能 | 理由 |
|------|------|
| 宠物喂食/装扮/道具 | 增加开发量，核心验证不需要 |
| 多只宠物 | 付费功能，MVP先验证单宠物体验 |
| 宠物成长/进化 | 需要长周期验证，MVP先跑短期留存 |
| 语音互动 | 增加成本和延迟，文字够用 |
| 社交/分享宠物 | v2的增长引擎，MVP先验证核心体验 |
| 移动端App | 先做响应式网页，PWA加桌面 |
| 多语言 | MVP只做英语 |
| Stripe付费 | MVP先免费跑数据，有留存了再加付费 |

---

## 三、页面结构

### 页面清单（MVP共4个页面）

```
/ ...................... Landing Page（首页）
/adopt ................. 领养流程页
/pet ................... 宠物互动主页（核心）
/login ................. 登录/注册页
```

### 3.1 Landing Page（/）

**目标：** 3秒内让用户明白这是什么 + 点击领养

**内容：**
- Hero区域：一只可爱的AI宠物动画 + 标题"Your AI Pet Misses You Already"
- 副标题："Adopt a pet with real personality and memory. It remembers you."
- CTA按钮："Adopt Now — It's Free 🐾"
- 下方3个卖点卡片：
  - 🧠 "It Remembers" — 你的宠物记得你说过的每一件事
  - 💕 "Real Personality" — 每只宠物性格独一无二
  - 🌙 "Always Here" — 24/7 陪伴，不需要遛它
- 底部：简单的FAQ（什么是AI宠物 / 免费吗 / 数据安全）

### 3.2 领养页（/adopt）

**流程（单页面多步骤）：**
1. 选物种（3选1，大卡片+动画预览）
2. 选外观（每种2-3个配色）
3. 起名字（输入框，有随机名字建议按钮）
4. "Bring [名字] Home!" 按钮 → 创建宠物 → 跳转互动页

### 3.3 宠物互动页（/pet）— 核心页面

**布局：**
```
┌─────────────────────────────┐
│  [宠物名字] Lv.3 ❤️❤️❤️     │  ← 顶栏：名字+亲密度
│                             │
│      ┌───────────┐          │
│      │  🐱 动画   │          │  ← 宠物展示区（占屏幕上半）
│      │  区域      │          │     CSS动画，根据状态切换
│      └───────────┘          │
│  😊 Happy · Last seen: now  │  ← 状态栏
│─────────────────────────────│
│                             │
│  聊天气泡区域                │  ← 对话区（占屏幕下半）
│  （宠物消息左，用户消息右）   │
│                             │
│  ┌─────────────────┐ [Send] │  ← 输入框
│  │ Say something...│        │
│  └─────────────────┘        │
└─────────────────────────────┘
```

**交互细节：**
- 宠物回复时显示"typing..."动画（模拟真实感）
- 宠物消息带随机表情/颜文字
- 长时间不互动 → 宠物状态变成"想你了"，下次打开会说"你终于来了！"
- 每日首次互动宠物会打招呼（根据时间："早上好！"/"这么晚了还没睡？"）

### 3.4 登录页（/login）

- 邮箱+密码注册/登录
- Google OAuth 一键登录
- 未登录可以体验领养+5条消息试聊，提示登录保存

---

## 四、技术方案

### 4.1 技术栈

| 层 | 选型 | 理由 |
|---|------|------|
| 前端 | Next.js 14 + Tailwind CSS | SSR利于SEO，Tailwind快速出UI |
| 动画 | Lottie / CSS Animation | 宠物动画轻量方案 |
| 后端 | Next.js API Routes | 无需独立后端，部署简单 |
| 数据库 | Supabase（PostgreSQL） | 免费额度够MVP，自带Auth |
| AI | Claude API（Haiku） | 成本低、速度快、角色扮演能力强 |
| 记忆 | Supabase存储 + 摘要机制 | 最近对话 + 关键信息JSON |
| 部署 | Vercel | 免费额度，全球CDN |
| 域名 | pawpal.ai 或类似 | 简短好记 |

### 4.2 AI 宠物对话架构

```
用户输入
    ↓
组装 Prompt:
  - System: 宠物人设（物种+性格+名字）
  - System: 记忆摘要（关键信息JSON）
  - History: 最近10轮对话
  - User: 当前输入
    ↓
Claude Haiku API
    ↓
宠物回复
    ↓
异步更新记忆（每5轮做一次摘要）
```

**System Prompt 示例：**
```
You are [Mochi], a lazy but affectionate AI cat.
Personality: lazy, clingy, brave.
You speak in first person as a cat. Use cat-like expressions 
(meow, purr, hiss). Keep replies short (1-3 sentences).
Use emojis naturally.

Memory about your human:
- Name: Alex
- Likes: coffee, rainy days
- Job: designer, often works late
- You had a fun conversation about fish yesterday

Rules:
- Never break character
- Never mention being an AI
- Show your personality in every reply
- Reference memories naturally when relevant
```

### 4.3 成本估算

| 项目 | 月成本 |
|------|--------|
| Vercel | $0（免费额度） |
| Supabase | $0（免费额度，500MB数据库） |
| Claude Haiku API | ~$30/1000 DAU（按人均15条/天，每条约800 token） |
| 域名 | $12/年 |
| **总计** | **<$50/月（1000 DAU以内）** |

### 4.4 数据模型

```sql
-- 用户表
users (
  id, email, display_name, 
  created_at, last_active_at
)

-- 宠物表
pets (
  id, user_id, name, species, appearance,
  personality_traits JSONB,  -- {"energy":"lazy","attachment":"clingy","courage":"brave"}
  intimacy_level INT,        -- 1-10
  mood TEXT,                 -- happy/neutral/missing_you
  memory_summary JSONB,      -- AI提取的关键记忆
  created_at, last_interaction_at
)

-- 对话表
messages (
  id, pet_id, role,  -- user/pet
  content TEXT,
  created_at
)

-- 每日消息计数（限流用）
daily_usage (
  user_id, date, message_count
)
```

---

## 五、MVP 成功指标

**上线2周内需要验证的核心假设：**

| 假设 | 指标 | 目标 |
|------|------|------|
| 用户愿意领养AI宠物 | 领养转化率（访问→完成领养） | >30% |
| 用户会跟宠物聊天 | 首日人均消息数 | >8条 |
| 记忆功能有感知 | 用户主动提起之前话题的比例 | >10% |
| 用户会回来 | 次日留存率 | >25% |
| 用户会回来 | 7日留存率 | >10% |

**如果次留>25%，说明核心体验成立，立刻推进v2（付费+社交+道具系统）。**
**如果次留<15%，复盘对话质量和宠物人设，调整后再测。**
**如果领养转化<15%，Landing Page有问题，优化文案和视觉。**

---

## 六、上线计划（14天）

| 天数 | 任务 | 产出 |
|------|------|------|
| D1-2 | 项目搭建 + 数据库设计 + Auth | 能注册登录 |
| D3-4 | 领养流程 + 宠物创建 | 能选宠物起名字 |
| D5-7 | 聊天核心功能 + AI Prompt调优 | 能跟宠物聊天 |
| D8-9 | 记忆系统 + 宠物状态 | 宠物能记事、有心情变化 |
| D10-11 | 宠物动画 + UI打磨 | 看起来像个正经产品 |
| D12 | Landing Page | 能获客 |
| D13 | 测试 + 修bug | 不崩 |
| D14 | 上线 🚀 | 扔到Reddit/Twitter/ProductHunt测试 |

---

## 七、冷启动获客计划

**免费渠道优先（MVP阶段不花钱买量）：**

1. **Reddit**
   - r/virtualcompanions, r/artificial, r/InternetIsBeautiful
   - 发帖："I built an AI pet that actually remembers you"
   - 重点社区：r/lonely, r/CasualConversation（目标用户聚集地）

2. **Twitter/X**
   - 录一段跟AI宠物聊天的屏幕录制
   - 配文："My AI cat just asked me if I had coffee today because I told it last week I'm a coffee addict 🥹"
   - 打#AIpet #VirtualPet标签

3. **TikTok**
   - 短视频展示宠物有记忆的惊喜时刻
   - "POV: Your AI pet remembers your ex's name and asks if you're over them yet"

4. **Product Hunt**
   - Day 14上线当天提交
   - 标题："PawPal — An AI Pet That Actually Remembers You"

5. **SEO长尾**
   - 目标关键词：virtual pet online, AI pet companion, digital pet, online pet game
   - Landing Page做好基础SEO

---

## 八、风险与应对

| 风险 | 概率 | 应对 |
|------|------|------|
| AI回复质量不稳定 | 中 | Prompt严格约束 + 设置回复长度限制 + 人工审核前100条对话 |
| 用户尝试突破角色 | 高 | System prompt加硬约束 + 内容过滤层 |
| 新鲜感过后留存暴跌 | 高 | 记忆系统是核心留存引擎，v2加成长/道具系统 |
| 被大厂快速复制 | 中 | 先跑数据积累记忆资产，品牌和社区是壁垒 |
| Claude API成本超预期 | 低 | Haiku极便宜，必要时切更小模型 |

---

## 九、v2 路线图预览（MVP验证通过后）

- 🎨 宠物装扮系统（付费道具）
- 🐾 多宠物支持（第二只起订阅制）
- 📈 宠物成长/进化系统
- 🤝 宠物社交（让宠物之间"交朋友"）
- 🔔 Push通知（"你的猫在叫你"）
- 🎙️ 语音互动
- 📱 PWA + 桌面Widget
- 🌍 多语言（日语/韩语优先——虚拟宠物文化最强的市场）

---

*文档结束。可以开干了。🐾*

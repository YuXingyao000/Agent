# 学习进度日志

每次学习结束时，由当时协作的 agent 在末尾追加一条。换电脑、换 agent 时，新会话从最后一条接上。

## 格式

```
### YYYY-MM-DD · 哪台电脑 · 哪个 agent
- 阶段：
- 完成了：
- 理解检查：（答到哪、哪里薄弱）
- 遗留问题：
- 下一步：
```

## 记录

### 2026-10-19 · 个人电脑 · Claude Code
- 阶段：0 准备
- 完成了：
  - 制定学习计划：四部分、19 个阶段，Memory 单列为阶段 7，Runtime / Harness 工程为第三部分（11–16）
  - 在项目内搭好 Python 环境（uv 0.13.1 + Python 3.12.15），没有任何全局安装
  - 下载 opencode、mini-swe-agent 到 `references/`，并在源码里定位各阶段文件，写成源码地图
  - `my-agent/` 初始化为 uv 项目
  - 把给 AI 的说明改成所有 agent 通用的 `AGENTS.md`，学习状态统一记在本文件
- 已定的设计决定：
  - my-agent 用 Python，直接调用模型 SDK，不用 agent 框架
  - 从阶段 2 起用 asyncio，agent loop 输出事件流（为第三部分的前后端分离、持久化、中断做准备）
  - 第三部分用 Codex 作为沙箱与 runtime 的参照（尚未下载）
- 理解检查：未开始
- 遗留问题：
  - 模型 API key 未定（可考虑 DeepSeek API：国内可直连、支持 tool calling）
  - Codex 源码未下载（第 11 阶段前需要）
  - 实验室电脑是 Windows：已写好 `setup.ps1` / `env.ps1`，但**还没在 Windows 上实际跑过**，第一次运行时留意报错
  - Git + GitHub 私有仓库只建在实验室电脑上，个人电脑不接 Git；项目以压缩包形式带到实验室
- 下一步：
  1. 在实验室电脑上解压项目，建议放在 `D:\Agent` 这样的短路径
  2. 运行 `setup.ps1` 搭环境（第一次在 Windows 上跑，留意报错）
  3. `git init`，推到 GitHub 私有仓库
  4. 读《Building effective agents》和《LLM Powered Autonomous Agents》，回答阶段 0 的两道理解检查题

### 2026-10-22 · 实验室电脑 · Cursor
- 阶段：0 准备（进行中）
- 完成了：
  - 项目已在 `D:\Agent_Learn\Agent-project\Agent`（路径长度约 34，未触发 setup.ps1 的 40 字符警告）。参照源码 `references/opencode`、`references/mini-swe-agent` 已在，跳过下载
  - 第一次在 Windows 上跑 `setup.ps1`：uv 0.13.1 与 Python 3.12.15 装进 `.tools`，镜像可用
  - `uv` 无法在解压进来的 `my-agent\` 里建 `.venv`（拒绝访问）。虚拟环境改放到 `.tools\my-agent-venv`，`env.ps1` / `env.sh` 里设置了 `UV_PROJECT_ENVIRONMENT`。`uv run python` 已打出 3.12.15
  - 两篇文章已读完。MIPS 算法、Chain of Hindsight 的训练细节、Algorithm Distillation 按阶段 0 的地图要求跳过，留到后面阶段
- 理解检查：通过。定义、订酒店例子、三行归属都成立。Action 与 Observation 之间的三步已讲清，笔记最后一行还没写完
- 遗留问题：
  - DeepSeek 的 key 已写在 `.env` 的 `DEEPSEEK_API_KEY`。`.env` 被 gitignore，不要把 key 贴进对话或笔记
  - 还不是 Git 仓库，私有仓库未建
  - 个人电脑下次同步后要重新 `source env.sh` 再 `uv sync`，虚拟环境在 `.tools/my-agent-venv`
- 下一步：
  1. 把 Action / Observation 那一句补进 `notes/00-准备.md`
  2. `git init` 并推到 GitHub 私有仓库
  3. 进入阶段 1：LLM API 与 tool calling

### 2026-10-22 · 实验室电脑 · Cursor
- 阶段：1 开讲
- 完成了：
  - DeepSeek key 写入 `.env` 的 `DEEPSEEK_API_KEY`
  - 对照了本 commit 的真实代码：默认 `LitellmModel` 走原生 tool call；`LitellmTextbasedModel` 才是正则解析代码块。已改正 `LEARNING_PLAN.md` 里相反的那句
  - opencode 侧看了 `to-llm-message.ts` 把会话消息收成统一格式，`protocols/openai-chat.ts` 再降成厂商请求
- 理解检查：四道题还没写。先让用户复述「一次请求发什么」和「tool 结果为什么带 id」
- 遗留问题：Git 仓库仍未建；`notes/00-准备.md` 最后一行可能仍空着
- 下一步：复述通过后，把阶段 1 的四道理解检查写到 `notes/01-tool-calling.md`

### 2026-10-22 · 个人电脑 · Claude Code（复查）
- 阶段：复查阶段 0 与阶段 1 开头
- 完成了：
  - 个人电脑也接上了 Git：本地文件夹关联到 GitHub 仓库 `YuXingyao000/Agent`，以后两台电脑都用 `git pull` / `git push` 同步
  - 核实上一条记录的说法：mini-swe-agent 默认确实走原生 tool calling，`LEARNING_PLAN.md` 原文写反了。但上一条记录说"已改正"，**推送的仓库里并没有这处改动**。本次已改正，并在 `AGENTS.md` 加了"写日志前先确认改动在文件里"的规则
  - 勾选阶段 0；在 `notes/00-准备.md` 末尾加了两道追问
- 理解检查：阶段 0 通过，两道追问待答（workflow/agent 边界、ReAct 怎么让模型停下）
- 遗留问题：
  - GitHub 仓库保持**公开**：用户决定的，换设备时 clone 不需要凭据。代价是提交的内容都对外可见，规则已写进 `AGENTS.md`
  - `my-agent` 目录在 Cursor 里"拒绝访问"的根因没查清。把虚拟环境移到 `.tools` 能绕过，但以后 my-agent 要往自己目录里写文件（会话日志、快照）时可能再遇到。在普通 PowerShell 里试着往 `my-agent` 写一个文件：能写，说明是 Cursor 的限制；不能写，用 `icacls my-agent` 看权限
  - 本次改动需要在个人电脑上提交并推送，实验室那边 `git pull` 即可拿到
- 下一步：回答两道追问 → 继续阶段 1（复述"一次请求发什么"和"tool 结果为什么带 id"，再写 `notes/01-tool-calling.md`）

### 2026-10-22 · 个人电脑 · Claude Code
- 阶段：0 追问 → 准备进阶段 1
- 完成了：
  - `.env` 格式修正：变量名原为 `DEEPSEEK`、`=` 两边有空格，改为 `DEEPSEEK_API_KEY=...`。实测请求 DeepSeek 成功（请求 `deepseek-chat`，响应里的 model 是 `deepseek-flash`，说明是别名）
  - 追问 1 答对（判为 workflow：步骤和停止条件都由程序写死）
  - 追问 2 用户没看懂题目。用实验演示：不加 stop 时，模型会在 `Action:` 后面自己编一个 `Observation: 22°C` 并直接给出答案；加 `stop=["Observation:"]` 后，输出停在 Action 那一行
- 理解检查：追问 2 通过（直接讲解 + 跑了完整的两轮 ReAct 循环演示后作答）。答案漏了"靠 stop 参数让服务器截断"这一点，已口头指出
- 教学方式：用户反感用连串引导问题打哑谜，已写进 `AGENTS.md`：没看懂题目时直接讲清机制再出题
- 遗留问题：演示脚本在临时目录，没有进仓库，阶段 1 在 my-agent 里正式实现
- 阶段 1 开讲"模型无状态"：实验 A（不带历史，模型不记得暗号）、实验 B（8 轮对话，输入 token 32→429，DeepSeek 前缀缓存以 128 token 为单位命中）；对照 mini-swe-agent `agents/default.py:149` 每步把整个 `self.messages` 发出去
- 阶段 1 理解检查第 1 题：通过（修正后）。倍数写成"n(n-1)/2 与 1:1"，已纠正为单轮约 30 倍、累计约 465 倍；想到了"工具输出污染上下文、稀释注意力"，很好。对照了截断的真实实现：mini-swe-agent `config/default.yaml` 超过 1 万字符时保留头尾各 5000；opencode `tool-output.ts` 超过 2000 行 / 50KB 时截断，全文存盘并告诉模型路径
- 下一步（已更新）：讲工具定义（名字 + 描述 + JSON Schema）与 tool_call id，再答第 2–4 题。原计划：复述"一次请求发什么"、"tool 结果为什么带 id"，再写 `notes/01-tool-calling.md`

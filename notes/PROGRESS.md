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

### 2026-11-02 ~ 11-03 · 实验室电脑 · Claude Code
- 阶段：1（进行中）
- 完成了：
  - 讲了工具定义、tool_call id、三家厂商格式的对照。做了三个实验：带上一个小工具后，prompt 从 11 token 涨到 309 token；结果倒序回传，模型照样答对（靠 id 配对，跟顺序无关）；漏传一个 tool 结果，服务器直接返回 400
  - 调整了教学方式（已写进 `AGENTS.md`）：讲新主题先从场景和历史讲起；核心代码由用户手写，AI 把作业拆成小步；练习代码不要求防御性编程
  - 查清了"拒绝访问"的根因：某个 agent 沙箱（疑似 Cursor 里装的 Codex 扩展）给项目根目录打了 Low 完整性标记，`.tools` 里的 uv.exe / python.exe 继承了这个标记，运行时也降为 Low 级别，所以写不了 `my-agent`。修复方法：用 `icacls . /setintegritylevel "(OI)(CI)M"` 把根目录改回 Medium，再删掉 `.tools` 重新运行 `setup.ps1`。只改根目录的话，已有的子目录不会跟着变
  - Cursor 里原来没装 Python 扩展。新增 `.vscode/settings.json`：新终端自动激活环境，编辑器使用项目里的 TypeScript，并指定 Python 解释器
  - **主语言改为 TypeScript + Node 24**。原因是用户的目标是做出给别人用的工具，opencode 也是 TS。Node v24.22.1 装在 `.tools/node`（`setup.ps1` 第 3 步，从 npmmirror 下载并校验 sha256）。根目录新增 `package.json` 和 `tsconfig.json`（TypeScript 6.0.3、@types/node 24.19.2），Node 直接运行 .ts，`npm run check` 做类型检查。`my-agent` 里的 Python uv 项目已经 `git rm`。`LEARNING_PLAN.md`、`AGENTS.md`、`env.ps1`、`env.sh` 都已同步更新
  - `practice/01-tool-calling/`：`README.md` 写了 5 步路线和 TS 版的作业 1；`step1_chat.py` 是 Python 版的第 1 小步（load_env），已经 review 过
  - TS 速成：`practice/00-ts-bootcamp/bootcamp.ts`，共 13 节，用 C++ / Python 类比。目录里另外几个文件（`async_deep.ts`、`async_flow.ts`、`interface_vs_type.ts`、`primitives_layout.js`、`var_let_bytecode.js`），是用户在另一个会话里做 bootcamp 问答时留下的
- 理解检查：第 2–4 题推迟到练习第 4 步写完之后再答
- 遗留问题：
  - **Mac 上还没装 Node**，那边没有 setup.sh。下次在 Mac 上，先从 npmmirror 下载 `node-v24.22.1-darwin-arm64.tar.gz`（地址是 `https://registry.npmmirror.com/-/binary/node/v24.22.1/`），校验 sha256 后解压到 `.tools/node`（`env.sh` 已经把 `.tools/node/bin` 加进了 PATH），然后在根目录执行 `npm ci`
  - `.tools/my-agent-venv` 已经用不上了，可以删掉
  - 如果在这个项目里用 Codex，它的沙箱可能会再次打上 Low 标记
- 下一步：先补 TS 基础（bootcamp），再做作业 1 的 TS 版。后来的进展见下面两条

### 2026-11-03 · 实验室电脑 · Claude Code
- 阶段：TS 基础补课（阶段 1 作业 1 之前），对照 bootcamp 逐个答疑
- 完成了：
  - var / let：作用域、TDZ、循环里的闭包。对照 V8 字节码：TDZ 是 `the_hole` 哨兵加 `ThrowReferenceErrorIfHole`，for-let 每轮 `CreateBlockContext`
  - 变量存储：C++ / Python / JS 三者对比（类型跟着变量走 vs 跟着值走）。V8 实测：Node 没开指针压缩，Smi 是 32 位；小数是 HeapNumber；true/false/null/undefined 是只读区单例；字面量字符串驻留；拼接得到 ConsString
  - 箭头函数；interface vs type（结构类型、多余字段检查 TS2353/TS2561、声明合并）；条件类型与 infer（对照 `lib.es5.d.ts` 的 `ReturnType`、opencode `packages/schema/src/tool.ts:46` 判断 any 的写法）；TS 泛型没有 SFINAE；字面量联合代替 enum（`erasableSyntaxOnly` 下 enum 报 TS1294）
  - 异步：同步阻塞 / 多线程 / 事件循环三种模型，Node 网络走 epoll/kqueue/IOCP、文件走 libuv 线程池；async 函数字节码里的 `SuspendGenerator` / `ResumeGenerator`；协程与线程对比；跨 await 的读-改-写会互相覆盖
  - `practice/00-ts-bootcamp/` 新增演示：`var_let_bytecode.js`、`primitives_layout.js`、`interface_vs_type.ts`、`async_deep.ts`、`async_flow.ts`。`npm run check` 通过
  - 追问补充：Promise 是内置泛型类（作类型用时 `Promise<T>` 必须给出 T；`new Promise` 不写 T 会推断成 unknown）；JS 用 new 创建的对象一律在堆上，更像 `make_shared`；async 不会创建线程（`async_deep.ts` 第 6 节，threadId 全是 0）；不用自己管线程，要管的是并发、取消（AbortController，对照 opencode `aisdk.ts:136`）和子进程的生命周期（`shell.ts:383`）；await 只能写在 async 函数里或模块顶层，Promise 可以传到别处再 await，async 会向上传染（`async_flow.ts`）
  - 更正：`res.json()` 的类型是 `Promise<unknown>`，不是 any，已改 `interface_vs_type.ts` 的注释
- 理解检查：待答（建议写进 `notes/00-ts-基础.md`）
  - Python 里 `a = 1; b = a; a += 1` 之后 b 是几，`l = [1]; m = l; l += [2]` 之后 m 是什么，为什么不一样
  - 不写 `implements Tool` 的 class 能否传给 `runAll`；把 `run` 的参数改成 number 呢
  - 异步 1：`async_deep.ts` 第 2 节把忙等从 500 ms 改成 50 ms，定时器实际等多少 ms？为什么
  - 异步 2：agent 的 shell 工具如果用同步的 `execSync`，一条命令跑 30 秒，这期间流式输出、用户按 Ctrl+C、模型要求的另一个并行工具调用分别会怎样？换成异步的 `spawn` 呢
  - 异步 3：要给 10 万段文本各算一遍哈希（纯 CPU 计算），改成 async/await 能变快吗？应该用什么
- 遗留问题：上一条记录里的 Mac 装 Node 一事仍未处理
- 下一步：答完上面的题，回到作业 1 的 TS 版（第 1 小步读 key，第 2 小步用 fetch 发请求）

### 2026-11-03（bootcamp 问答之后）· 实验室电脑 · Claude Code
- 阶段：1（作业 1 第 2 小步）
- 完成了：
  - 讲了 fetch 与 HTTP：fetch 的选项和原始请求文本怎么对应；报文结构（起始行、头部、空行、正文）；标准头和自定义头（Anthropic 用 `x-api-key`，DeepSeek 用 `Authorization: Bearer`）；请求体的格式由 API 规定，不由 HTTP 规定；fetch 为什么要 await 两次（第一次等状态码和响应头，第二次等正文）。演示脚本有两个：`practice/01-tool-calling/demo_raw_http.ts` 用 TLS socket 手写 HTTP，能看到 chunked 编码；`demo_await_timing.ts` 实测普通请求：响应头 216ms 就到了，正文等了 35 秒才到
  - DeepSeek 现在可用的模型只有 `deepseek-flash`（V4.1-Flash）和 `deepseek-v4-pro`，是用 `GET /models` 查到的。`deepseek-chat` 是旧名字，服务器会转到 `deepseek-flash`。README 和演示脚本里的模型名都已改成 `deepseek-flash`。11-03 下午 DeepSeek 一直返回 503（服务繁忙），正好可以拿来说明：fetch 遇到 5xx 不会抛异常；503 值得重试，401 不值得
  - **作业 1 完成**（`step1_chat.ts`）。用户的 `ChatResponse` interface 是对照 JSON 自己推导出来的；`res.ok` 检查和 `throw` 都写了（还留着两处小问题没改：失败时用的是 `res.json()` 而不是 `res.text()`；第 4 行还有多余的 `: string` 和 `!`）。观察到的现象：
    - 问天气时模型老实拒绝了，但思考过程里以为"当前日期 2026-05-07"，而响应的 `created` 时间戳是 2026-11-03。这正好说明了要注入环境信息
    - 三种模型名下的 `prompt_tokens` 分别是：`deepseek-chat` 11，flash 35，pro 88。`deepseek-chat` 的响应里没有 `reasoning_content`，看起来对应的是 flash 的非思考模式
    - 实验 2：设 `max_tokens: 5` 后，5 个 token 全被思考用掉了，`content` 为空，`finish_reason` 是 `length`。说明 `max_tokens` 同时包含思考和回答
    - 实验 3：返回 401 `Authentication Fails`，key 被遮住只露出最后几位，还带了 `request_id`
  - README 里已经写好作业 2（多轮对话），要求、坑和三个实验都在里面
- 理解检查：上一条记录里 bootcamp 问答留下的 5 道题还没答（写进 `notes/00-ts-基础.md`）。阶段 1 的第 2–4 题推迟到练习第 4 步写完之后再答
- 遗留问题：
  - 用户想补网络基础知识（TLS 等），以后找合适的机会讲，比如阶段 14 讲沙箱断网时
  - Cursor 的 Python 扩展还记着旧的虚拟环境，终端提示符前会出现 `(my-agent)`。重新选一次解释器，或者删掉 `.tools/my-agent-venv` 就好
  - Mac 上还没装 Node，步骤见 "2026-11-02 ~ 11-03" 那条记录
  - **用户的最终目标**：用户在另一个仓库里参与一个陪伴型 role play agent 项目（rp engine），已经做过架构讨论，来这里是为了系统补 agent 基础。已经和用户梳理了陪伴 agent 和 coding agent 侧重点的不同：陪伴 agent 重在记忆、主动性、人设一致性。约定已写进 `AGENTS.md`：主线不动，每个阶段之后加一个"对 rp engine 意味着什么"的讨论，rp engine 的内部设计不写进本仓库。用户的回答：rp engine 是一个人做，以后会开源；"更像真人"的需求已经在别处详细讨论过，这里不用再问；学习顺序是先让 agent 工作起来，再考虑像人。架构上用户在想怎么给记忆加上"遗忘"（人是有限的，不能让 LLM 什么都懂）。已经提醒用户，这里面混着两个问题：记忆的遗忘（自己的数据，可控）和知识的边界（在模型参数里，删不掉）。**到阶段 7 时要展开讲**，可以对照 Generative Agents 的 recency 打分、MemoryBank 的遗忘曲线、Character-LLM 的保护性经历
- 下一步：
  1. 作业 2：多轮对话（`step2_chat.ts`，说明见 `practice/01-tool-calling/README.md`）
  2. 有空时答 bootcamp 的 5 道题

# 阶段 1 练习：从聊天机器人到 tool calling

用代码把 tool calling 的历史走一遍。每一步都自己手写，写完交给 AI review，然后再进入下一步。

| 步骤 | 对应的历史 | 你要写出什么 |
|---|---|---|
| 1 | 2023 年初，只有纯聊天的 API | 一次 HTTP 调用，看清请求和响应 |
| 2 | 同上 | 多轮对话 REPL，自己维护 messages 列表 |
| 3 | 2022.10–2023 上半年：ReAct、AutoGPT | 靠 prompt + 正则，让模型"调用"一个工具 |
| 4 | 2023.06–2023.11：function calling → tools、并行调用、id | 改用原生 `tools` 参数 |
| 5 | 阶段 1 验收 | 整理进 `my-agent/`：多轮 CLI + 工具 + token 统计 + provider 抽象 |

第 4 步写完以后，回答 `LEARNING_PLAN.md` 里阶段 1 的理解检查第 2–4 题。

`step1_chat.py` 是 2026-11-03 改用 TypeScript 之前写的 Python 版第 1 小步，留作记录。

**运行与检查**（在项目根目录，终端已激活环境）：

- 运行：`node practice/01-tool-calling/step1_chat.ts`。Node 直接运行 TS，只把类型注解擦掉，**不检查类型**。
- 类型检查：`npm run check`。写错类型时，运行照样能跑，只有这一步会报出来。

---

## 作业 1：一个不会查天气的聊天机器人

**场景**：2023 年 3 月，ChatGPT 的 API 刚开放，你想做一个聊天机器人。先把最朴素的一次调用写出来，问一个它不可能答对的问题。

**文件**：`practice/01-tool-calling/step1_chat.ts`

一次 API 调用就是一次 HTTP 请求：

```
你的程序                                  DeepSeek 服务器
   │  POST https://api.deepseek.com/chat/completions
   │  请求头：Authorization: Bearer <key>
   │          Content-Type: application/json
   │  请求体：{"model": "deepseek-flash", "messages": [{"role": "user", "content": "..."}]}
   │ ─────────────────────────────────────────────>
   │ <─────────────────────────────────────────────
   │  状态码 + 响应头先到，响应体随后流过来（JSON：choices、usage）
```

### 第 1 小步：拿到 key

| 需要的东西 | 写法 | 对应 Python |
|---|---|---|
| 当前文件所在的目录 | `import.meta.dirname` | `Path(__file__).parent`，也就是 `parents[0]` |
| 拼路径 | `path.join(目录, "..", "..", ".env")`，需要 `import path from "node:path"` | `/` 运算符 |
| 读 `.env` | `process.loadEnvFile(路径)`，Node 内置，解析后的值放进 `process.env` | 你手写的 `load_env` |
| 取值 | `process.env.DEEPSEEK_API_KEY` | `env_dict["DEEPSEEK_API_KEY"]` |

- `import.meta.dirname` 已经是文件所在的目录了，所以往上两级就是项目根目录。
- `node:` 前缀表示这是 Node 内置模块，不是 npm 包。
- `process.env.DEEPSEEK_API_KEY` 的类型是 `string | undefined`。写一行 `if (!key) throw new Error(...)` 之后，TS 就知道后面的 `key` 一定是 `string`。这叫**类型收窄**（narrowing）：TS 会跟着 `if`、`throw` 推断类型，C++ 里没有对应的东西。
- **验收**：打印 `key 已读取，长度 XX`。永远不要打印 key 本身。

### 第 2 小步：发请求、读响应

`fetch(url, 选项)` 返回 `Promise<Response>`，要 `await`。文件顶层可以直接写 `await`。

| 选项 | 值 |
|---|---|
| `method` | `"POST"`，不写的话默认是 GET |
| `headers` | 对象：`Authorization`、`Content-Type` 两项 |
| `body` | `JSON.stringify(请求体对象)` |
| `signal` | `AbortSignal.timeout(60_000)`：60 秒超时 |

读响应：

- `res.status`、`res.ok`：状态码，以及它是否在 200–299 之间。
- `await res.text()` 或 `await res.json()`：读出响应体。**响应体只能读一次**，两个都调用会报错。
- 为什么要 await 两次：第一次 `await fetch(...)` 等到的是状态码和响应头，响应体还在路上；第二次 await 才是把响应体读完。后面做流式输出时，就是利用响应体"边到边读"这一点。

**容易踩的坑**

- **fetch 遇到 4xx / 5xx 不会抛异常**，只有网络断了才会抛。必须自己检查 `res.ok`：失败时打印 `await res.text()`（错误原因写在里面），然后 `throw`。
- `body` 传字符串时，fetch 默认把 `Content-Type` 设成 `text/plain`。必须自己写上 `application/json`。Python 的 httpx 用 `json=` 时会自动设置，fetch 不会。
- `res.json()` 的类型是 `Promise<unknown>`，不能直接访问 `.choices`。可以定义一个只包含你用到的字段的 `interface`，然后写 `as ChatResponse`。注意，`as` 只是告诉编译器"相信我"，**运行时不做任何检查**，因为 TS 的类型在运行时已经被擦掉了。
- 打印整个响应：`JSON.stringify(data, null, 2)`，中文会正常显示。

**要打印的内容**：完整的响应 JSON；单独打印回答文本（`choices[0].message.content`）、`finish_reason` 和 `usage`。

**写完再做三个小实验**，把看到的结果告诉 AI：

1. 把模型名换成旧名字 `deepseek-chat`，响应里的 `model` 字段是什么？（可用的模型列表：`GET https://api.deepseek.com/models`，截至 2026-11 只有 `deepseek-flash` 和 `deepseek-v4-pro`）
2. 请求体里加上 `max_tokens: 5`，`finish_reason` 变成什么？回答变成什么样？
3. 在代码里临时把 key 改错（比如末尾拼一个字符，不要动 `.env`），看状态码和返回体。

---

## 作业 2：一个会"记得"的聊天机器人（多轮对话）

**场景**：还记得阶段 1 开头那个实验吗？不把历史一起发过去，模型就记不住暗号。这一步你要亲手实现"记忆"：每一轮都把整段对话重新发一遍。

**文件**：`practice/01-tool-calling/step2_chat.ts`，可以从 `step1_chat.ts` 复制一份开始改。

**要求**

1. 在终端里循环读取用户输入，输入 `exit` 时退出。每一轮打印模型的回答，以及这一轮的 `prompt_tokens`、`completion_tokens`、`prompt_cache_hit_tokens`。
2. 用一个 `messages` 数组保存整段对话。每一轮先把用户消息放进去，发请求，再把模型的回答放进去。
3. 把"发一次请求"抽成一个函数：`async function chat(messages: Message[]): Promise<ChatResponse>`。失败时 `throw`，不要 `process.exit`。
4. 定义一个 `Message` 类型，请求和响应共用。`role` 用字面量联合类型：`"system" | "user" | "assistant"`。

**API 细节**

- 读取终端输入：`import readline from "node:readline/promises"`，然后
  `const rl = readline.createInterface({ input: process.stdin, output: process.stdout })`，
  `const line = await rl.question("你：")`，最后记得 `rl.close()`。
- 往数组末尾追加元素：`messages.push(...)`，相当于 Python 的 `append`。

**容易踩的坑**

- **把模型的回答放回历史时，放哪些字段？** 响应里的 `message` 带着 `reasoning_content`。先只放 `role` 和 `content`。做完后可以试一试把 `reasoning_content` 也放回去，看看服务器会怎么反应。
- **请求失败了怎么办？** 如果先把用户消息放进了 `messages`，请求却失败了（比如 503），历史里就留下一条没有回答的用户消息，下一轮会出现两条用户消息挨在一起。可以在失败时把它移除（`messages.pop()`），也可以等请求成功后再一起放进去。这是阶段 12、13 要讲的"会话一致性"的一个小预告。
- 不要设太小的 `max_tokens`（作业 1 的实验 2 已经看到了后果）。

**做完再做三个小实验**

1. 聊 5 轮以上，观察 `prompt_tokens` 每一轮怎么增长，`prompt_cache_hit_tokens` 什么时候开始不为 0。
2. 第 1 轮告诉它你的名字，第 3 轮问它"我叫什么"。然后把"把模型的回答放回历史"那一行注释掉，重新聊一次，看看会出现什么奇怪的现象。
3. 在 `messages` 的最前面加一条 `role: "system"` 的消息，写上当前的日期和时间（用 `new Date().toLocaleString("zh-CN")`），然后问它"今天几号？"。和作业 1 里它以为的 5 月 7 日对比一下。

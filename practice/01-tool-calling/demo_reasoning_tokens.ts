// 演示（AI 写的，不是作业）：发回去的 reasoning_content，到底有没有被算进输入？
// 做法：历史完全相同，只改 reasoning_content 这一个变量，比较 prompt_tokens。
// 运行：node practice/01-tool-calling/demo_reasoning_tokens.ts

import path from "node:path";

process.loadEnvFile(path.join(import.meta.dirname, "..", "..", ".env"));
const key = process.env.DEEPSEEK_API_KEY;
if (!key) throw new Error("DEEPSEEK_API_KEY is not set");

const TOOLS = [{
  type: "function",
  function: {
    name: "get_weather",
    description: "查询某个城市现在的天气。",
    parameters: { type: "object", properties: { city: { type: "string" } }, required: ["city"] },
  },
}];

const SHORT = "需要查两个城市。";
const LONG = "我需要分别查询上海和北京的天气，然后比较哪个是晴天。".repeat(20);

async function promptTokens(messages: object[], withTools = true): Promise<string> {
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "deepseek-flash", messages, tools: withTools ? TOOLS : undefined, max_tokens: 1 }),
    signal: AbortSignal.timeout(120_000),
  });
  const text = await res.text();
  if (!res.ok) return `HTTP ${res.status}：${text}`;
  return String((JSON.parse(text) as { usage: { prompt_tokens: number } }).usage.prompt_tokens);
}

// 情况一：同一轮工具调用之内（assistant 发起了 tool_calls，后面跟着工具结果）
const toolTurn = (reasoning?: string) => [
  { role: "system", content: "你是一个AI助手。" },
  { role: "user", content: "现在上海和北京，哪一个是晴天？" },
  {
    role: "assistant",
    content: null,
    reasoning_content: reasoning,
    tool_calls: [
      { id: "call_00_demo", type: "function", function: { name: "get_weather", arguments: '{"city": "上海"}' } },
      { id: "call_01_demo", type: "function", function: { name: "get_weather", arguments: '{"city": "北京"}' } },
    ],
  },
  { role: "tool", tool_call_id: "call_00_demo", content: "上海现在多云" },
  { role: "tool", tool_call_id: "call_01_demo", content: "北京现在晴天" },
];

// 情况二：跨越用户轮次（上一轮的普通回答，后面是用户的新问题）
const crossTurn = (reasoning?: string) => [
  { role: "system", content: "你是一个AI助手。" },
  { role: "user", content: "你好" },
  { role: "assistant", content: "你好！有什么可以帮你？", reasoning_content: reasoning },
  { role: "user", content: "北京天气怎么样？" },
];

const cases = [
  ["同一轮工具调用之内（请求带 tools）", toolTurn, true],
  ["跨越用户轮次（请求带 tools）", crossTurn, true],
  ["跨越用户轮次（请求不带 tools，和作业 2 一样）", crossTurn, false],
] as const;

for (const [name, build, withTools] of cases) {
  console.log(`\n== ${name} ==`);
  console.log("  不带 reasoning_content：", await promptTokens(build(), withTools));
  console.log("  带短的 reasoning_content：", await promptTokens(build(SHORT), withTools));
  console.log("  带长的 reasoning_content：", await promptTokens(build(LONG), withTools));
}

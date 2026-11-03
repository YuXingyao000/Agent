// 演示（AI 写的，不是作业）：fetch 的两次 await 各自在等什么。
// 运行：node practice/01-tool-calling/demo_await_timing.ts

import path from "node:path";

process.loadEnvFile(path.join(import.meta.dirname, "..", "..", ".env"));
const key = process.env.DEEPSEEK_API_KEY;
if (!key) throw new Error("DEEPSEEK_API_KEY is not set");

async function measure(stream: boolean): Promise<void> {
  const t0 = performance.now();
  const pending = fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "deepseek-flash",
      messages: [{ role: "user", content: "用三段话解释 TCP 三次握手" }],
      max_tokens: 400,
      stream,
    }),
    signal: AbortSignal.timeout(120_000),
  });
  console.log(`\n[stream=${stream}] fetch() 刚调用完，拿到的是：`, pending);

  const res = await pending; // 第一次 await：等状态码和响应头
  const t1 = performance.now();
  const text = await res.text(); // 第二次 await：等正文全部到达
  const t2 = performance.now();

  console.log(`  状态码 ${res.status}，Content-Type: ${res.headers.get("content-type")}`);
  console.log(`  第一次 await（状态码 + 响应头）：${(t1 - t0).toFixed(0)} ms`);
  console.log(`  第二次 await（正文）          ：${(t2 - t1).toFixed(0)} ms，共 ${text.length} 个字符`);
  if (!res.ok) console.log("  出错了，服务器说：", text); // fetch 不会因为 4xx/5xx 抛异常，要自己看
}

await measure(false);
await measure(true);

// 一轮 agent 的骨架：有先后依赖的，用 await 排好顺序；互不依赖的，一起等。
// 运行：node practice/00-ts-bootcamp/async_flow.ts
// 每行开头的数字是从程序启动算起的毫秒数。

const t0 = performance.now();
const log = (msg: string) => console.log(`${String(Math.round(performance.now() - t0)).padStart(5)} ms  ${msg}`);
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

interface ToolCall {
  id: string;
  name: string;
}

// 最底层：假装请求模型。真实代码里这里是 await fetch(...) 和 await res.json()
async function callLLM(prompt: string): Promise<ToolCall[]> {
  log(`callLLM：发出请求「${prompt}」`);
  await sleep(500);
  log("callLLM：回复到了");
  return [
    { id: "call_0", name: "read_file" },
    { id: "call_1", name: "run_shell" },
  ];
}

async function runTool(call: ToolCall): Promise<string> {
  log(`runTool：开始 ${call.name}`);
  await sleep(300);
  log(`runTool：${call.name} 完成`);
  return `${call.id} 的结果`;
}

// 中间层：await 另一个 async 函数的结果
async function runTurn(prompt: string): Promise<string[]> {
  const calls = await callLLM(prompt); // 有依赖：拿到回复才知道要调哪些工具
  log(`runTurn：解析出 ${calls.length} 个工具调用`);
  return await Promise.all(calls.map(runTool)); // 两个工具互不依赖，一起跑
}

// Promise 是一个普通的值：可以先拿着，过一会儿、在别的地方再 await
const pending = runTurn("帮我看看项目结构");
log("顶层：runTurn 已经发出，先去干别的（比如显示一个转圈动画）");
const results = await pending; // 文件顶层可以直接写 await
log(`顶层：拿到结果 ${JSON.stringify(results)}`);

// 普通函数里不能写 await。它只能把 Promise 原样交出去，由调用方 await
function startTurn(prompt: string): Promise<string[]> {
  // const r = await runTurn(prompt); // ← 取消注释，tsc 报 TS1308
  return runTurn(prompt);
}
const again = await startTurn("再来一轮");
log(`顶层：普通函数交出来的 Promise，在这里 await，拿到 ${again.length} 个结果`);

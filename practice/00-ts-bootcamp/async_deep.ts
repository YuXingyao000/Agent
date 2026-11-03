// 异步进阶：事件循环到底在干什么。bootcamp 第 11、12 节讲用法，这里讲机制。
// 运行：node practice/00-ts-bootcamp/async_deep.ts
// 每行开头的数字是从程序启动算起的毫秒数，对照着看执行顺序。

import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { threadId } from "node:worker_threads";

const t0 = performance.now();
const log = (msg: string) => console.log(`${String(Math.round(performance.now() - t0)).padStart(5)} ms  ${msg}`);
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const section = (title: string) => console.log(`\n===== ${title} =====`);

// ─────────────────────────────────────────────
section("1. 调用 async 函数会立刻返回，await 之后的代码要等一等");
async function ask(): Promise<string> {
  log("ask：发出请求，然后 await");
  await sleep(300); // 假装在等网络
  log("ask：响应到了，从 await 那一行接着往下执行");
  return "响应内容";
}
const p = ask();
log(`主流程：ask() 已经返回，拿到的是 ${String(p)}`);
log("主流程：趁它在等，我先干别的");
log(`主流程：现在才去等它 → ${await p}`);

// ─────────────────────────────────────────────
section("2. 只有一个线程：一段同步的重计算会把所有回调都卡住");
const s2 = performance.now();
setTimeout(() => log(`定时器：计划 100 ms 后执行，实际等了 ${Math.round(performance.now() - s2)} ms`), 100);
const end = performance.now() + 500;
while (performance.now() < end) {} // 忙等 500 ms，模拟一段 CPU 密集的计算
log("忙等结束，线程这才空出来");
await sleep(10);

// ─────────────────────────────────────────────
section("3. 四种等待同时进行：定时器、读文件、两个子进程");
// 定时器由事件循环自己计时；读文件交给 libuv 线程池里的线程；
// 子进程是操作系统里另外两个进程，和 agent 并行跑 shell 命令是一回事
const run = promisify(execFile);
const child = (ms: number) => run(process.execPath, ["-e", `setTimeout(() => {}, ${ms})`]);
const s3 = performance.now();
await Promise.all([sleep(800), readFile(import.meta.filename, "utf8"), child(800), child(800)]);
log(`四件事一起等，耗时 ${Math.round(performance.now() - s3)} ms（一件件等要 2400 ms 以上）`);

// ─────────────────────────────────────────────
section("4. 协程在 await 处轮流执行");
async function worker(name: string) {
  for (let i = 0; i < 3; i++) {
    log(`${name} 第 ${i} 步`);
    await sleep(100);
  }
}
await Promise.all([worker("甲"), worker("乙")]);

// ─────────────────────────────────────────────
section("5. 两个 await 之间不会被打断，但跨过 await 的读-改-写会互相覆盖");
let counter = 0;
async function incAcrossAwait() {
  const v = counter; // 读
  await sleep(0); // 在这里让出，别的协程会插进来
  counter = v + 1; // 写：用的是让出之前读到的旧值
}
await Promise.all([incAcrossAwait(), incAcrossAwait(), incAcrossAwait()]);
log(`跨 await 自增三次：counter = ${counter}`);
counter = 0;
async function incNoAwaitBetween() {
  await sleep(0);
  counter += 1; // 读和写之间没有 await，不会被打断
}
await Promise.all([incNoAwaitBetween(), incNoAwaitBetween(), incNoAwaitBetween()]);
log(`读写之间没有 await：counter = ${counter}`);

// ─────────────────────────────────────────────
section("6. async 不会创建线程：函数体在第一个 await 之前是同步执行的");
function helper() {
  log(`helper：async 函数里调用的普通函数，线程 ${threadId}`);
}
async function heavy() {
  log(`heavy：开始，线程 ${threadId}`);
  helper();
  const until = performance.now() + 300;
  while (performance.now() < until) {} // 标了 async 也照样占着主线程
  log("heavy：忙等结束");
  await null;
  log(`heavy：await 之后，线程 ${threadId}`);
}
const h = heavy();
log("主流程：heavy() 这才返回，前面 300 ms 主流程一直在等它");
await h;

// ─────────────────────────────────────────────
// 7. 没人 await、也没人 catch 的失败不会被悄悄吞掉：Node 会打印错误并以退出码 1 结束进程
// Promise.reject(new Error("没人处理的失败")); // ← 取消注释试试

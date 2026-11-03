// TypeScript 速成：写给熟悉 C++ / Python 的人，只讲写 agent 会用到的部分。
// 运行：node practice/00-ts-bootcamp/bootcamp.ts
// 类型检查：npm run check
// 最快的学法：改改数字、故意写错类型，然后分别运行和检查，对比两者的输出。

import path from "node:path"; // 模块导入。"node:" 前缀表示 Node 内置模块，第三方包直接写包名

function section(title: string): void {
  console.log(`\n===== ${title} =====`);
}

// ─────────────────────────────────────────────
section("1. 变量与基本类型");
// const：变量不能重新赋值。但如果它指向一个对象，对象的内容仍然可以改，类似 C++ 的 T* const。
// let：可以重新赋值。不要用 var，它的作用域规则很怪。
const model: string = "deepseek-chat";
let count = 3; // 类型推断为 number，可以不写类型注解，类似 C++ 的 auto
count += 1;
// number 只有一种：64 位浮点数，相当于 C++ 的 double，没有 int。2^53 以内的整数都是精确的。
console.log(7 / 2, Math.floor(7 / 2)); // 3.5 3（这一点和 Python 3 一样，和 C++ 不一样）
// 模板字符串：反引号加 ${}，相当于 Python 的 f-string
console.log(`${model} 被调用了 ${count} 次`);
// 比较一律用 ===。== 会做隐式类型转换，比如 0 == "" 的结果是 true（TS 能拦下一部分，但别依赖它）
// 写成 "a" !== "b" 这种两个字面量的比较，类型检查会报错：结果永远一样，TS 认为你多半写错了
console.log(count === 4, model !== "gpt-4");

// ─────────────────────────────────────────────
section("2. 数组与对象");
const nums: number[] = [3, 1, 2];
nums.push(4); // 相当于 Python 的 append。数组声明成 const，内容照样能改
console.log(nums.length, nums.map((n) => n * 2), nums.filter((n) => n > 1));
// 对象字面量：看起来像 Python 的 dict，但字段是固定的，而且有类型
const msg = { role: "user", content: "你好" };
console.log(msg.role, msg["content"]);
// 对象和数组都是引用：赋值只复制引用（和 Python 一样，和 C++ 的值语义不一样）
const alias = msg;
alias.content = "改了";
console.log(msg.content); // 输出"改了"
// 展开运算符 ...：浅拷贝，或者合并多个对象
const copy = { ...msg, content: "副本" };
console.log(msg.content, copy.content);
// 解构：类似 Python 的 a, b = ...。对象按字段名取，数组按位置取
const { role, content } = copy;
const [first, ...rest] = nums;
console.log(role, content, first, rest);
// 遍历数组用 for...of，取到的是值。for...in 遍历的是键（下标字符串），不要用在数组上
for (const n of nums) process.stdout.write(`${n} `);
console.log();

// ─────────────────────────────────────────────
section("3. 类型：interface、type、联合类型");
// interface 描述一个对象的"形状"。? 表示可选字段
interface Message {
  role: "system" | "user" | "assistant"; // 字面量联合类型：只能是这三个字符串之一，用来代替 enum
  content: string;
  name?: string;
}
type Role = Message["role"]; // type 可以给任何类型起别名，这里取出 Message 里 role 字段的类型
const m1: Message = { role: "user", content: "hi" };
// const bad: Message = { role: "admin", content: "hi" }; // ← 取消注释，再执行 npm run check
// 结构类型：只看形状，不看类型名。C++ 是看类名的（名义类型）
const looksLikeMessage = { role: "assistant" as const, content: "ok", extra: 1 };
const m3: Message = looksLikeMessage; // 可以：多出来的字段不影响赋值（直接写字面量时，多字段才会报错）
const r: Role = m3.role;
console.log(m1.content, r);

// ─────────────────────────────────────────────
section("4. null / undefined 与真假值");
// 有两种"空"：undefined 表示没赋值、字段不存在；null 表示显式置空。Python 只有一个 None
function findUser(id: number): { name: string; email?: string } | undefined {
  return id === 1 ? { name: "Alice" } : undefined;
}
const u = findUser(1);
console.log(u?.name); // ?. 可选链：u 为空时，整个表达式的结果就是 undefined，不会崩
console.log(u?.email ?? "(无邮箱)"); // ?? 空值合并：左边是 null 或 undefined 时，取右边的值
// 真假值的坑：0、""、NaN、null、undefined、false 是假，但 [] 和 {} 是真（Python 里空列表是假）
console.log(Boolean([]), Boolean(""), Boolean(0)); // true false false
// 所以判断数组是否为空，要写 arr.length === 0

// ─────────────────────────────────────────────
section("5. 函数");
function add(a: number, b: number = 10): number { // 参数可以有默认值
  return a + b;
}
const mul = (a: number, b: number): number => a * b; // 箭头函数：类似 Python 的 lambda，但可以写多行
const sum = (...xs: number[]) => xs.reduce((acc, x) => acc + x, 0); // 剩余参数，类似 Python 的 *args
// 函数是一等公民。函数类型写成 (参数) => 返回值，类似 C++ 的 std::function<double(double, double)>
const apply = (f: (a: number, b: number) => number, a: number, b: number) => f(a, b);
console.log(add(1), mul(2, 3), sum(1, 2, 3), apply(mul, 4, 5));

// ─────────────────────────────────────────────
section("6. 可辨识联合 + 类型收窄（agent 事件流的核心写法）");
// 每种事件都有一个共同的 type 字段，取值各不相同。TS 能根据 type 的值，推断出其余字段
type AgentEvent =
  | { type: "text"; delta: string }
  | { type: "tool_call"; id: string; name: string; args: unknown }
  | { type: "turn_end"; reason: "stop" | "max_steps" };

function render(e: AgentEvent): string {
  switch (e.type) {
    case "text":
      return e.delta; // 走到这里，TS 知道 e 一定有 delta 字段
    case "tool_call":
      return `[调用 ${e.name} #${e.id}]`; // 走到这里，TS 知道 e 有 name 和 id
    case "turn_end":
      return `[结束：${e.reason}]`;
    default: {
      // 穷尽检查：以后给 AgentEvent 新加一种事件却忘了处理，这一行会在类型检查时报错
      const unreachable: never = e;
      return unreachable;
    }
  }
}
const events: AgentEvent[] = [
  { type: "text", delta: "我来查一下" },
  { type: "tool_call", id: "call_0", name: "get_weather", args: { city: "北京" } },
  { type: "turn_end", reason: "stop" },
];
console.log(events.map(render).join(" "));

// ─────────────────────────────────────────────
section("7. 泛型");
// 类似 C++ 模板，但只在编译期存在，不会像 C++ 那样为每个类型实例化出一份代码
function firstOr<T>(arr: T[], fallback: T): T {
  return arr.length > 0 ? arr[0] : fallback;
}
console.log(firstOr([1, 2], 0), firstOr<string>([], "空"));
// 常用的内置泛型类型
const usage: Record<string, number> = { prompt_tokens: 11, completion_tokens: 5 }; // 类似 dict[str, int]
const seen = new Map<string, number>([["call_0", 1]]);
console.log(usage, seen.get("call_0"));

// ─────────────────────────────────────────────
section("8. unknown、as 与运行时检查");
// 从外部来的数据（JSON、模型输出）应该当作 unknown：先检查才能用。
// any 等于关掉类型检查，尽量不要用
const raw: unknown = JSON.parse('{"city": "北京", "days": 3}');
// as 是告诉编译器"相信我"。运行时什么都不检查，因为类型在运行时已经被擦掉了
const trusted = raw as { city: string; days: number };
console.log(trusted.city);
// 真要确认数据的形状，就在运行时检查。返回类型写成 x is T 的函数叫"类型守卫"，检查通过后 TS 会收窄类型
function isWeatherArgs(x: unknown): x is { city: string } {
  return typeof x === "object" && x !== null && "city" in x && typeof x.city === "string";
}
if (isWeatherArgs(raw)) console.log("参数合法：", raw.city);
// 运行时的 typeof 只能区分 JS 的几种基本类型
console.log(typeof raw, typeof [], typeof null); // object object object。typeof null 是 "object"，历史遗留问题

// ─────────────────────────────────────────────
section("9. 类");
class TokenCounter {
  readonly model: string;
  #total = 0; // # 开头的是真正的私有字段，运行时也访问不到
  constructor(model: string) {
    this.model = model; // 必须写 this.，不能像 C++ 那样省略
  }
  add(n: number): this {
    this.#total += n;
    return this;
  }
  get total(): number { // getter，类似 Python 的 @property
    return this.#total;
  }
}
const tc = new TokenCounter("deepseek-chat").add(309).add(108);
console.log(tc.model, tc.total);

// ─────────────────────────────────────────────
section("10. 异常");
function parseArgs(json: string): unknown {
  try {
    return JSON.parse(json);
  } catch (err) {
    // catch 到的值类型是 unknown：JS 里可以 throw 任何值，不一定是 Error 对象
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`参数不是合法 JSON：${message}`);
  }
}
try {
  parseArgs("{city: 北京}");
} catch (err) {
  console.log((err as Error).message);
}

// ─────────────────────────────────────────────
section("11. 异步：Promise 与 async/await");
// Promise<T> 类似 C++ 的 std::future<T>，但 await 不会阻塞线程：
// 它只是暂停当前函数，把线程交还给事件循环，等结果到了再从这里继续执行（类似 C++20 的 co_await）
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function fakeTool(name: string, ms: number): Promise<string> {
  await sleep(ms);
  return `${name} 完成（${ms}ms）`;
}

// 顺序执行：A 完成后才启动 B，总共约 300ms
let t = Date.now();
console.log(await fakeTool("A", 100), await fakeTool("B", 200));
console.log("顺序耗时", Date.now() - t, "ms");

// 并行执行：A、B 同时启动，一起等它们完成，总共约 200ms。模型一次并行调用多个工具时，就是这样执行的
t = Date.now();
console.log(await Promise.all([fakeTool("A", 100), fakeTool("B", 200)]));
console.log("并行耗时", Date.now() - t, "ms");

// 常见的坑：忘了写 await，拿到的是 Promise 对象本身（类似 Python 里调用协程函数却忘了 await）
const forgot = fakeTool("C", 10);
console.log(forgot); // Promise { <pending> }
await forgot;

// ─────────────────────────────────────────────
section("12. 生成器与异步生成器（阶段 2 的 agent loop 就是这个形状）");
// function* 配合 yield，类似 Python 的生成器。
// async function* 可以在函数里 await，再把结果一个个 yield 出去
async function* fakeAgentRun(): AsyncGenerator<AgentEvent> {
  yield { type: "text", delta: "让我查一下天气" };
  await sleep(50);
  yield { type: "tool_call", id: "call_0", name: "get_weather", args: { city: "北京" } };
  await sleep(50);
  yield { type: "turn_end", reason: "stop" };
}
// 使用方用 for await...of：生成器产出一个，这边就处理一个
for await (const e of fakeAgentRun()) {
  console.log(render(e));
}

// ─────────────────────────────────────────────
section("13. 模块");
// 一个文件就是一个模块。导出写 export function foo() {}、export interface X {}。
// 导入本地文件时要写完整的扩展名：import { foo } from "./foo.ts"
// 只导入类型时写 import type { X } from "./x.ts"，这一整行在运行时会被擦掉
console.log("当前文件：", path.basename(import.meta.filename));

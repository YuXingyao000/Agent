// interface 和 type：都只存在于编译期，Node 运行前会被整个擦掉。
// 运行：node practice/00-ts-bootcamp/interface_vs_type.ts
// 类型检查：npm run check（带 ← 的行，取消注释后再检查，看报错）

// 1. 用 interface 规定"工具"该长什么样
interface Tool {
  name: string;
  run(args: string): string;
}

// 2. 实现方式一：直接写一个对象字面量。没有 class，没有继承
const echo: Tool = {
  name: "echo",
  run: (args) => args, // args 的类型由 Tool 推断出来，是 string
};
// const broken: Tool = { name: "broken" }; // ← 缺了 run，tsc 报错

// 3. 实现方式二：class。implements 可写可不写，写了只是让 tsc 在这一行就检查
class Upper implements Tool {
  name = "upper";
  run(args: string) {
    return args.toUpperCase();
  }
}

// 4. 这个对象从没提到 Tool，但形状对得上，就能当 Tool 用（结构类型）
const shout = { name: "shout", run: (s: string) => s + "!", extra: 42 };

function runAll(tools: Tool[], input: string): string[] {
  return tools.map((t) => `${t.name}: ${t.run(input)}`);
}
console.log(runAll([echo, new Upper(), shout], "hi"));

// 5. interface 在运行时不存在，class 存在
console.log(typeof Upper); // "function"
// console.log(Tool); // ← tsc 报 TS2693；跳过检查直接运行，Node 报 ReferenceError

// 6. type 能给任何类型起名字；interface 只能描述对象
type Role = "system" | "user" | "assistant"; // 联合类型：只能用 type
type Handler = (input: string) => string; // 函数类型
type Pair = [string, number]; // 元组
type ToolCall = { id: string; name: string }; // 对象：这时和 interface 等价
const role: Role = "user";
const h: Handler = (s) => s.trim();
const p: Pair = ["call_0", 1];
const tc: ToolCall = { id: "call_0", name: "echo" };
console.log(role, h("  x  "), p, tc);

// 7. 扩展：interface 用 extends，type 用 &，效果一样
interface ShellTool extends Tool {
  timeoutMs: number;
}
type ShellTool2 = Tool & { timeoutMs: number };
const sh: ShellTool = { name: "sh", run: (s) => s, timeoutMs: 1000 };
const sh2: ShellTool2 = sh; // 两者结构相同，可以互相赋值
console.log(sh2.timeoutMs);

// 8. 类型不检查运行时的数据。JSON.parse 返回 any，写什么类型 tsc 都信。
// res.json() 返回的是 Promise<unknown>，要先写 as 才能用，as 同样不做运行时检查
const fromApi: Tool = JSON.parse('{"name": 123}');
console.log(typeof fromApi.name, typeof fromApi.run); // number undefined

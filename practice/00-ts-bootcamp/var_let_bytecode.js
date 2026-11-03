// var / let 的区别，以及它们在 V8 里变成什么字节码。
// 故意用 .js：同样的代码写成 .ts，tsc 会在编译期就把 1、2 两段的错误拦下来（TS2448、TS2304）。
// 运行：node practice/00-ts-bootcamp/var_let_bytecode.js
// 看字节码：node --print-bytecode --print-bytecode-filter="bc_*" practice/00-ts-bootcamp/var_let_bytecode.js

// 1. 提升与 TDZ
function bc_hoist() {
  console.log("var 声明前读取:", a);
  var a = 1;
  try { console.log(b); } catch (e) { console.log("let 声明前读取:", e.constructor.name, e.message); }
  let b = 2;
}
bc_hoist();

// 2. 函数作用域 vs 块作用域
function bc_block() {
  if (true) { var x = 1; let y = 2; }
  console.log("块外 typeof x / y:", typeof x, typeof y);
}
bc_block();

// 3. 循环里的闭包
function bc_loops() {
  const fs1 = [], fs2 = [];
  for (var i = 0; i < 3; i++) fs1.push(() => i);
  for (let j = 0; j < 3; j++) fs2.push(() => j);
  console.log("var 循环:", fs1.map(f => f()), " let 循环:", fs2.map(f => f()));
}
bc_loops();

// 4. 给 --print-bytecode 看的：普通局部变量
function bc_plain() {
  let s = 1;      // 小整数
  let d = 1.5;    // 浮点数
  let o = { k: s };
  return s + d + o.k;
}
bc_plain();

// 5. 被闭包捕获的 let vs var
function bc_capLet() {
  const bc_gLet = () => b;
  let b = 2;
  return bc_gLet();
}
function bc_capVar() {
  const bc_gVar = () => b;
  var b = 2;
  return bc_gVar();
}
bc_capLet();
bc_capVar();

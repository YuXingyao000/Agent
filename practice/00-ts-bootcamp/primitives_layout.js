"use strict";
// 各种基础类型的值在 V8 里怎么存。%IsSmi / %DebugPrint 是 V8 的内部函数，要加参数才能用：
// node --allow-natives-syntax practice/00-ts-bootcamp/primitives_layout.js
// %DebugPrint 第一行的十六进制数是对象地址；# 开头的字符串是驻留（interned）的，c"..." 是拼接出来的 ConsString。

console.log("IsSmi 1 / 2**31-1 / 2**31 / -(2**31) / 1.5 / 2.0:",
  %IsSmi(1), %IsSmi(2 ** 31 - 1), %IsSmi(2 ** 31), %IsSmi(-(2 ** 31)), %IsSmi(1.5), %IsSmi(2.0));

const lit1 = "hello";
const lit2 = "hello";
const built = ["hel", "lo"].join("");
const cons = lit1 + " world, this is long";
console.log("built === lit1:", built === lit1);

for (const [name, v] of Object.entries({ t: true, f: false, u: undefined, n: null, lit1, lit2, built, cons, d: 1.5, big: 10n })) {
  process.stdout.write(name + " -> ");
  %DebugPrint(v);
}

try { lit1[0] = "j"; } catch (e) { console.log(e.constructor.name + ": " + e.message); }
console.log(lit1);

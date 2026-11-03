// 演示（AI 写的，不是作业）：不用 fetch，直接在 TLS 连接上手写一个 HTTP 请求，看看网线上到底传了什么。
// 运行：node practice/01-tool-calling/demo_raw_http.ts
// 打印时 key 会被遮住。实际开发中不要这么写，这里只是为了看清 fetch 替你做了哪些事。

import path from "node:path";
import tls from "node:tls";

process.loadEnvFile(path.join(import.meta.dirname, "..", "..", ".env"));
const key = process.env.DEEPSEEK_API_KEY;
if (!key) throw new Error("DEEPSEEK_API_KEY is not set");

const body = JSON.stringify({
  model: "deepseek-flash",
  messages: [{ role: "user", content: "用一句话介绍你自己" }],
  max_tokens: 30,
});

// HTTP/1.1 请求 = 请求行 + 若干请求头 + 一个空行 + 请求体，每行以 \r\n 结尾
const request = [
  "POST /chat/completions HTTP/1.1",
  "Host: api.deepseek.com",
  `Authorization: Bearer ${key}`,
  "Content-Type: application/json",
  // Content-Length 是【字节数】，不是字符数：一个中文字符在 UTF-8 里占 3 个字节
  `Content-Length: ${Buffer.byteLength(body)}`,
  "Connection: close", // 响应发完就断开连接，这样下面才能用 "end" 事件判断响应读完了
  "",
  body,
].join("\r\n");

console.log("========== 发出去的文本（key 已遮住）==========");
console.log(request.replace(key, key.slice(0, 3) + "****"));

// ② TCP + ③ TLS：建立加密连接。servername 告诉服务器你要访问哪个域名（SNI）
const socket = tls.connect({ host: "api.deepseek.com", port: 443, servername: "api.deepseek.com" });
socket.setEncoding("utf8");

const raw = await new Promise<string>((resolve, reject) => {
  let received = "";
  socket.on("secureConnect", () => socket.write(request)); // ④ 握手完成后，把文本写进去
  socket.on("data", (chunk: string) => (received += chunk)); // ⑤ 响应是一块一块到达的
  socket.on("end", () => resolve(received));
  socket.on("error", reject);
});

console.log("\n========== 收到的文本 ==========");
console.log(raw);

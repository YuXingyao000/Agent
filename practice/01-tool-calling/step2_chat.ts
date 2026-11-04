import path from "node:path";
import readline from "node:readline/promises";

interface Message {
    role: string;
    content: string;
    reasoning_content?: string;
}

interface ChatResponse{
    model: string;
    choices: {
        message: Message
        finish_reason: string;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
    }
}


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
process.loadEnvFile(path.join(import.meta.dirname, "..", "..", ".env"));
const key: string = process.env.DEEPSEEK_API_KEY!;

if (!key) throw new Error("DEEPSEEK_API_KEY is not set");

const messages: Message[] = new Array<Message>();
messages.push({ role: "system", content: `你是 DeepSeek 开发的 AI 助手。现在的时间是 ${new Date().toLocaleString("zh-CN")}。` });

while (true) {
    const line = await rl.question("Enter a message: ");
    if (line === "exit") break;
    messages.push({ role: "user", content: line });

    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${key}`,
        },
        body: JSON.stringify({
            model: "deepseek-flash",
            messages: messages,
        }),
        signal: AbortSignal.timeout(120_000),
    });

    if (!res.ok) {
        const error = await res.text();
        console.error(error);
        throw new Error(error);
    }

    const data = await res.json() as ChatResponse;
    messages.push(data.choices[0].message);
    console.log(data.choices[0].message.content);
    console.log(data.usage);
}

rl.close();
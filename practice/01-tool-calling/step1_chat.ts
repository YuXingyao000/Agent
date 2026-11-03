import path from "node:path";


interface ChatResponse{
    model: string;
    choices: {
        message: {
            role: string;
            content: string;
            reasoning_content?: string;
        };
        finish_reason: string;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
    }
}

process.loadEnvFile(path.join(import.meta.dirname, "..", "..", ".env"));
const key: string = process.env.DEEPSEEK_API_KEY!;

if (!key) throw new Error("DEEPSEEK_API_KEY is not set");

console.log(`deepseek key length: ${key.length}`);

const requestBody = {
    model: "deepseek-flash",
    messages: [
        { role: "user", content: "北京现在天气怎么样？" }
    ],
    max_tokens: 5,
};

const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}x`,
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(120_000),
});

if (!res.ok) {
    const error = await res.text();
    console.error(error);
    throw new Error(error);
}

const data = await res.json() as ChatResponse;
console.log(data.choices[0].message.content);
console.log(data.choices[0].finish_reason);
console.log(data.usage);
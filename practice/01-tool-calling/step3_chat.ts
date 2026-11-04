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
const SYSTEM_PROMPT = `你是 DeepSeek 开发的 AI 助手。现在的时间是 ${new Date().toLocaleString("zh-CN")}。

## 可用工具
get_weather：查询某个城市现在的天气。
- 参数：城市名，用中文，不带"市"字，例如：北京、上海
- 返回：天气描述，例如"晴天"；查不到时返回"没有这个城市的数据"

## 回复格式
每次回复只能是下面两种之一：

1. 需要调用工具时，只输出一行 Action，然后立即停止：
Action: get_weather[城市名]

2. 信息已经足够时，输出最终回答：
Final Answer: 给用户的回答

## 规则
- 一次回复最多只能有一个 Action。
- 不要自己编写 Observation。工具的执行结果会由系统以 "Observation: ..." 的形式发给你。
- 收到 Observation 后，再决定是继续调用工具，还是给出 Final Answer。
- 不需要工具的问题（比如闲聊），也用 Final Answer 回答。

## 示例
用户：上海冷吗？
你：Action: get_weather[上海]
系统：Observation: 上海现在多云
你：Final Answer: 上海现在多云。我只能查到天气状况，查不到具体气温，冷不冷还得看温度。`;

const SYSTEM_PROMPT_REACT = `你是 DeepSeek 开发的 AI 助手。现在的时间是 ${new Date().toLocaleString("zh-CN")}。

你可以使用以下工具：
get_weather[城市名]：查询某个城市现在的天气。城市名用中文，不带"市"字。

请严格按照下面的格式回答：

Question: 用户的问题
Thought: 你应该怎么做
Action: get_weather[城市名]
Observation: 工具返回的结果
...（Thought / Action / Observation 可以重复多次）
Thought: 我现在知道最终答案了
Final Answer: 给用户的回答

开始！`;

messages.push({ role: "system", content: SYSTEM_PROMPT_REACT });

const weatherTable: Record<string, string> = {
    "北京": "晴天",
    "上海": "多云",
    "广州": "小雨",
    "深圳": "晴天",
    "成都": "阴天",
    "重庆": "小雨",
    "西安": "晴天",
};

function get_weather(city: string): string {
    return weatherTable[city] ?? "没有这个城市的数据";
}

async function runTurn(messages: Message[]): Promise<string> {
    for (let step = 0; step < 5; step++) {
        const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${key}`,
            },
            body: JSON.stringify({
                model: "deepseek-flash",
                messages: messages,
                stop: ["Observation:"]
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
        console.log(`[第 ${step} 步]`, data.choices[0].message.content);
        const action = data.choices[0].message.content.match(/Action:\s*get_weather\[(.+?)\]/); 
        if (action) {
            const city = action[1];
            const weather = get_weather(city);
            messages.push({ role: "user", content: `Observation: The weather in ${city} is ${weather}.` });
            continue;
        }

        const final = data.choices[0].message.content.match(/Final Answer:\s*(.*)/s); 
        if (final) {
            return final[1];
        }

        if (step === 0 && data.choices[0].message.content.includes("get_weather(")) {
            messages.push({ role: "user", content: `格式不对。调用工具请严格写成：Action: get_weather[城市名]` });
            continue;
        }
        return `（格式不对）${data.choices[0].message.content}`
    }
    return "(达到最大步数，无法继续推理)";
}

while (true) {
    const line = await rl.question("Enter a message: ");
    if (line === "exit") break;
    messages.push({ role: "user", content: line });

    const response = await runTurn(messages);
    console.log(response);
    
}

rl.close();
import path from "node:path";
import readline from "node:readline/promises";

const TOOLS = [
    {
      type: "function",
      function: {
        name: "get_weather",
        description: "查询某个城市现在的天气。一次只能查一个城市。",
        parameters: {
          type: "object",
          properties: {
            city: { type: "string", description: "城市名，中文，不带“市”字，例如：北京" },
          },
          required: ["city"],
        },
      },
    },
  ];

interface ToolCall {
    index: number;
    id: string;
    type: string;
    function: {
        name: string;
        arguments: string;
    }
}

interface Message {
    role: "system" | "user" | "assistant" | "tool";
    content: string | null;
    tool_calls?: ToolCall[];
    tool_call_id?: string;
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
messages.push({ role: "system", content: "你是一个AI助手，请根据用户的问题，给出回答。" });

const weatherTable: Record<string, string> = {
    "北京": "晴天",
    "上海": "多云",
    "广州": "小雨",
    "深圳": "晴天",
    "成都": "阴天",
    "重庆": "小雨",
    "西安": "晴天",
};

async function get_weather(city: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // 看不懂呢，lambda函数有点太深奥了，这里resolve是有默认值吗
    return weatherTable[city] ?? "没有这个城市的数据";
}

// 单轮对话
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
                tools: TOOLS,
            }),
            signal: AbortSignal.timeout(120_000),
        });
    
        if (!res.ok) {
            const error = await res.text();
            console.error(error);
            throw new Error(error);
        }
    
        const data = await res.json() as ChatResponse;
        const reply = data.choices[0].message;
        messages.push({ role: "assistant", content: reply.content, tool_calls: reply.tool_calls });
        console.log(`[第 ${step} 步]`, JSON.stringify(reply.tool_calls ?? reply.content));
        console.log(data.usage);
        if (reply.tool_calls?.length) {
            const t0 = performance.now();
            // for (const tool_call of reply.tool_calls) {
            //     if (tool_call.type === "function" && tool_call.function.name === "get_weather") {
            //         const args = JSON.parse(tool_call.function.arguments) as { city: string };
            //         const weather = await get_weather(args.city);
            //         messages.push({ role: "tool", tool_call_id: tool_call.id, content: `Observation: The weather in ${args.city} is ${weather}.` });
            //     }
            //     else {
            //         messages.push({ role: "tool", tool_call_id: tool_call.id, content: `未知工具调用: ${tool_call.type} ${tool_call.function.name}` });
            //     }
            // }
            const toolMessages = await Promise.all(reply.tool_calls.map(async (tool_call): Promise<Message> => {
                try {
                    const args = JSON.parse(tool_call.function.arguments) as { city: string };
                    const weather = await get_weather(args.city);
                    return { role: "tool", tool_call_id: tool_call.id, content: weather };
                } catch (err) {
                    const message = err instanceof Error ? err.message : String(err);
                    return { role: "tool", tool_call_id: tool_call.id, content: `错误：${message}` };
                }
            }));
            messages.push(...toolMessages);
            console.log(`工具总耗时：${Math.round(performance.now() - t0)} ms`);
            continue;
        }
        return reply.content ?? "(模型返回了空内容)";
    }
    return "(达到最大步数，无法继续推理)";
}

// 交互式对话
while (true) {
    const line = await rl.question("Enter a message: ");
    if (line === "exit") break;
    messages.push({ role: "user", content: line });

    const response = await runTurn(messages);
    console.log(response);
    
}

rl.close();
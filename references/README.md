# 参照源码地图

| 仓库 | 版本 | 来源 |
|---|---|---|
| `mini-swe-agent/` | `04d809ceab9df28f9adaed044884180159172930`（2026-10-19 的 main） | github.com/SWE-agent/mini-swe-agent |
| `opencode/` | `815de9950b205cd734c9962c4629b07d3b83ee07`（2026-10-19 的 dev） | github.com/anomalyco/opencode（原 sst/opencode） |
| `codex/` | 尚未下载，第 11 阶段前下载 | github.com/openai/codex |

这些仓库都是**只读参考**，不要改动。它们没有 `.git`，所以没法 `git log`，要看历史就去 GitHub。

**版本是固定的**，源码地图里的路径都基于上面的 commit。在另一台电脑上要下载**同一个 commit** 的 zip，不要下最新版：

- https://github.com/SWE-agent/mini-swe-agent/archive/04d809ceab9df28f9adaed044884180159172930.zip
- https://github.com/anomalyco/opencode/archive/815de9950b205cd734c9962c4629b07d3b83ee07.zip

解压后分别改名为 `mini-swe-agent/`、`opencode/`。

## 阅读提示
- **mini-swe-agent**：普通 Python，核心循环在 `src/minisweagent/agents/default.py`（190 行），从 `run()` 开始读。下表中它的路径相对于 `src/minisweagent/`。
- **opencode**：agent 核心在 `packages/core/src/`，下表中它的路径默认相对于这里。代码用 [Effect](https://effect.website) 风格写成（`Effect.fn`、`yield*`），可以把 `yield* x` 粗略理解成 `await x`。前后端分离相关的代码在其他几个 package 里，下表会写出完整路径。

## 按阶段对照

| 阶段 | mini-swe-agent | opencode |
|---|---|---|
| 1 LLM API 与 Tool Calling | `models/litellm_model.py`、`models/utils/actions_toolcall.py` | `session/runner/to-llm-message.ts`、`session/model-request.ts`、`provider.ts`、`tool.ts`、`tool/plugin/read.ts` |
| 2 Agent Loop | `agents/default.py` 的 `run()` / `step()` | `session/runner/llm.ts` 的 `while (true)` 与 `runStep`；`session/runner/step.ts`；`session/runner/max-steps.ts` |
| 3 工具设计 | `environments/local.py` | `tool/plugin/` 下的 `read.ts`、`edit.ts`、`shell.ts`、`grep.ts`、`glob.ts`；`tool-output.ts` |
| 4 Context Engineering | `config/` 下的 yaml 模板 | `session/runner/prompt/system.txt`、`plugin/system-prompt/*.txt`、`instruction-discovery.ts` + `instructions/`、`session/compaction.ts`、`plugin/provider/prompt-cache-key.ts` |
| 5 Workflow / Agent 配置 | — | `agent.ts`、`plugin/agent.ts`。此版本**没有** todo 工具，对照 Claude Code 的 TodoWrite |
| 6 检索 | — | `tool/plugin/grep.ts`、`tool/plugin/glob.ts`、`ripgrep.ts`（agentic search，无向量库） |
| 7 Memory | — | 无 agent 自写的记忆，只有 `instruction-discovery.ts`（AGENTS.md）。对照 Claude Code 记忆目录 `~/.claude/projects/<项目路径>/memory/` 和 Letta |
| 8 MCP 与协议 | — | `mcp/client.ts`、`mcp/stdio.ts`、`mcp/oauth.ts`、`mcp/index.ts`、`tool/mcp.ts` |
| 9 Skills | — | `skill.ts`、`skill/discovery.ts`、`skill/instructions.ts`、`tool/plugin/skill.ts` |
| 10 Subagent | — | `tool/plugin/subagent.ts`、`session/subagent-job.ts`、`session/subagent-completion.ts` |
| 11 Runtime 架构 | `run/mini.py`（单进程对照） | `packages/server/src/`（API、`event-feed.ts`）、`packages/protocol/openapi.json`、`packages/sdk/`、`packages/client/`；CLI 命令 `packages/cli/src/commands/handlers/{serve,run,acp}.ts` |
| 12 持久化 / 恢复 / 回滚 | `agents/default.py` 的 `save()`（轨迹文件） | `bus.ts`、`session/projector.ts`（事件 → 投影）、`session/store.ts`（execution claim）、`session/execution/restart.ts`、`snapshot.ts`、`worktree.ts`、`database/` |
| 13 执行控制 | — | `session/inbox.ts`（steer vs 排队输入）、`session/runner/retry.ts`、`model-retry.ts`、`session/runner/llm.ts`（溢出恢复、连续截断检测） |
| 14 沙箱与权限 | `environments/docker.py`、`environments/extra/bubblewrap.py` | `permission.ts`、`permission/`、`managed-policy.ts`。**无 OS 沙箱**，对照 Codex |
| 15 Hooks 与插件 | — | `plugin.ts`、`plugin/`（内置能力也以插件实现）、`packages/plugin/`。hooks 对照 Claude Code 文档 |
| 16 后台与长时运行 | — | `job.ts`、`session/subagent-job.ts` |
| 17 评估与可观测性 | `run/benchmarks/swebench.py`、`run/utilities/inspector.py` | `session/stats.ts`、`event-logger.ts` |

Codex 下载后补充：第 11 阶段（app-server 协议、`exec`）、第 12 阶段（rollout 与 resume）、第 14 阶段（Seatbelt / Landlock 沙箱、审批策略）。

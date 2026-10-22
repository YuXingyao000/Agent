# Agent 学习项目：给 AI 协作者的说明

本文件对所有 coding agent 通用：Codex 等直接读取它，Claude Code 通过 `CLAUDE.md` 引用它。
用户会在**不同电脑**（个人电脑、实验室电脑）上、用**不同 agent** 继续学习，所以**所有学习状态都必须写在这个仓库里**，不要依赖任何 agent 自带的记忆功能或会话历史，换电脑、换 agent 都会丢。

## 项目是什么
用户在系统学习 LLM agent 原理，按 `LEARNING_PLAN.md` 推进，最终从零搭一个类 Codex 的 agent（`my-agent/`）。你的角色是**导师 + 结对编程伙伴**。

## 每次会话开始时
1. 读 `notes/PROGRESS.md` 的最后一条：上次学到哪、遗留问题、下一步。
2. 读 `LEARNING_PLAN.md` 里当前阶段的内容。
3. 用一两句话和用户确认从哪里继续。

## 每次会话结束前
在 `notes/PROGRESS.md` 末尾追加一条记录（格式见该文件），即使只学了一半。阶段验收完成后，勾选 `LEARNING_PLAN.md` 的进度。
记录里写"已修改某文件"之前，先确认改动真的在文件里（Git 仓库里用 `git diff` / `git status` 看一眼）。曾经出现过日志写了"已改正"、但推送的仓库里并没有这处改动的情况。

## 目录
- `LEARNING_PLAN.md`：学习路线与进度勾选
- `notes/PROGRESS.md`：跨电脑、跨 agent 的进度日志
- `notes/NN-主题.md`：各阶段笔记与理解检查答案
- `references/`：参照源码（只读），按阶段的文件对照见 `references/README.md`
- `my-agent/`：用户自己的 agent
- `env.sh`：项目内的 Python 环境

## 教学方式
- 用户用中文交流。
- 节奏：讲 → 读 → 答 → 做 → 验（见 `LEARNING_PLAN.md` 第六节）。
- 用户希望深入中高级内容：基础部分讲快、讲透原理，不要停留在入门层面。
- 解释概念时优先联系 `references/` 里的真实实现。**只引用仓库里实际存在的代码，讲之前先打开文件确认**。不要凭记忆描述 opencode、Codex 等项目的结构，它们改版很快，记忆里的版本多半已经过时。
- 理解检查：用户把答案写到 `notes/`。批改时追问薄弱处，不直接给标准答案。
- 但用户**没看懂题目本身**、或卡在缺少的前提知识上时，直接把机制讲清楚（最好配一个能跑的小例子），再出题检验。不要用一连串引导问题让用户去猜隐藏的前提，用户明确反感这种"打哑谜"。
- 实现功能前先确认用户懂了原理。代码可以由 AI 写，但用户要能解释每段代码在干嘛，review 时可以抽问。

## my-agent 的约定
- Python 3.12，直接调用模型厂商 SDK，不使用 LangChain、LangGraph 等 agent 框架。
- 从阶段 2 起用 asyncio，agent loop 产出事件流，CLI 只负责消费事件。
- **必须同时能在 macOS（个人电脑）和 Windows（实验室电脑）上运行**：shell 工具按平台选 bash / PowerShell，路径用 `pathlib`，不要假设有 grep、sed 等 Unix 命令。
- 保持简单可读，每个阶段只加该阶段的能力，便于和参照实现对照。

## 环境规则
- 所有工具都装在项目内。运行 uv / python 前先激活环境：
  - macOS：`source env.sh`
  - Windows（PowerShell）：`Set-ExecutionPolicy -Scope Process Bypass; . .\env.ps1`。新电脑先运行一次 `powershell -ExecutionPolicy Bypass -File .\setup.ps1`
- **不要做任何全局安装**（brew、apt、`pip install --user`、`npm -g` 等）。用户刻意保持全局环境干净，需要新工具时先问。
- 访问 GitHub 不稳定，下载优先走 `env.sh` 里配置的国内镜像。
- `.tools/`、`my-agent/.venv/`、`references/` 下的源码都不进 Git，每台电脑各自生成或下载。
- 两台电脑都 clone 了同一个 GitHub 仓库（`YuXingyao000/Agent`），通过 Git 同步。
  会话开始先 `git pull`，结束时提醒用户提交并推送。推送需要用户自己的 GitHub 凭据，由用户本人操作。
- **仓库是公开的**（用户有意为之：换设备时不用配置凭据就能 clone）。所以提交的一切都对外可见：
  - API key 放在 `.env` 里（已被 `.gitignore` 排除），绝不写进代码、笔记或提交
  - 不要提交 token、密码、私人信息，也不要提交实验室的工作内容
  - 提交前看一眼 `git diff`，确认没有夹带这些东西

## 参照源码
- `references/` 只读，不要修改。
- 版本固定在 `references/README.md` 写明的 commit，源码地图里的路径都基于这些版本。
- 新增参照仓库（如 Codex）时，记录它的 commit，并同步更新源码地图。

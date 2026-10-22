# Windows 版的 env.sh。用法：在 PowerShell 里进入 Agent 目录后执行
#   Set-ExecutionPolicy -Scope Process Bypass; . .\env.ps1
# （-Scope Process 只对当前窗口生效，不会改系统设置）
# 把 uv 及其下载的 Python、缓存全部限制在本项目文件夹内，不写入全局目录，也不写 Windows 注册表。

$AgentRoot = $PSScriptRoot

$env:PATH = "$AgentRoot\.tools\bin;$env:PATH"
$env:UV_CACHE_DIR = "$AgentRoot\.tools\uv-cache"
$env:UV_PYTHON_INSTALL_DIR = "$AgentRoot\.tools\python"
$env:UV_PYTHON_BIN_DIR = "$AgentRoot\.tools\bin"
$env:UV_TOOL_DIR = "$AgentRoot\.tools\uv-tools"
$env:UV_TOOL_BIN_DIR = "$AgentRoot\.tools\bin"
$env:UV_PYTHON_PREFERENCE = "only-managed"   # 只用项目内的 Python，不碰系统 Python
$env:UV_PYTHON_INSTALL_REGISTRY = "0"        # 不把 Python 注册到 Windows 注册表
# Python 本体默认从 GitHub 下载，这里改用国内镜像
$env:UV_PYTHON_INSTALL_MIRROR = "https://registry.npmmirror.com/-/binary/python-build-standalone"
# 虚拟环境放在 .tools 下。my-agent 是解压进来的旧目录，Cursor 里新启动的
# uv / python 进程对它没有写权限，写到本次新建的 .tools 才能成功。
$env:UV_PROJECT_ENVIRONMENT = "$AgentRoot\.tools\my-agent-venv"
$env:PYTHONDONTWRITEBYTECODE = "1"

# 网络不好时可启用国内 PyPI 镜像（取消注释）：
# $env:UV_DEFAULT_INDEX = "https://pypi.tuna.tsinghua.edu.cn/simple"

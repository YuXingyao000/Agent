# Windows 版的 env.sh。用法：在 PowerShell 里进入 Agent 目录后执行
#   Set-ExecutionPolicy -Scope Process Bypass; . .\env.ps1
# （-Scope Process 只对当前窗口生效，不会改系统设置）
# 把 Node / npm、uv 以及它们下载的东西全部限制在本项目文件夹内，不写入全局目录，也不写 Windows 注册表。

$AgentRoot = $PSScriptRoot

$env:PATH = "$AgentRoot\.tools\node;$AgentRoot\.tools\bin;$env:PATH"

# ---------- Node / npm（主语言 TypeScript）----------
$env:npm_config_registry = "https://registry.npmmirror.com"   # 国内镜像
$env:npm_config_cache = "$AgentRoot\.tools\npm-cache"
$env:npm_config_prefix = "$AgentRoot\.tools\npm-global"       # 万一执行了 npm -g，也只会装进项目里

# ---------- uv / Python（只用于临时实验）----------
$env:UV_CACHE_DIR = "$AgentRoot\.tools\uv-cache"
$env:UV_PYTHON_INSTALL_DIR = "$AgentRoot\.tools\python"
$env:UV_PYTHON_BIN_DIR = "$AgentRoot\.tools\bin"
$env:UV_TOOL_DIR = "$AgentRoot\.tools\uv-tools"
$env:UV_TOOL_BIN_DIR = "$AgentRoot\.tools\bin"
$env:UV_PYTHON_PREFERENCE = "only-managed"   # 只用项目内的 Python，不碰系统 Python
$env:UV_PYTHON_INSTALL_REGISTRY = "0"        # 不把 Python 注册到 Windows 注册表
# Python 本体默认从 GitHub 下载，这里改用国内镜像
$env:UV_PYTHON_INSTALL_MIRROR = "https://registry.npmmirror.com/-/binary/python-build-standalone"
$env:PYTHONDONTWRITEBYTECODE = "1"

# 网络不好时可启用国内 PyPI 镜像（取消注释）：
# $env:UV_DEFAULT_INDEX = "https://pypi.tuna.tsinghua.edu.cn/simple"

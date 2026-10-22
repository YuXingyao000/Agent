# 用法：在 Agent/ 目录下执行  source env.sh
# 把 uv 及其下载的 Python、缓存全部限制在本项目文件夹内，不写入全局目录。

AGENT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"

export PATH="$AGENT_ROOT/.tools/bin:$PATH"
export UV_CACHE_DIR="$AGENT_ROOT/.tools/uv-cache"
export UV_PYTHON_INSTALL_DIR="$AGENT_ROOT/.tools/python"
export UV_PYTHON_BIN_DIR="$AGENT_ROOT/.tools/bin"
export UV_TOOL_DIR="$AGENT_ROOT/.tools/uv-tools"
export UV_TOOL_BIN_DIR="$AGENT_ROOT/.tools/bin"
export UV_PYTHON_PREFERENCE="only-managed"   # 只用项目内的 Python，不碰系统 Python
# Python 本体默认从 GitHub 下载，这里改用国内镜像
export UV_PYTHON_INSTALL_MIRROR="https://registry.npmmirror.com/-/binary/python-build-standalone"
# 与 env.ps1 一致：虚拟环境放在 .tools 下，不写进 my-agent/.venv
export UV_PROJECT_ENVIRONMENT="$AGENT_ROOT/.tools/my-agent-venv"
export PYTHONDONTWRITEBYTECODE=1

# 网络不好时可启用国内镜像（取消注释）：
# export UV_DEFAULT_INDEX="https://pypi.tuna.tsinghua.edu.cn/simple"

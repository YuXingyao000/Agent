# 用法：在 Agent/ 目录下执行  source env.sh
# 把 Node / npm、uv 以及它们下载的东西全部限制在本项目文件夹内，不写入全局目录。

AGENT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"

export PATH="$AGENT_ROOT/.tools/node/bin:$AGENT_ROOT/.tools/bin:$PATH"

# ---------- Node / npm（主语言 TypeScript）----------
export npm_config_registry="https://registry.npmmirror.com"   # 国内镜像
export npm_config_cache="$AGENT_ROOT/.tools/npm-cache"
export npm_config_prefix="$AGENT_ROOT/.tools/npm-global"      # 万一执行了 npm -g，也只会装进项目里

# ---------- uv / Python（只用于临时实验）----------
export UV_CACHE_DIR="$AGENT_ROOT/.tools/uv-cache"
export UV_PYTHON_INSTALL_DIR="$AGENT_ROOT/.tools/python"
export UV_PYTHON_BIN_DIR="$AGENT_ROOT/.tools/bin"
export UV_TOOL_DIR="$AGENT_ROOT/.tools/uv-tools"
export UV_TOOL_BIN_DIR="$AGENT_ROOT/.tools/bin"
export UV_PYTHON_PREFERENCE="only-managed"   # 只用项目内的 Python，不碰系统 Python
# Python 本体默认从 GitHub 下载，这里改用国内镜像
export UV_PYTHON_INSTALL_MIRROR="https://registry.npmmirror.com/-/binary/python-build-standalone"
export PYTHONDONTWRITEBYTECODE=1

# 网络不好时可启用国内镜像（取消注释）：
# export UV_DEFAULT_INDEX="https://pypi.tuna.tsinghua.edu.cn/simple"

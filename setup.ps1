# 在 Windows 电脑上搭建本项目的环境。所有东西都装在项目文件夹内，可以重复运行。
# 用法：在 Agent 目录下的 PowerShell 里执行
#   powershell -ExecutionPolicy Bypass -File .\setup.ps1
#
# 会做的事：
#   1. 从 PyPI 镜像下载 uv 到 .tools\bin（校验 sha256）
#   2. 用 uv 从国内镜像下载 Python 3.12 到 .tools\python（只用于临时实验）
#   3. 从 npmmirror 下载 Node.js 到 .tools\node（校验 sha256），主语言 TypeScript 靠它运行
#   4. 在项目根目录 npm 安装 TypeScript 等开发依赖（node_modules\）
#   5. 下载固定版本的参照源码到 references\（GitHub 下不动时，按提示手动下载）

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"   # 关掉进度条，Invoke-WebRequest 会快很多
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$Root = $PSScriptRoot
. "$Root\env.ps1"

$UvVersion = "0.13.1"
$PythonVersion = "3.12"
$NodeVersion = "v24.22.1"
$Downloads = "$Root\.tools\downloads"
$References = @(
    @{ Name = "mini-swe-agent"; Url = "https://github.com/SWE-agent/mini-swe-agent/archive/04d809ceab9df28f9adaed044884180159172930.zip" },
    @{ Name = "opencode";       Url = "https://github.com/anomalyco/opencode/archive/815de9950b205cd734c9962c4629b07d3b83ee07.zip" }
)

New-Item -ItemType Directory -Force "$Root\.tools\bin", $Downloads | Out-Null

if ($Root.Length -gt 40) {
    Write-Host "提示：项目路径较长（$Root）。opencode 里有很深的目录，解压时可能超过 Windows 260 字符的路径限制，建议把项目放在 D:\Agent 这样的短路径下。" -ForegroundColor Yellow
}

# ---------- 1. uv ----------
Write-Host "`n[1/5] uv" -ForegroundColor Cyan
if (Test-Path "$Root\.tools\bin\uv.exe") {
    Write-Host "  已存在，跳过"
} else {
    $arch = if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") { "win_arm64" } else { "win_amd64" }
    $wheel = "uv-$UvVersion-py3-none-$arch.whl"
    $indexes = @(
        "https://pypi.tuna.tsinghua.edu.cn/simple/uv/",
        "https://mirrors.aliyun.com/pypi/simple/uv/",
        "https://pypi.org/simple/uv/"
    )
    $done = $false
    foreach ($index in $indexes) {
        try {
            Write-Host "  尝试 $index"
            $html = (Invoke-WebRequest -UseBasicParsing $index).Content
            $m = [regex]::Match($html, 'href="([^"]*' + [regex]::Escape($wheel) + '[^"]*)"')
            if (-not $m.Success) { Write-Host "  这个镜像上没有 $wheel"; continue }
            $href = $m.Groups[1].Value
            $url = ([Uri]::new([Uri]$index, $href)).AbsoluteUri
            $zip = "$Downloads\uv.zip"   # wheel 就是 zip，Expand-Archive 要求 .zip 后缀
            Invoke-WebRequest -UseBasicParsing $url -OutFile $zip

            $sha = [regex]::Match($href, 'sha256=([0-9a-f]{64})')
            if ($sha.Success) {
                $actual = (Get-FileHash $zip -Algorithm SHA256).Hash.ToLower()
                if ($actual -ne $sha.Groups[1].Value) { throw "sha256 校验失败" }
                Write-Host "  sha256 校验通过"
            }

            $unpack = "$Downloads\uv-wheel"
            if (Test-Path $unpack) { Remove-Item -Recurse -Force $unpack }
            Expand-Archive $zip -DestinationPath $unpack
            Get-ChildItem "$unpack\*.data\scripts\*.exe" | Copy-Item -Destination "$Root\.tools\bin\"
            Remove-Item -Recurse -Force $unpack, $zip
            $done = $true
            break
        } catch {
            Write-Host "  失败：$($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    if (-not $done) { throw "所有镜像都下载失败，请检查网络后重试" }
}
& uv --version

# ---------- 2. Python ----------
Write-Host "`n[2/5] Python $PythonVersion" -ForegroundColor Cyan
& uv python install $PythonVersion --no-registry
if ($LASTEXITCODE -ne 0) { throw "Python 安装失败" }

# ---------- 3. Node.js ----------
Write-Host "`n[3/5] Node.js $NodeVersion" -ForegroundColor Cyan
if (Test-Path "$Root\.tools\node\node.exe") {
    Write-Host "  已存在，跳过"
} else {
    $arch = if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") { "win-arm64" } else { "win-x64" }
    $name = "node-$NodeVersion-$arch"
    $base = "https://registry.npmmirror.com/-/binary/node/$NodeVersion"
    $zip = "$Downloads\$name.zip"
    Write-Host "  下载 $name.zip ..."
    Invoke-WebRequest -UseBasicParsing "$base/$name.zip" -OutFile $zip

    $sums = Invoke-WebRequest -UseBasicParsing "$base/SHASUMS256.txt"
    $text = if ($sums.Content -is [byte[]]) { [Text.Encoding]::UTF8.GetString($sums.Content) } else { $sums.Content }
    $expected = [regex]::Match($text, "([0-9a-f]{64})\s+$([regex]::Escape("$name.zip"))").Groups[1].Value
    $actual = (Get-FileHash $zip -Algorithm SHA256).Hash.ToLower()
    if (-not $expected -or $actual -ne $expected) { throw "Node sha256 校验失败" }
    Write-Host "  sha256 校验通过"

    # Windows 自带的 tar 解压 zip 比 Expand-Archive 快得多（npm 有上千个小文件）
    & tar -xf $zip -C $Downloads
    if ($LASTEXITCODE -ne 0) { throw "Node 解压失败" }
    Move-Item "$Downloads\$name" "$Root\.tools\node"
    Remove-Item -Force $zip
}
& node --version

# ---------- 4. npm 依赖 ----------
Write-Host "`n[4/5] npm 依赖（TypeScript 等）" -ForegroundColor Cyan
Push-Location $Root
try {
    # 有 package-lock.json 时用 npm ci，严格按锁文件安装，两台电脑装出来完全一样
    if (Test-Path "$Root\package-lock.json") { & npm ci } else { & npm install }
    if ($LASTEXITCODE -ne 0) { throw "npm 安装失败" }
    & npx tsc --version
} finally {
    Pop-Location
}

# ---------- 5. 参照源码 ----------
Write-Host "`n[5/5] 参照源码" -ForegroundColor Cyan
$missing = @()
foreach ($ref in $References) {
    $target = "$Root\references\$($ref.Name)"
    if (Test-Path $target) { Write-Host "  $($ref.Name) 已存在，跳过"; continue }

    $zip = "$Downloads\$($ref.Name).zip"
    if (-not (Test-Path $zip)) {
        try {
            Write-Host "  下载 $($ref.Name) ..."
            Invoke-WebRequest -UseBasicParsing $ref.Url -OutFile $zip
        } catch {
            if (Test-Path $zip) { Remove-Item -Force $zip }
            $missing += $ref
            continue
        }
    }

    Write-Host "  解压 $($ref.Name)（opencode 文件很多，可能要几分钟）..."
    $unpack = "$Downloads\$($ref.Name)-unpack"
    if (Test-Path $unpack) { Remove-Item -Recurse -Force $unpack }
    Expand-Archive $zip -DestinationPath $unpack
    $top = Get-ChildItem $unpack -Directory | Select-Object -First 1   # zip 里唯一的顶层目录
    Move-Item $top.FullName $target
    Remove-Item -Recurse -Force $unpack, $zip
    Write-Host "  $($ref.Name) 完成"
}

if ($missing.Count -gt 0) {
    Write-Host "`n以下参照源码没能从 GitHub 下载。请用浏览器下载，保存为对应文件名，放进 $Downloads 后重新运行本脚本：" -ForegroundColor Yellow
    foreach ($ref in $missing) { Write-Host "  $($ref.Name).zip  <-  $($ref.Url)" }
} else {
    Write-Host "`n全部完成。以后每次打开新的 PowerShell 窗口，先执行：" -ForegroundColor Green
    Write-Host "  Set-ExecutionPolicy -Scope Process Bypass; . .\env.ps1"
}

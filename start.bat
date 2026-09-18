@echo off
chcp 65001 >nul 2>&1
setlocal

:: 切换到本脚本所在目录（兼容中文路径，无需硬编码）
cd /d "%~dp0"

echo ============================================
echo   成理摄影工作室 - 一键启动 (Dev)
echo   目录: %CD%
echo ============================================

:: 1. 检查 Node.js 是否安装
where node >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Node.js，请先安装：https://nodejs.org
    pause
    exit /b 1
)

:: 2. 缺少依赖时自动安装
if not exist "node_modules" (
    echo 未检测到依赖，正在执行 npm install ...
    call npm install
    if errorlevel 1 (
        echo [错误] 依赖安装失败，请检查网络或 npm 镜像配置。
        pause
        exit /b 1
    )
)

:: 3. 启动开发服务器（默认端口 5173）
echo.
echo 正在启动开发服务器 ...
echo 本地访问地址: http://localhost:5173
echo 按 Ctrl+C 可停止服务器
echo.

:: 服务器就绪后自动打开浏览器（延迟约 4 秒，避免连接被拒）
start "" cmd /c "ping -n 4 127.0.0.1 >nul & start http://localhost:5173"

npm run dev

endlocal

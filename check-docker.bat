@echo off
echo ========================================
echo    Verificando Docker Desktop
echo ========================================
echo.

echo Verificando se o Docker Desktop esta rodando...
docker info >nul 2>&1
if %errorlevel% equ 0 (
    echo Docker Desktop esta rodando!
    echo.
    echo Iniciando containers...
    docker-compose up --build -d
    echo.
    echo Containers iniciados!
    echo Backend: http://localhost:8080
    echo Frontend: http://localhost:3000
) else (
    echo Docker Desktop nao esta rodando.
    echo.
    echo Tentando iniciar o Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo.
    echo Aguarde alguns segundos para o Docker Desktop inicializar...
    echo Depois execute novamente este script ou use: docker-compose up --build -d
)

pause 
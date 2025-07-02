@echo off
echo ========================================
echo    Controle de Sala FEMASS - Docker
echo ========================================
echo.

:menu
echo Escolha uma opcao:
echo 1. Construir e iniciar containers
echo 2. Parar containers
echo 3. Remover containers
echo 4. Ver logs do backend
echo 5. Ver logs do frontend
echo 6. Acessar shell do backend
echo 7. Acessar shell do frontend
echo 8. Sair
echo.
set /p choice="Digite sua escolha (1-8): "

if "%choice%"=="1" goto start
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto remove
if "%choice%"=="4" goto logs-backend
if "%choice%"=="5" goto logs-frontend
if "%choice%"=="6" goto shell-backend
if "%choice%"=="7" goto shell-frontend
if "%choice%"=="8" goto exit
goto menu

:start
echo.
echo Construindo e iniciando containers...
docker-compose up --build -d
echo.
echo Containers iniciados!
echo Backend: http://localhost:8080
echo Frontend: http://localhost:3000
echo.
pause
goto menu

:stop
echo.
echo Parando containers...
docker-compose down
echo Containers parados!
echo.
pause
goto menu

:remove
echo.
echo Removendo containers...
docker-compose down --rmi all --volumes --remove-orphans
echo Containers removidos!
echo.
pause
goto menu

:logs-backend
echo.
echo Logs do Backend:
docker-compose logs -f backend
goto menu

:logs-frontend
echo.
echo Logs do Frontend:
docker-compose logs -f frontend
goto menu

:shell-backend
echo.
echo Acessando shell do backend...
docker-compose exec backend /bin/bash
goto menu

:shell-frontend
echo.
echo Acessando shell do frontend...
docker-compose exec frontend /bin/sh
goto menu

:exit
echo.
echo Saindo...
exit 
@echo off
echo ========================================
echo   SISTEMA LAVA CAR - INSTALACAO
echo ========================================
echo.

echo [1/4] Instalando dependencias do BACKEND...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERRO ao instalar dependencias do backend!
    pause
    exit /b 1
)
echo.

echo [2/4] Gerando Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERRO ao gerar Prisma Client!
    pause
    exit /b 1
)
echo.

echo [3/4] Criando banco de dados...
call npx prisma db push
if %errorlevel% neq 0 (
    echo ERRO ao criar banco!
    pause
    exit /b 1
)
echo.

echo [4/4] Instalando dependencias do FRONTEND...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ERRO ao instalar dependencias do frontend!
    pause
    exit /b 1
)
echo.

cd ..

echo ========================================
echo   INSTALACAO CONCLUIDA COM SUCESSO!
echo ========================================
echo.
echo Para executar o sistema:
echo   1. Backend:  cd backend  e  npm run dev
echo   2. Frontend: cd frontend e  npm run dev
echo   3. Abrir: http://localhost:3000
echo.
pause

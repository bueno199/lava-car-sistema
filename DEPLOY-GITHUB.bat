@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║                                                                  ║
echo ║           🚀 DEPLOY NO GITHUB - Sistema Lava Car 🚀             ║
echo ║                                                                  ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
echo.

REM Verificar se estamos no diretório correto
if not exist "backend" (
    echo ❌ ERRO: Execute este script na pasta lava-car-sistema
    echo.
    pause
    exit /b 1
)

echo 📋 PASSO 1: Verificando Git
echo ═══════════════════════════════════════════════════════════════════
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git não está instalado!
    echo.
    echo 📥 Instale o Git em: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)
echo ✅ Git instalado
echo.

echo 📋 PASSO 2: Verificando repositório local
echo ═══════════════════════════════════════════════════════════════════
git status >nul 2>&1
if errorlevel 1 (
    echo ❌ Não é um repositório Git!
    echo.
    pause
    exit /b 1
)
echo ✅ Repositório Git OK
echo.

echo 📋 PASSO 3: Configurando remote
echo ═══════════════════════════════════════════════════════════════════
echo.
echo ⚠️  IMPORTANTE: Você precisa ter criado o repositório no GitHub!
echo.
echo 📖 Se ainda não criou:
echo    1. Acesse: https://github.com/new
echo    2. Nome: lava-car-sistema
echo    3. NÃO marque "Initialize with README"
echo    4. Clique em "Create repository"
echo.
set /p CONTINUAR="Você já criou o repositório no GitHub? (S/N): "
if /i not "%CONTINUAR%"=="S" (
    echo.
    echo 🌐 Abrindo GitHub...
    start https://github.com/new
    echo.
    echo ⏸️  Execute este script novamente após criar o repositório.
    echo.
    pause
    exit /b 0
)

echo.
echo 📝 Digite a URL do seu repositório GitHub:
echo    Exemplo: https://github.com/seu-usuario/lava-car-sistema.git
echo.
set /p REPO_URL="URL: "

if "%REPO_URL%"=="" (
    echo ❌ URL não pode estar vazia!
    pause
    exit /b 1
)

REM Verificar se remote já existe
git remote get-url origin >nul 2>&1
if not errorlevel 1 (
    echo.
    echo ⚠️  Remote 'origin' já existe. Removendo...
    git remote remove origin
)

echo.
echo 🔗 Adicionando remote...
git remote add origin %REPO_URL%
if errorlevel 1 (
    echo ❌ Erro ao adicionar remote!
    pause
    exit /b 1
)

echo ✅ Remote configurado
echo.

echo 📋 PASSO 4: Renomeando branch para main
echo ═══════════════════════════════════════════════════════════════════
git branch -M main
echo ✅ Branch renomeada para main
echo.

echo 📋 PASSO 5: Fazendo push para o GitHub
echo ═══════════════════════════════════════════════════════════════════
echo.
echo 🚀 Enviando código para o GitHub...
echo.
echo ⚠️  Se pedir autenticação:
echo    - Username: seu username do GitHub
echo    - Password: use um Personal Access Token (não sua senha!)
echo.
echo 📖 Para criar token: https://github.com/settings/tokens
echo.

git push -u origin main
if errorlevel 1 (
    echo.
    echo ❌ Erro ao fazer push!
    echo.
    echo 🔧 Possíveis soluções:
    echo    1. Verifique sua autenticação
    echo    2. Crie um Personal Access Token em: https://github.com/settings/tokens
    echo    3. Use o token como senha
    echo    4. Verifique se a URL do repositório está correta
    echo.
    pause
    exit /b 1
)

echo.
echo ═══════════════════════════════════════════════════════════════════
echo.
echo   🎉 SUCESSO! CÓDIGO ENVIADO PARA O GITHUB! 🎉
echo.
echo ═══════════════════════════════════════════════════════════════════
echo.
echo 📊 Seu repositório está em:
git remote get-url origin
echo.
echo 🌐 Abra no navegador para ver:
git remote get-url origin | findstr /R ".*" > temp_url.txt
set /p GITHUB_URL=<temp_url.txt
del temp_url.txt
set "GITHUB_URL=%GITHUB_URL:.git=%"
echo %GITHUB_URL%
echo.
echo 🚀 Próximos passos:
echo    1. Acesse seu repositório no GitHub
echo    2. Verifique se todos os arquivos foram enviados
echo    3. Configure deploy seguindo: DEPLOY-PASSO-A-PASSO.md
echo.
echo ✅ Tudo pronto!
echo.

set /p ABRIR="Deseja abrir o repositório no navegador agora? (S/N): "
if /i "%ABRIR%"=="S" (
    start %GITHUB_URL%
)

echo.
pause

# 🚀 DEPLOY PASSO-A-PASSO - Sistema Lava Car

**Tempo total**: 1-2 horas
**Custo**: R$ 0,00 (tudo grátis!)

---

## PASSO 1: Criar Repositório GitHub (5 min)

### 1.1 Criar conta GitHub (se não tiver)
- Acesse: https://github.com/signup
- Crie sua conta gratuita

### 1.2 Criar novo repositório
1. Acesse: https://github.com/new
2. Preencha:
   - **Repository name**: `lava-car-sistema`
   - **Description**: `Sistema completo de gestão para lava car`
   - **Visibility**: Public (ou Private, sua escolha)
   - ❌ **NÃO** marque "Initialize with README"
3. Clique em **"Create repository"**

### 1.3 Fazer push do código
```bash
cd "C:\Users\bueno\Documents\lava car\lava-car-sistema"

# Adicione o remote (substitua SEU-USUARIO pelo seu username do GitHub)
git remote add origin https://github.com/SEU-USUARIO/lava-car-sistema.git

# Renomeie branch para main
git branch -M main

# Faça push
git push -u origin main
```

**✅ Checkpoint**: Código agora está no GitHub!

---

## PASSO 2: Deploy do Frontend (Vercel) (15 min)

### 2.1 Criar conta Vercel
1. Acesse: https://vercel.com/signup
2. Clique em **"Continue with GitHub"**
3. Autorize a Vercel a acessar sua conta GitHub

### 2.2 Importar projeto
1. No dashboard da Vercel, clique em **"Add New Project"**
2. Selecione o repositório `lava-car-sistema`
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 2.3 Configurar variável de ambiente
1. Em **"Environment Variables"**, adicione:
   ```
   Nome: VITE_API_URL
   Valor: (deixe vazio por enquanto, vamos preencher depois)
   ```

2. Clique em **"Deploy"**

3. **Aguarde 2-3 minutos** enquanto faz o build

4. **Anote a URL** que a Vercel criou, algo como:
   ```
   https://lava-car-sistema.vercel.app
   ```

**✅ Checkpoint**: Frontend deployado! (mas ainda não conecta com API)

---

## PASSO 3: Deploy do Backend (Railway) (20 min)

### 3.1 Criar conta Railway
1. Acesse: https://railway.app/
2. Clique em **"Login with GitHub"**
3. Autorize o Railway

### 3.2 Criar novo projeto
1. Clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha `lava-car-sistema`

### 3.3 Configurar o serviço
1. Após importar, clique no serviço criado
2. Vá em **"Settings"**
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Watch Paths**: `backend/**`

### 3.4 Configurar variáveis de ambiente
1. Vá em **"Variables"**
2. Adicione as seguintes variáveis:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=./database/lavacar.db
FRONTEND_URL=https://lava-car-sistema.vercel.app
```

(Substitua `lava-car-sistema.vercel.app` pela URL que você anotou no Passo 2)

### 3.5 Adicionar persistência de dados
1. Vá em **"Settings" → "Volumes"**
2. Clique em **"Add Volume"**
3. Configure:
   - **Mount Path**: `/app/backend/database`
   - **Size**: 1GB (suficiente)

### 3.6 Gerar domínio público
1. Vá em **"Settings" → "Networking"**
2. Clique em **"Generate Domain"**
3. **Anote a URL**, algo como:
   ```
   https://lava-car-sistema-production.up.railway.app
   ```

4. **Aguarde 3-5 minutos** para o deploy completar

### 3.7 Testar o backend
```bash
# Substitua pela sua URL do Railway
curl https://lava-car-sistema-production.up.railway.app/api/health
```

**Resposta esperada**:
```json
{"status":"ok","timestamp":"2025-10-17T...","uptime":123.45}
```

**✅ Checkpoint**: Backend deployado e funcionando!

---

## PASSO 4: Conectar Frontend com Backend (5 min)

### 4.1 Atualizar variável no Vercel
1. Volte para o dashboard da Vercel
2. Selecione seu projeto `lava-car-sistema`
3. Vá em **"Settings" → "Environment Variables"**
4. Edite `VITE_API_URL`:
   ```
   VITE_API_URL=https://lava-car-sistema-production.up.railway.app/api
   ```
   (Use a URL do Railway que você anotou, e adicione `/api` no final)

5. Clique em **"Save"**

### 4.2 Fazer redeploy do frontend
1. Vá em **"Deployments"**
2. No último deployment, clique nos **"..."** (três pontinhos)
3. Clique em **"Redeploy"**
4. Aguarde 1-2 minutos

**✅ Checkpoint**: Frontend e backend conectados!

---

## PASSO 5: Testar Aplicação em Produção (10 min)

### 5.1 Testar no navegador
1. Abra a URL do frontend (Vercel):
   ```
   https://lava-car-sistema.vercel.app
   ```

2. Verifique:
   - [ ] Página carrega sem erros
   - [ ] Consegue navegar entre as abas
   - [ ] Consegue adicionar uma lavagem de teste
   - [ ] Dados aparecem corretamente

3. Abra o **DevTools** (F12):
   - [ ] Console sem erros críticos
   - [ ] Aba "Network" mostra chamadas para a API com status 200

### 5.2 Testar API diretamente
```bash
# Health check
curl https://lava-car-sistema-production.up.railway.app/api/health

# Listar clientes (deve retornar [] se banco vazio)
curl https://lava-car-sistema-production.up.railway.app/api/clientes
```

**✅ Checkpoint**: Sistema 100% funcional em produção!

---

## PASSO 6: Configurar Deploy Automático (10 min)

### 6.1 Obter tokens de API

**Token da Vercel**:
1. Acesse: https://vercel.com/account/tokens
2. Clique em **"Create Token"**
3. Nome: `GitHub Actions`
4. Escopo: `Full Account`
5. **Copie o token** (você não verá novamente!)

**Token do Railway**:
1. Acesse: https://railway.app/account/tokens
2. Clique em **"Create Token"**
3. Nome: `GitHub Actions`
4. **Copie o token**

**IDs da Vercel**:
1. Vá no projeto Vercel
2. **Settings** → **General**
3. Copie:
   - **Project ID**
   - **Team ID** (ou Personal Account ID se não tiver team)

### 6.2 Adicionar secrets no GitHub
1. Vá no seu repositório: `https://github.com/SEU-USUARIO/lava-car-sistema`
2. Clique em **"Settings"** (do repositório)
3. No menu lateral: **"Secrets and variables" → "Actions"**
4. Clique em **"New repository secret"** para cada:

```
Name: VERCEL_TOKEN
Value: [cole o token da Vercel]

Name: VERCEL_ORG_ID
Value: [cole o Team/Personal ID]

Name: VERCEL_PROJECT_ID
Value: [cole o Project ID]

Name: RAILWAY_TOKEN
Value: [cole o token do Railway]

Name: VITE_API_URL
Value: https://lava-car-sistema-production.up.railway.app/api
```

### 6.3 Testar deploy automático
```bash
cd "C:\Users\bueno\Documents\lava car\lava-car-sistema"

# Faça uma pequena mudança
echo "" >> README.md

# Commit e push
git add .
git commit -m "test: trigger auto deploy"
git push
```

### 6.4 Acompanhar deploy
1. Vá em: `https://github.com/SEU-USUARIO/lava-car-sistema/actions`
2. Você verá os workflows rodando:
   - ✅ **CI** - Roda testes
   - ✅ **Deploy** - Faz deploy automático

**✅ Checkpoint**: Deploy automático configurado!

---

## PASSO 7: Testar PWA no Celular (10 min)

### 7.1 No celular (Android/iOS)
1. Abra o navegador (Chrome/Safari)
2. Acesse: `https://lava-car-sistema.vercel.app`
3. **No Chrome Android**:
   - Menu (⋮) → "Instalar app" ou "Adicionar à tela inicial"
4. **No Safari iOS**:
   - Compartilhar (⬆️) → "Adicionar à Tela de Início"

### 7.2 Testar o app instalado
1. Abra o app pela tela inicial
2. Verifique:
   - [ ] Abre em tela cheia (sem barra de endereço)
   - [ ] Ícone correto aparece
   - [ ] Funciona normalmente
   - [ ] **Teste offline**:
     - Abra o app (online)
     - Ative modo avião
     - Navegue no app (deve funcionar)

**✅ Checkpoint**: PWA instalado e funcionando!

---

## 🎉 PARABÉNS! DEPLOY COMPLETO!

### URLs Finais
- **Frontend**: https://lava-car-sistema.vercel.app
- **Backend**: https://lava-car-sistema-production.up.railway.app
- **API Health**: https://lava-car-sistema-production.up.railway.app/api/health

### Próximos Passos (Opcional)
1. **Domínio personalizado** (ex: lavacar.com.br)
   - Configure na Vercel (Settings → Domains)
   - Aponte DNS para Vercel
2. **Analytics**
   - Vercel tem analytics grátis
3. **Monitoramento**
   - Railway mostra logs e métricas

---

## 🆘 PROBLEMAS COMUNS

### Backend não inicia
**Erro**: "Application failed to start"
**Solução**:
1. Verifique logs no Railway
2. Confirme `package.json` tem `"start": "node dist/server.js"`
3. Verifique build command está correto

### Frontend não conecta com API
**Erro**: "Network Error" ou CORS
**Solução**:
1. Confirme `VITE_API_URL` está correto na Vercel
2. Verifique CORS no backend aceita a URL do Vercel
3. Teste API diretamente: `curl https://seu-backend.railway.app/api/health`

### Deploy automático não funciona
**Erro**: Workflow falha
**Solução**:
1. Verifique todos os secrets estão adicionados
2. Confirme tokens são válidos
3. Veja logs do workflow no GitHub Actions

### PWA não instala
**Erro**: "Adicionar à tela inicial" não aparece
**Solução**:
1. Confirme está usando HTTPS (HTTP não funciona)
2. Abra DevTools → Application → Manifest (veja erros)
3. Verifique ícones 192x192 e 512x512 existem

### Database vazio após deploy
**Erro**: Dados sumiram
**Solução**:
1. Verifique volume está configurado no Railway
2. Caminho do volume deve ser `/app/backend/database`
3. Use backup automático (já configurado)

---

## 📊 CHECKLIST FINAL

- [ ] Repositório criado no GitHub
- [ ] Código enviado (git push)
- [ ] Frontend deployado na Vercel
- [ ] Backend deployado no Railway
- [ ] Volume para database criado
- [ ] Variáveis de ambiente configuradas
- [ ] Frontend conectado com backend
- [ ] Testado em produção
- [ ] Secrets adicionados no GitHub
- [ ] Deploy automático funcionando
- [ ] PWA instalado no celular
- [ ] Testado offline
- [ ] URLs documentadas

---

## 💰 CUSTOS

- **Vercel**: Grátis para sempre (Hobby plan)
- **Railway**: $5/mês de crédito grátis (suficiente para este projeto)
- **GitHub**: Grátis para repositórios públicos/privados
- **TOTAL**: **R$ 0,00/mês** ✅

---

## 📞 SUPORTE

Se precisar de ajuda:
1. Veja logs no Railway e Vercel
2. Teste API com `curl`
3. Verifique console do navegador (F12)
4. Confira que todos os secrets estão corretos

---

**🎉 Sistema 100% deployado e funcionando!**

_Criado em: 17/10/2025_
_Versão: 3.0.0 FINAL_

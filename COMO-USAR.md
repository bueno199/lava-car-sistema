# 🚀 COMO USAR - Guia Rápido

## ⚡ INSTALAÇÃO RÁPIDA (5 MINUTOS)

### Opção 1: Script Automático (Recomendado)

1. Abrir a pasta do projeto
2. **Duplo clique** em `INSTALAR-TUDO.bat`
3. Aguardar instalação (2-3 minutos)
4. Pronto!

### Opção 2: Manual

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma db push

# Frontend
cd ../frontend
npm install
```

---

## 🎯 EXECUTAR SISTEMA

### Opção 1: Scripts BAT (Windows)

1. **Duplo clique** em `EXECUTAR-BACKEND.bat`
2. Aguardar mensagem: "Servidor rodando na porta 5000"
3. **Duplo clique** em `EXECUTAR-FRONTEND.bat` (nova janela)
4. Aguardar abrir navegador automaticamente

### Opção 2: Manual

**Terminal 1 (Backend):**

```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**

```bash
cd frontend
npm run dev
```

**Abrir navegador:** http://localhost:3000

---

## 📋 USO DIÁRIO

### 1. Cadastrar Cliente

1. Clicar em **"Novo Cliente"**
2. Preencher dados:
   - Nome do cliente
   - Placa do veículo (formato: ABC-1234)
   - Telefone (opcional)
3. Clicar em **"Salvar"**

### 2. Registrar Lavagem

1. Clicar em **"Nova Lavagem"**
2. Selecionar cliente no dropdown
3. Informar valor (ex: 50.00)
4. Escolher forma de pagamento
5. Adicionar observação (opcional)
6. Clicar em **"Salvar"**

### 3. Ver Resumo

Os cards no topo mostram automaticamente:

- **Lavagens Hoje**: Quantidade de lavagens realizadas hoje
- **Receita Hoje**: Total ganho hoje
- **Lavagens Mês**: Total do mês atual
- **Receita Mês**: Total faturado no mês

### 4. Buscar Lavagens

- **Desktop**: Campo de busca no topo da página
- Digite nome do cliente ou placa
- Resultados aparecem automaticamente

### 5. Deletar Lavagem

- Clicar no ícone de **lixeira** (🗑️)
- Confirmar exclusão
- Resumo atualiza automaticamente

---

## 📱 USO NO CELULAR

1. Abrir navegador do celular
2. Digitar: `http://[IP-DO-PC]:3000`
   - Exemplo: `http://192.168.1.10:3000`
3. Interface adapta automaticamente

**Para descobrir IP do PC:**

```bash
# Windows
ipconfig

# Procurar "Endereço IPv4"
```

---

## 💡 DICAS DE USO

### Atalhos Rápidos

- **Esc** - Fechar modais
- **Tab** - Navegar entre campos
- **Enter** - Submeter formulário

### Mobile

- **Deslizar** para rolar listas
- **Toque longo** para ações secundárias
- **Pinch zoom** funciona normalmente

### Desktop

- **Busca em tempo real** - Digitar para filtrar
- **Hover** mostra informações extras
- **Click direito** (futuro) para ações rápidas

---

## 🔧 MANUTENÇÃO

### Backup do Banco de Dados

O arquivo do banco fica em:

```
backend/dev.db
```

**Fazer backup:**

1. Copiar `dev.db`
2. Renomear para `backup-2025-10-11.db`
3. Guardar em local seguro

**Restaurar backup:**

1. Parar o backend
2. Substituir `dev.db` pelo backup
3. Reiniciar backend

### Ver Dados no Banco

```bash
cd backend
npx prisma studio
```

Abre interface visual em http://localhost:5555

### Limpar Dados de Teste

**Opção 1: Deletar banco e recriar**

```bash
cd backend
del dev.db
npx prisma db push
```

**Opção 2: Usar Prisma Studio**

- Abrir `npx prisma studio`
- Deletar registros manualmente

---

## ❓ PERGUNTAS FREQUENTES

### Como adicionar mais funcionários?

Futuramente: adicionar tabela de usuários com login.

### Posso usar em várias máquinas?

Sim! Basta:

1. Instalar em cada máquina
2. Ou hospedar em servidor central

### Os dados ficam salvos?

Sim! Tudo fica salvo no arquivo `dev.db`.

### Posso exportar relatórios?

Atualmente: não (futuro: Excel/PDF).

Alternativa: Usar `npx prisma studio` e copiar dados.

### Como atualizar o sistema?

1. Fazer backup do `dev.db`
2. Baixar nova versão
3. Substituir arquivos
4. Rodar `npm install` novamente
5. Restaurar `dev.db`

---

## 🎯 FLUXO DE TRABALHO RECOMENDADO

### Início do Dia

1. Executar backend
2. Executar frontend
3. Verificar resumo do dia anterior

### Durante o Dia

1. Cliente chega
2. Criar cliente (se novo)
3. Registrar lavagem
4. Informar forma de pagamento
5. Próximo!

### Fim do Dia

1. Ver resumo do dia
2. Conferir total de cada forma de pagamento
3. Fazer backup do banco
4. Fechar sistema

---

## 🎨 PERSONALIZAÇÕES

### Alterar Nome da Empresa

Editar `frontend/src/App.tsx`:

```typescript
<h1>Seu Nome Aqui</h1>
```

### Alterar Cores

Editar `frontend/tailwind.config.js`

### Adicionar Logo

1. Colocar logo em `frontend/public/logo.png`
2. Substituir ícone `<Car />` por `<img src="/logo.png" />`

---

## 📞 SUPORTE

### Problemas Comuns

Ver seção **TROUBLESHOOTING** no `README.md`

### Logs de Erro

- **Backend**: Ver terminal do backend
- **Frontend**: F12 → Console (navegador)

### Reportar Bugs

1. Anotar mensagem de erro
2. Anotar o que estava fazendo
3. Tirar print da tela
4. Enviar para desenvolvedor

---

**Versão:** 1.0.0
**Última atualização:** 2025-10-11
**Dificuldade:** ⭐⚪⚪⚪⚪ (Muito Fácil)

# 📖 GUIA COMPLETO DE FUNCIONALIDADES - Sistema Lava Car

**Versão**: 3.0.0
**Atualizado em**: 17/10/2025

---

## 📋 ÍNDICE

1. [Gestão de Lavagens](#1-gestão-de-lavagens)
2. [Gestão de Clientes](#2-gestão-de-clientes)
3. [Gestão de Despesas](#3-gestão-de-despesas)
4. [Fechamento Diário](#4-fechamento-diário)
5. [Relatórios Financeiros](#5-relatórios-financeiros)
6. [Backup e Restauração](#6-backup-e-restauração)
7. [PWA (App Instalável)](#7-pwa-app-instalável)
8. [Atalhos de Teclado](#8-atalhos-de-teclado)

---

## 1. GESTÃO DE LAVAGENS

### 1.1 Adicionar Nova Lavagem

**Como fazer**:
1. Clique na aba **"Lavagens"**
2. Preencha o formulário:
   - **Tipo de lavagem**: Simples, Completa, Premium, Polimento, Enceramento
   - **Valor**: Digite o valor (ex: 50.00)
   - **Placa do veículo**: AAA-1234 ou AAA1B34
   - **Cliente** (opcional): Selecione da lista ou deixe vazio
   - **Forma de pagamento**: Dinheiro, PIX, Cartão Débito, Cartão Crédito
3. Clique em **"Adicionar Lavagem"**

**Recursos**:
- ✅ Validação automática de placa (formato brasileiro)
- ✅ Autocomplete de clientes ao digitar
- ✅ Busca de cliente por nome ou placa
- ✅ Valor com máscara de moeda (R$)
- ✅ Cliente opcional (para lavagens avulsas)

**Valores padrão sugeridos**:
- Simples: R$ 30,00
- Completa: R$ 50,00
- Premium: R$ 80,00
- Polimento: R$ 120,00
- Enceramento: R$ 100,00

---

### 1.2 Visualizar Lavagens

**Filtros disponíveis**:
- **Por data**: Selecione data específica
- **Por período**: Escolha data início e fim
- **Por placa**: Digite placa do veículo
- **Por forma de pagamento**: Filtre por tipo de pagamento

**Informações mostradas**:
- Data e hora da lavagem
- Tipo de lavagem
- Placa do veículo
- Nome do cliente (se cadastrado)
- Valor
- Forma de pagamento
- Badge de cliente frequente (se aplicável)

**Ações**:
- 🗑️ **Deletar lavagem** (botão vermelho)

---

### 1.3 Resumo Financeiro

No topo da tela você vê:
- **Hoje**: Receita do dia atual
- **Este Mês**: Receita acumulada do mês
- **Este Ano**: Receita total do ano

**Atualização**: Em tempo real após cada lavagem

---

## 2. GESTÃO DE CLIENTES

### 2.1 Adicionar Novo Cliente

**Como fazer**:
1. Clique na aba **"Clientes"**
2. Clique em **"+ Novo Cliente"**
3. Preencha:
   - **Nome**: Nome completo do cliente
   - **Telefone**: (11) 98888-7777
   - **Placa do veículo**: AAA-1234
   - **Email** (opcional)
4. Clique em **"Salvar"**

**Validações**:
- ✅ Nome obrigatório (mínimo 3 caracteres)
- ✅ Telefone com máscara automática
- ✅ Placa no formato brasileiro
- ✅ Email validado (se preenchido)

---

### 2.2 Visualizar Clientes

**Filtros**:
- **Busca por nome**: Digite para filtrar
- **Busca por placa**: Digite placa

**Informações mostradas**:
- Nome do cliente
- Telefone
- Placa do veículo
- Email
- **Badge de categoria**:
  - 🌟 **Frequente**: 5+ lavagens
  - 👤 **Ocasional**: 2-4 lavagens
  - 🆕 **Novo**: 0-1 lavagens

**Estatísticas do cliente**:
- Total de lavagens
- Total gasto
- Ticket médio
- Última lavagem

---

### 2.3 Editar Cliente

**Como fazer**:
1. Clique no botão **"✏️ Editar"** ao lado do cliente
2. Modifique os dados
3. Clique em **"Salvar"**

---

### 2.4 Deletar Cliente

**Como fazer**:
1. Clique no botão **"🗑️ Deletar"**
2. Confirme a ação

⚠️ **Atenção**: Deleta o cliente mas **mantém suas lavagens** no histórico

---

### 2.5 Histórico de Lavagens do Cliente

**Como visualizar**:
1. Clique no cliente para expandir
2. Veja todas as lavagens desse cliente:
   - Data e hora
   - Tipo de lavagem
   - Valor
   - Forma de pagamento

---

## 3. GESTÃO DE DESPESAS

### 3.1 Adicionar Nova Despesa

**Como fazer**:
1. Clique na aba **"Despesas"**
2. Preencha o formulário:
   - **Descrição**: Ex: "Salário João"
   - **Valor**: Digite o valor
   - **Tipo**: Funcionário, Produto, Marmita, Aluguel, Conta, Outro
   - **Data** (opcional): Padrão é hoje
3. Clique em **"Adicionar Despesa"**

**Tipos de despesa**:
- 👤 **Funcionário**: Salários, comissões
- 🧴 **Produto**: Shampoo, cera, panos
- 🍱 **Marmita**: Alimentação
- 🏠 **Aluguel**: Aluguel do espaço
- 💡 **Conta**: Água, luz, internet
- 📦 **Outro**: Outras despesas

---

### 3.2 Editar Despesa (Inline)

**Como fazer**:
1. Clique no botão **"✏️"** da despesa
2. Campos ficam editáveis
3. Modifique:
   - Descrição
   - Valor
   - Tipo
4. Clique em **"💾 Salvar"** (checkmark verde)
5. Ou **"✖️ Cancelar"** (X vermelho)

**Recurso único**: Edição direta na tabela, sem popup!

---

### 3.3 Deletar Despesa

**Como fazer**:
1. Clique no botão **"🗑️ Deletar"**
2. Confirme a ação

---

### 3.4 Filtrar Despesas

**Filtros disponíveis**:
- **Hoje**: Despesas de hoje
- **Este Mês**: Despesas do mês atual
- **Período**: Escolha data início e fim
- **Por tipo**: Filtre por categoria

---

### 3.5 Resumo de Despesas

**No topo da tela**:
- **Total de Despesas**: Soma filtrada
- **Breakdown por tipo**: Quanto gastou em cada categoria

**Exemplo**:
```
Total de Despesas: R$ 1.250,00
├─ Funcionário: R$ 600,00
├─ Produto: R$ 300,00
├─ Marmita: R$ 150,00
├─ Aluguel: R$ 100,00
└─ Conta: R$ 100,00
```

---

## 4. FECHAMENTO DIÁRIO

### 4.1 Visualizar Fechamento do Dia

**Como acessar**:
1. Clique na aba **"Fechamento"**
2. Veja automaticamente o resumo de hoje

**Informações mostradas**:
- **Receitas**:
  - Total de lavagens
  - Quantidade de lavagens
  - Breakdown por forma de pagamento
- **Despesas**:
  - Total de despesas
  - Breakdown por tipo
- **Resultado**:
  - Lucro/Prejuízo do dia
  - Margem de lucro (%)

---

### 4.2 Encerrar o Dia

**Como fazer**:
1. Revise o resumo do dia
2. Digite **observações** (opcional):
   - Ex: "Movimento fraco devido à chuva"
   - Ex: "Muito movimentado, fila de espera"
3. Clique em **"Encerrar Dia"**

**O que acontece**:
- ✅ Cria registro de fechamento
- ✅ Salva snapshot do dia
- ✅ Armazena observações
- ✅ Calcula lucro líquido

---

### 4.3 Histórico de Fechamentos

**Como visualizar**:
1. Role para baixo na aba **"Fechamento"**
2. Veja lista de fechamentos anteriores:
   - Data do fechamento
   - Receita total
   - Despesas totais
   - Lucro/Prejuízo
   - Observações
   - Data/hora do fechamento

**Ordenação**: Mais recentes primeiro

---

### 4.4 Consultar Fechamento Anterior

**Como fazer**:
1. Selecione outra data no filtro
2. Veja o fechamento daquele dia
3. Verifique se já foi encerrado

---

## 5. RELATÓRIOS FINANCEIROS

### 5.1 Relatório Diário

**Como gerar**:
1. Clique na aba **"Relatórios"**
2. Selecione **"Diário"**
3. Escolha a data
4. Clique em **"📊 Atualizar"**

**Informações**:
- KPIs visuais (Receita, Despesa, Lucro)
- Gráfico de barras (Receita vs Despesa)
- Breakdown por forma de pagamento (gráfico pizza)
- Lista de lavagens do dia
- Lista de despesas do dia

---

### 5.2 Relatório Semanal

**Como gerar**:
1. Selecione **"Semanal"**
2. Clique em **"📊 Atualizar"**

**Informações**:
- Últimos 7 dias
- Gráfico de linha (evolução diária)
- Comparativo semana atual vs anterior
- Média diária de receita
- Dia com maior movimento

---

### 5.3 Relatório Mensal

**Como gerar**:
1. Selecione **"Mensal"**
2. Escolha mês e ano
3. Clique em **"📊 Atualizar"**

**Informações**:
- Receita total do mês
- Despesas totais do mês
- Lucro líquido
- Margem de lucro
- Gráfico de evolução diária
- Comparativo com mês anterior
- Top 5 clientes do mês
- Forma de pagamento mais usada

---

### 5.4 Gráficos Interativos

**Recursos**:
- 📊 **Hover**: Passe o mouse para ver valores exatos
- 🎨 **Cores**: Verde (receita), Vermelho (despesa), Azul (lucro)
- 📈 **Tipos**:
  - Barras: Comparação Receita x Despesa
  - Pizza: Distribuição de pagamentos
  - Linha: Evolução temporal

---

## 6. BACKUP E RESTAURAÇÃO

### 6.1 Backup Automático

**Funcionamento**:
- ✅ Roda automaticamente **todos os dias às 23h**
- ✅ Salva arquivo `.db.gz` compactado
- ✅ Armazena em `backend/backups/`
- ✅ Mantém últimos **30 backups**
- ✅ Deleta backups antigos automaticamente

**Formato do arquivo**:
```
backup_2025-10-17_23-00-00.db.gz
```

---

### 6.2 Backup Manual

**Como fazer**:
1. Clique no botão **"💾 Backup Manual"** (se implementado)
2. Ou copie manualmente:
   ```
   backend/database/lavacar.db
   ```

**Quando usar**:
- Antes de atualizar o sistema
- Antes de fazer mudanças grandes
- Antes de restaurar um backup antigo

---

### 6.3 Restaurar Backup

**Como fazer**:
1. Pare o servidor backend
2. Navegue até `backend/backups/`
3. Descompacte o backup desejado:
   ```bash
   gunzip backup_2025-10-17_23-00-00.db.gz
   ```
4. Copie para `backend/database/`:
   ```bash
   cp backup_2025-10-17_23-00-00.db ../database/lavacar.db
   ```
5. Reinicie o servidor

⚠️ **Atenção**: Isso sobrescreve os dados atuais!

---

## 7. PWA (APP INSTALÁVEL)

### 7.1 Instalar no Desktop (Windows/Mac/Linux)

**Chrome/Edge**:
1. Acesse o sistema
2. Na barra de endereço, clique no ícone **"⊕ Instalar"**
3. Clique em **"Instalar"**
4. Pronto! App aparece na área de trabalho

**Firefox**:
1. Acesse o sistema
2. Menu (≡) → **"Instalar Site"**

---

### 7.2 Instalar no Celular (Android)

**Chrome**:
1. Acesse o sistema
2. Menu (⋮) → **"Instalar app"** ou **"Adicionar à tela inicial"**
3. Clique em **"Instalar"**
4. Ícone aparece na tela inicial

**Samsung Internet**:
1. Menu → **"Adicionar página a"** → **"Tela inicial"**

---

### 7.3 Instalar no iPhone/iPad (iOS)

**Safari**:
1. Acesse o sistema
2. Botão **Compartilhar** (⬆️)
3. **"Adicionar à Tela de Início"**
4. Clique em **"Adicionar"**

---

### 7.4 Funcionalidades Offline

**O que funciona offline**:
- ✅ Interface completa carrega
- ✅ Visualização de dados já carregados
- ✅ Navegação entre telas

**O que NÃO funciona offline**:
- ❌ Adicionar novas lavagens
- ❌ Buscar dados atualizados
- ❌ Salvar modificações

**Sincronização**:
- Quando voltar online, os dados são atualizados automaticamente

---

### 7.5 Desinstalar PWA

**Desktop**:
- Clique com botão direito no ícone → **"Desinstalar"**
- Ou nas configurações do navegador → Apps instalados

**Celular**:
- Mantenha pressionado o ícone → **"Desinstalar"**

---

## 8. ATALHOS DE TECLADO

### 8.1 Navegação Global

- **Tab**: Navegar entre campos
- **Enter**: Confirmar ação / Submeter formulário
- **Esc**: Fechar modais / Cancelar ação

### 8.2 Formulários

- **Ctrl + Enter**: Salvar formulário
- **Tab**: Próximo campo
- **Shift + Tab**: Campo anterior

### 8.3 Filtros e Busca

- **Ctrl + F**: Focar no campo de busca (se disponível)
- **Esc**: Limpar filtros

---

## 📊 DICAS DE USO

### ✅ Boas Práticas

1. **Cadastre clientes frequentes** para:
   - Agilizar registro de lavagens
   - Gerar relatórios de fidelidade
   - Enviar promoções (futuro)

2. **Registre despesas diariamente** para:
   - Controle financeiro preciso
   - Identificar onde economizar
   - Calcular lucro real

3. **Faça fechamento diário** para:
   - Rastrear performance
   - Identificar dias problemáticos
   - Tomar decisões baseadas em dados

4. **Use relatórios semanais/mensais** para:
   - Planejar metas
   - Comparar períodos
   - Avaliar crescimento

5. **Verifique backups regularmente** para:
   - Garantir segurança dos dados
   - Poder restaurar se necessário

### ⚡ Atalhos no Dia a Dia

**Fluxo rápido para adicionar lavagem**:
1. Digite placa → Sistema busca cliente
2. Selecione tipo de lavagem
3. Confirme valor sugerido
4. Enter para salvar
5. Pronto! ~10 segundos

**Fechamento diário em 1 minuto**:
1. Aba Fechamento
2. Revise valores
3. Digite observação (opcional)
4. Encerrar dia

---

## 🔧 CONFIGURAÇÕES AVANÇADAS

### Personalizar Tipos de Lavagem

**Edite**: `backend/src/routes/lavagens.ts`

```typescript
// Adicione novos tipos aqui
tipoLavagem: z.enum([
  'simples',
  'completa',
  'premium',
  'polimento',
  'enceramento',
  'SEU_NOVO_TIPO' // ← Adicione
])
```

### Personalizar Tipos de Despesa

**Edite**: `backend/src/routes/despesas.ts`

```typescript
tipo: z.enum([
  'funcionario',
  'produto',
  'marmita',
  'aluguel',
  'conta',
  'outro',
  'SEU_NOVO_TIPO' // ← Adicione
])
```

### Mudar Horário do Backup

**Edite**: `backend/src/server.ts`

```typescript
// Formato: minuto hora dia mês dia-da-semana
cron.schedule('0 23 * * *', ...) // 23h todos os dias
// Para 21h: '0 21 * * *'
// Para 6h: '0 6 * * *'
```

---

## 🎓 TUTORIAIS EM VÍDEO (Futuro)

Planejamos criar tutoriais em vídeo mostrando:
- ✅ Como usar cada funcionalidade
- ✅ Fluxo de trabalho diário
- ✅ Geração de relatórios
- ✅ Instalação do PWA

---

## 📞 SUPORTE

Se tiver dúvidas sobre alguma funcionalidade:

1. **Leia este guia** completo
2. **Experimente** a funcionalidade
3. **Verifique o console** (F12) para erros
4. **Consulte logs** do backend

---

**🎉 Aproveite o Sistema Lava Car!**

_Guia atualizado em: 17/10/2025_
_Versão do sistema: 3.0.0_

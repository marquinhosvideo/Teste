# Roteiro — Orlando 2026

App web mobile-first para a viagem em família a Orlando: roteiro dia a dia (Manhã / Tarde / Noite), checks, gastos por orçamento e sync na nuvem.

## Como usar

```bash
npm install
cp .env.example .env   # opcional: ligar sync compartilhado
npm run dev
```

### Sync da família (recomendado)

Sem `.env`, o app funciona **só neste aparelho**.  
Com Supabase configurado, checks e gastos ficam no banco com login — qualquer um da família no site vê a mesma atualização em tempo real.

Passo a passo: **[SYNC.md](./SYNC.md)** (também compara Excel/OneDrive vs Supabase).

### Abas

- **Hoje** — dia ativo + widgets de orçamento
- **Roteiro** — todos os dias com checks
- **Gastos** — Marcos / Dielen / Helena / Alimentação / Outros
- **Dicas** — ressalvas da planilha
- **Excel** — baixar/reimportar o roteiro

### Orçamentos (topo)

Teto provisório **R$ 5.000** cada — depois ajustamos os valores reais.

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` — build de produção
- `npm run preview` — preview do build

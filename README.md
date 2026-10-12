# Roteiro — Orlando 2026

App web mobile-first para a viagem em família a Orlando: acompanhar o roteiro dia a dia (Manhã / Tarde / Noite), marcar o que já foi feito e registrar gastos por categoria.

O roteiro padrão vem da planilha `Roteiro_Orlando_2026.xlsx`.

## Como usar

```bash
npm install
npm run dev
```

Abra no celular (mesma rede) ou use o DevTools em modo mobile.

### Abas

- **Hoje** — dia ativo, progresso e gastos do dia
- **Roteiro** — todos os dias da viagem com checks
- **Gastos** — registrar e filtrar por categoria (USD)
- **Dicas** — ressalvas da aba “Dicas e ressalvas” do Excel
- **Excel** — baixar/reimportar a planilha

### Formato do Excel

Aba **Roteiro completo**: Data, Dia, Tipo do dia, Manhã, Tarde, Noite, Lugares e endereços, Observações.

Os checks e gastos ficam salvos no navegador (`localStorage`) deste aparelho.

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` — build de produção
- `npm run preview` — preview do build

# Roteiro — viagem em família

App web mobile-first para acompanhar a programação da viagem, marcar o que já foi feito e registrar quanto foi gasto no dia (por categoria).

## Como usar

```bash
npm install
npm run dev
```

Abra no celular (mesma rede) ou use o DevTools em modo mobile.

### Importar seu Excel

1. Abra a aba **Importar**
2. Baixe o **modelo Excel**
3. Preencha:
   - **Roteiro**: Data, Dia, Horário, Atividade, Local, Observações
   - **Gastos** (opcional): Data, Categoria, Descrição, Valor
   - **Viagem** (opcional): Nome, Destino, Moeda
4. Envie o arquivo `.xlsx` ou `.csv`

Os checks e gastos ficam salvos no navegador (`localStorage`) deste aparelho.

### Categorias de gasto

Alimentação · Transporte · Hospedagem · Atividades · Compras · Outros

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` — build de produção
- `npm run preview` — preview do build

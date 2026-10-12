# Sync compartilhado — opções simples

O app precisa que **checks** e **gastos** fiquem iguais para toda a família no site.

## Comparando caminhos simples

| Opção | Esforço | Auth | Vários editando juntos | Recomendado |
| --- | --- | --- | --- | --- |
| **Supabase** (implementado) | ~10 min | E-mail/senha | Sim (tempo real) | **Sim** |
| Google Sheets + Apps Script | Médio | Token/secreto | Frágil | Se quiser “planilha” |
| Excel no OneDrive/SharePoint | Alto (Graph API) | Conta Microsoft | Ruim (conflitos de célula) | Só leitura |
| Só `localStorage` | Zero | Não | Não | Só teste no seu celular |

Excel aberto na internet **não** é bom para checkbox + gastos simultâneos: duas pessoas salvam e uma sobrescreve a outra. Por isso o app usa **Supabase** (Postgres grátis + login + realtime).

---

## Como ligar o Supabase (recomendado)

1. Crie um projeto em [supabase.com](https://supabase.com) (free).
2. **SQL Editor** → cole e rode o arquivo `supabase/schema.sql`.
3. Em **Database → Publications / Replication**, confirme que `activity_checks` e `expenses` estão no Realtime (o SQL já tenta adicionar).
4. Em **Authentication → Providers → Email**:
   - deixe Email habilitado;
   - para a família, desative **Confirm email** (senão o primeiro login fica bloqueado).
5. Em **Settings → API**, copie:
   - Project URL
   - `anon` `public` key
6. No projeto:

```bash
cp .env.example .env
# edite .env com URL e anon key
npm run dev
```

7. No site: **Criar conta da família** (um e-mail/senha compartilhados bastam) → Entrar.
8. Em outro celular/navegador: mesmo login → checks e gastos aparecem iguais e atualizam ao vivo.

### O que vai para o banco

- Checks das atividades (`activity_checks`)
- Gastos (`expenses` + orçamento Marcos/Dielen/Helena/Alimentação/Outros)

O roteiro (textos Manhã/Tarde/Noite) continua no app / Excel; só o **estado ao vivo** fica na nuvem.

---

## Alternativa: Excel / OneDrive

Dá para usar depois como **espelho de leitura** (exportar gastos para planilha), mas não como banco principal. Se quiser esse espelho, avise e encaixamos exportação automática.

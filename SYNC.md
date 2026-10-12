# Passo a passo: Supabase + projeto GitHub

Este guia liga o banco (checks e gastos) ao app do repositório
`https://github.com/marquinhosvideo/Teste` (branch do Roteiro Orlando).

---

## Parte 1 — Criar a base no Supabase

### 1. Conta e projeto

1. Abra [https://supabase.com](https://supabase.com) e faça login (GitHub, Google, etc.).
2. Clique em **New project**.
3. Preencha:
   - **Name:** `roteiro-orlando` (ou outro nome)
   - **Database password:** anote em local seguro (não vai no GitHub)
   - **Region:** escolha a mais perto (ex.: South America / US East)
4. Clique em **Create new project** e espere ~1–2 minutos até ficar **Ready**.

### 2. Criar as tabelas (SQL)

1. No menu lateral: **SQL** → **SQL Editor** → **New query**.
2. Abra no GitHub o arquivo  
   [`supabase/schema.sql`](./supabase/schema.sql)  
   (no repo: pasta `supabase` → `schema.sql`).
3. Copie **todo** o conteúdo e cole no editor do Supabase.
4. Clique em **Run** (canto inferior direito).
5. Deve aparecer sucesso. Confira em **Table Editor**:
   - `activity_checks`
   - `expenses`

### 3. Ativar Realtime (para atualizar ao vivo)

1. Vá em **Database** → **Publications** (ou **Replication**).
2. Abra a publication `supabase_realtime`.
3. Confirme que `activity_checks` e `expenses` estão marcadas.  
   (O SQL já tenta adicionar; se não aparecerem, marque manualmente e salve.)

### 4. Autenticação por e-mail (família)

1. Vá em **Authentication** → **Providers** → **Email**.
2. Deixe **Email** habilitado.
3. **Desative** a opção **Confirm email** (importante: senão o primeiro login fica bloqueado até confirmar o e-mail).
4. Salve.

### 5. Copiar as chaves da API

1. Vá em **Project Settings** (ícone de engrenagem) → **API**.
2. Anote:
   - **Project URL** → algo como `https://xxxx.supabase.co`
   - **anon public** key → chave longa (começa com `eyJ...`)

> Use só a chave **anon**. Nunca coloque a **service_role** no frontend nem no GitHub público.

---

## Parte 2 — Conectar ao projeto do GitHub

### Opção A — Rodar no seu computador (teste)

1. Clone o repositório (ou abra no Cursor / VS Code):

```bash
git clone https://github.com/marquinhosvideo/Teste.git
cd Teste
git checkout cursor/familia-viagem-tracker-7f72
```

(Se o PR já tiver sido mergeado em `main`, use `main`.)

2. Instale as dependências:

```bash
npm install
```

3. Crie o arquivo `.env` na raiz (não vai para o Git — já está no `.gitignore`):

```bash
cp .env.example .env
```

4. Edite o `.env` com os valores do Supabase:

```env
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...sua_anon_key
```

5. Suba o app:

```bash
npm run dev
```

6. Abra o endereço que o Vite mostrar (ex.: `http://localhost:5173`).
7. Na tela de login:
   - **Criar conta da família** (e-mail + senha, mín. 6 caracteres), ou
   - **Entrar**, se já criou.
8. Marque um check ou registre um gasto → o badge deve mostrar **Nuvem ao vivo**.
9. Em outro navegador/celular (mesmo Wi‑Fi ou túnel), entre com a **mesma conta** e confira se aparece igual.

### Opção B — Publicar o site (Vercel / Netlify) a partir do GitHub

Assim a família acessa pela internet, não só no seu PC.

#### Vercel (exemplo)

1. Acesse [https://vercel.com](https://vercel.com) e faça login com **GitHub**.
2. **Add New Project** → importe `marquinhosvideo/Teste`.
3. Em **Environment Variables**, adicione:

| Name | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | sua anon key |

4. Framework: **Vite** (detecta sozinho). Build: `npm run build`, output: `dist`.
5. Deploy.
6. Abra a URL gerada (ex.: `https://teste-xxx.vercel.app`) → login da família → pronto.

#### Netlify (alternativa)

1. [https://netlify.com](https://netlify.com) → login com GitHub → **Add new site** → import repo.
2. Build command: `npm run build` · Publish directory: `dist`.
3. **Site settings → Environment variables** → mesmas `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
4. Deploy.

> As variáveis `VITE_*` entram no build do frontend. Por isso usamos só a chave **anon** + RLS (só usuário logado lê/escreve).

---

## Parte 3 — Checklist rápido

- [ ] Projeto Supabase criado  
- [ ] `schema.sql` executado (tabelas `activity_checks` e `expenses`)  
- [ ] Realtime ligado nas duas tabelas  
- [ ] Confirm email desativado  
- [ ] `.env` local **ou** variáveis no Vercel/Netlify  
- [ ] Conta da família criada no app  
- [ ] Teste em 2 aparelhos com o mesmo login  

---

## O que fica no banco

| Tabela | Conteúdo |
| --- | --- |
| `activity_checks` | Check de cada atividade (feito / não feito) |
| `expenses` | Gastos (dia, orçamento, descrição, valor) |

O texto do roteiro (Manhã/Tarde/Noite) continua no app / Excel. Só o **estado ao vivo** vai para o Supabase.

---

## Problemas comuns

| Sintoma | O que fazer |
| --- | --- |
| “Invalid API key” / não conecta | URL e anon key no `.env` ou no deploy; reinicie `npm run dev` depois de editar `.env` |
| Cria conta e não entra | Desative **Confirm email** no Supabase |
| Marca check e o outro celular não atualiza | Confirme Realtime nas tabelas; os dois precisam estar logados |
| Badge “Só neste aparelho” | Falta `.env` / variáveis de ambiente no deploy |
| Erro de permissão (RLS) | Rode de novo o `schema.sql` (policies) e use usuário autenticado |

---

## Segurança (resumo)

- **Pode** ir no frontend / Vercel: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
- **Nunca** no GitHub nem no site: senha do banco, chave `service_role`
- O arquivo `.env` local **não** deve ser commitado (já está ignorado)

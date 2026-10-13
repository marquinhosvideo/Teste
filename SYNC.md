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

### 4b. Liberar só 1 ou 2 e-mails (controle de quem acessa)

1. No **SQL Editor**, abra o arquivo do repo [`supabase/allowlist.sql`](./supabase/allowlist.sql).
2. **Antes de rodar**, edite as linhas do `insert` e coloque **só** os e-mails liberados, por exemplo:

```sql
insert into public.allowed_emails (email) values
  ('seuemail@gmail.com'),
  ('conjuge@gmail.com')
on conflict (email) do nothing;
```

3. Rode o SQL (**Run**).
4. No `.env` do app, use a mesma lista:

```env
VITE_ALLOWED_EMAILS=seuemail@gmail.com,conjuge@gmail.com
```

Efeito:
- Só esses e-mails aparecem / podem criar conta e entrar.
- Qualquer outro e-mail é bloqueado no app **e** no banco (mesmo que alguém tente burlar o site).

Para liberar ou remover alguém depois:

```sql
insert into public.allowed_emails (email) values ('novo@email.com');
-- ou
delete from public.allowed_emails where email = 'antigo@email.com';
```

E atualize também o `VITE_ALLOWED_EMAILS` no `.env` / Vercel.

### 5. Copiar a URL e a chave da API (detalhado)

O menu do Supabase mudou. **Não existe mais** só “Settings → API” em todos os projetos. Use um destes caminhos:

#### Caminho A — botão Connect (mais fácil)

1. Com o **projeto aberto** (não na lista de organizações).
2. No topo da página do projeto, procure o botão **Connect** (às vezes ao lado do nome do projeto).
3. Abra o diálogo **Connect**.
4. Se pedir framework, escolha **Vite** ou **App Frameworks** / **React**.
5. Você verá algo como:
   - `VITE_SUPABASE_URL=https://abcdefgh.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=...` **ou** `VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...`
6. Copie os dois valores (URL + chave pública).

#### Caminho B — Settings → API Keys

1. No menu da **esquerda**, role até o fim e clique na **engrenagem** **Project Settings**.
2. No submenu de Settings, clique em **API Keys**  
   (em alguns projetos ainda aparece **API**; nos novos é **API Keys**).
3. Há abas, por exemplo:
   - **Publishable and secret API keys** (novo), ou
   - **Legacy API keys** (`anon` / `service_role`)
4. Copie a chave **pública**:
   - Preferência: **publishable** (`sb_publishable_...`), **ou**
   - Legado: **anon** / **anon public** (JWT longo começando com `eyJ...`)
5. A **URL do projeto** pode estar:
   - no mesmo diálogo **Connect**, ou
   - em **Integrations → Data API**, ou
   - no formato `https://<ref-do-projeto>.supabase.co`  
     O `<ref>` é o id curto do projeto (também aparece na URL do browser:  
     `https://supabase.com/dashboard/project/abcdefgh` → URL = `https://abcdefgh.supabase.co`).

#### O que NÃO copiar

| Pode usar no app | Nunca use no frontend / GitHub |
| --- | --- |
| URL `https://xxxx.supabase.co` | Senha do banco (Database password) |
| Chave **anon** ou **publishable** | Chave **service_role** ou **secret** (`sb_secret_...`) |

No `.env` do nosso app, a chave pública vai em `VITE_SUPABASE_ANON_KEY`  
(mesmo que seja a chave **publishable** nova — o nome da variável continua esse).

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

Isso cria um arquivo chamado `.env` copiado do modelo `.env.example`.

4. **Como editar o `.env`** (escolha um jeito):

##### No Cursor / VS Code (recomendado)

1. Na barra lateral de **arquivos** (Explorer), na raiz do projeto `Teste`, procure `.env`.  
   Se não aparecer: arquivos que começam com ponto às vezes ficam ocultos — use `Ctrl+P` (ou `Cmd+P` no Mac), digite `.env` e Enter.
2. Abra o arquivo. Você verá algo assim:

```env
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

3. **Substitua** só os valores depois do `=`, sem aspas e sem espaço:
   - No lugar de `https://SEU_PROJETO.supabase.co` → sua Project URL  
   - No lugar de `sua_anon_key_aqui` → sua chave **anon** ou **publishable**
4. Exemplo final (valores inventados):

```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

ou, se o Supabase mostrou chave nova:

```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxx
```

5. Salve: `Ctrl+S` (Windows/Linux) ou `Cmd+S` (Mac).

##### No Bloco de Notas / TextEdit (Windows)

1. Abra a pasta do projeto no Explorer (onde estão `package.json` e `src`).
2. Se não vir `.env`: em **Exibir**, marque **Itens ocultos**.
3. Clique com o botão direito em `.env` → **Abrir com** → Bloco de Notas.
4. Cole/substitua as duas linhas como no exemplo acima → Salvar.

##### No terminal (nano)

```bash
nano .env
```

Edite as duas linhas, depois `Ctrl+O` Enter para salvar e `Ctrl+X` para sair.

**Cuidados:**
- Não coloque aspas (`"`) em volta dos valores.
- Não deixe espaço antes/depois do `=`.
- Não commit o `.env` no GitHub.
- Depois de salvar o `.env`, **pare** o `npm run dev` (`Ctrl+C`) e rode de novo — o Vite só lê o `.env` na subida.

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

### Opção B — Publicar na internet com Vercel (recomendado)

Assim a família abre o app no celular por um link `https://....vercel.app`, sem `npm run dev`.

#### 1) Garanta que o código está no GitHub

A branch com o app completo é:

`cursor/familia-viagem-tracker-7f72`

No seu PC (se ainda não atualizou):

```bash
git fetch origin
git checkout cursor/familia-viagem-tracker-7f72
git pull origin cursor/familia-viagem-tracker-7f72
```

#### 2) Crie a conta e importe o projeto

1. Abra [https://vercel.com](https://vercel.com)
2. **Continue with GitHub** e autorize o acesso ao repo `marquinhosvideo/Teste`
3. Clique em **Add New… → Project**
4. Selecione o repositório **Teste**
5. Em **Configure Project**:
   - **Framework Preset:** Vite (geralmente detecta sozinho)
   - **Root Directory:** `.` (raiz)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
6. Em **Branch**: escolha `cursor/familia-viagem-tracker-7f72`  
   (ou `main`, se você já tiver feito merge do PR)

#### 3) Variáveis de ambiente (obrigatório)

Antes de clicar em Deploy, abra **Environment Variables** e adicione **as 3**:

| Name | Value (exemplo) | Ambientes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | `https://twcztkpxoyoxarlkfedy.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | sua chave `eyJ...` (Legacy anon) ou `sb_publishable_...` | Production, Preview, Development |
| `VITE_ALLOWED_EMAILS` | `marcos.coelho19@gmail.com,dielen.brum@hotmail.com` | Production, Preview, Development |

Marque Production + Preview em cada uma.

> Use os **mesmos valores do seu `.env` local**.  
> Nunca coloque a chave `service_role` / `sb_secret_...`.

#### 4) Deploy

1. Clique em **Deploy**
2. Espere o build ficar verde (1–2 min)
3. Clique em **Visit** — URL tipo:  
   `https://teste-xxxxx.vercel.app`

#### 5) Ajuste o Supabase para a URL pública

1. Supabase → **Authentication → URL Configuration**
2. **Site URL:** cole a URL do Vercel  
   ex.: `https://teste-xxxxx.vercel.app`
3. Em **Redirect URLs**, adicione:
   - `https://teste-xxxxx.vercel.app/**`
   - `http://localhost:5173/**` (para continuar testando no PC)
4. Salve

#### 6) Teste no celular

1. Abra a URL do Vercel no Chrome/Safari
2. Entre com o e-mail autorizado
3. Marque um check / lance um gasto
4. Em outro aparelho, com o outro e-mail (ou o mesmo), confira se atualiza

#### Se mudar o `.env` / variáveis depois

No Vercel: **Project → Settings → Environment Variables** → edite →  
**Deployments → Redeploy** (senão o site continua com a build antiga).

#### Netlify (alternativa)

1. [https://netlify.com](https://netlify.com) → login com GitHub → import repo
2. Branch: `cursor/familia-viagem-tracker-7f72`
3. Build: `npm run build` · Publish: `dist`
4. Mesmas 3 variáveis `VITE_*`
5. Ajuste Site URL / Redirect no Supabase para a URL da Netlify

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
| **Failed to fetch** ao criar conta / entrar | 1) Confira `.env`: URL `https://xxxx.supabase.co` (sem aspas, sem `/` no final) e chave anon/publishable. 2) Salve o `.env`. 3) Pare o `npm run dev` (`Ctrl+C`) e rode de novo. 4) Teste no Chrome sem extensão de bloqueio. 5) Se a conta já existir, use **Entrar**. |
| “User already registered” / já tem conta | Na tela, clique **Já tem conta? Entrar** e use a senha. Se esqueceu: Supabase → **Authentication → Users** → usuário → **Send password recovery** ou defina nova senha. |
| “Invalid API key” / não conecta | URL e anon key no `.env` ou no deploy; reinicie `npm run dev` depois de editar `.env` |
| Cria conta e não entra | Desative **Confirm email** no Supabase |
| Marca check e o outro celular não atualiza | Confirme Realtime nas tabelas; os dois precisam estar logados |
| Badge “Só neste aparelho” | Falta `.env` / variáveis de ambiente no deploy |
| Erro de permissão (RLS) | Rode de novo o `schema.sql` / `allowlist.sql` e use e-mail liberado |

---

## Redirect de recovery / Site URL

O e-mail de “Recovery password” usa a **Site URL** do Supabase. Por padrão costuma ser `http://localhost:3000`, mas o Vite deste projeto roda em **`http://localhost:5173`**.

### Ajuste no Supabase

1. **Authentication** → **URL Configuration** (ou **Settings → Authentication**).
2. **Site URL:** `http://localhost:5173`
3. Em **Redirect URLs**, adicione:
   - `http://localhost:5173/**`
   - (depois, no deploy) `https://seu-site.vercel.app/**`
4. Salve.

### Jeito mais rápido de definir senha (sem e-mail)

1. Supabase → **Authentication → Users**
2. Abra o usuário
3. Defina **Password** manualmente e salve
4. No app, use **Entrar** com e-mail + essa senha

### Se o link abriu em localhost:3000

1. Com `npm run dev` rodando, troque na barra do navegador só a porta:  
   `http://localhost:3000/#access_token=...` → `http://localhost:5173/#access_token=...`  
   (mantenha o `#access_token=...` inteiro)
2. O app abre a tela **Nova senha**.

## Segurança (resumo)

- **Pode** ir no frontend / Vercel: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
- **Nunca** no GitHub nem no site: senha do banco, chave `service_role`
- O arquivo `.env` local **não** deve ser commitado (já está ignorado)
- Não compartilhe links de recovery (contêm token de acesso)

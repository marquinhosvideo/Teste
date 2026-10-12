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

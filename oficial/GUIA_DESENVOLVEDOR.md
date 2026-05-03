# Guia do desenvolvedor — SIG Dona BEll

Este documento é o ponto de partida para **montar o ambiente**, **entender a arquitetura** e **alterar o código** com segurança. O contexto de negócio, requisitos e escopo funcional estão em [DOCUMENTACAO_SIG_DONA_BELL.md](./DOCUMENTACAO_SIG_DONA_BELL.md).

---

## 1. Visão geral técnica

| Camada | Tecnologia | Pasta |
|--------|------------|--------|
| API | Laravel (PHP), Sanctum (tokens), Eloquent | `backend-teste/` |
| SPA | Angular 19 (standalone components), RxJS, Bootstrap, Angular Material | `frontend/` |
| Banco | MySQL (schema legado com nomes de tabelas em português / singular em vários pontos) | configurado no `.env` |

Fluxo típico em desenvolvimento:

1. MySQL local com banco criado (ex.: `donabell`).
2. API Laravel em `http://127.0.0.1:8000` (`php artisan serve` na pasta `backend-teste`).
3. Angular em `http://localhost:4200` (`ng serve` na pasta `frontend`).
4. Login no painel; o token Sanctum é enviado em todas as requisições HTTP via interceptor.

---

## 2. Estrutura do repositório (`oficial/`)

```
oficial/
├── backend-teste/          # API Laravel (ponto de entrada: public/index.php)
├── frontend/               # SPA Angular
├── DOCUMENTACAO_SIG_DONA_BELL.md   # Requisitos, atores, escopo de negócio
├── GUIA_DESENVOLVEDOR.md           # Este arquivo
└── .cursor/rules/          # Regras do Cursor (ex.: padrão CRUD completo)
```

---

## 3. Pré-requisitos

- **PHP** 8.2+ (extensões comuns: `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`)
- **Composer**
- **Node.js** 20+ e **npm**
- **MySQL** 8.x (ou MariaDB compatível)
- Opcional: **Angular CLI** global (`npm i -g @angular/cli`) ou usar `npx ng` dentro de `frontend/`

---

## 4. Backend (`backend-teste/`)

### 4.1 Instalação

```bash
cd backend-teste
composer install
copy .env.example .env   # Windows; no Linux/macOS: cp .env.example .env
php artisan key:generate
```

### 4.2 Banco de dados (`.env`)

Ajuste as variáveis `DB_*` para o **MySQL da sua máquina** (não use credenciais de hospedagem no `.env` local):

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=donabell
DB_USERNAME=root
DB_PASSWORD=          # senha local; muitas instalações XAMPP usam vazio
```

Crie o banco no MySQL, importe dump se houver, ou rode migrations conforme o time definir:

```bash
php artisan migrate
```

**Cache, sessão e fila em desenvolvimento:** o `.env.example` sugere `CACHE_STORE=file`, `SESSION_DRIVER=file` e `QUEUE_CONNECTION=sync` para não depender das tabelas `cache`, `sessions` e `jobs` no MySQL. Os **dados do negócio** continuam nas tabelas da aplicação (`cliente`, `usuario`, `pedido`, etc.).

### 4.3 Subir a API

```bash
php artisan serve
```

Por padrão: `http://127.0.0.1:8000`. As rotas da API estão sob o prefixo `/api` (definido pelo Laravel em `bootstrap/app.php` / convenção `routes/api.php`).

**Apache (htdocs):** configure um VirtualHost ou alias apontando o **DocumentRoot** para `backend-teste/public`. O arquivo `public/index.php` carrega o autoload do Laravel (há comentários no próprio arquivo sobre caminhos em ambientes tipo hospedagem compartilhada).

### 4.4 Autenticação

- **POST** `/api/login` — corpo JSON com `email` e `senha` (sem acento em `senha` na chave).
- Resposta inclui `token` (Bearer) e dados do usuário.
- Demais rotas em `routes/api.php` usam middleware `auth:sanctum` (token no header `Authorization: Bearer ...`).

Comando útil após import de base:

```bash
php artisan admin:reset-senha admin --senha=admin
```

 redefine a senha do usuário cujo `email` é `admin` (ou outro e-mail passado como argumento). Ver `routes/console.php`.

### 4.5 Perfis e autorização

O modelo de usuário é `App\Models\Usuario` (tabela `usuario`, campo `tipo_perfil`). O middleware `perfil:PERFIL1,PERFIL2` restringe rotas a uma lista de perfis.

Valores usados no código (strings): `CLIENTE`, `VENDEDOR`, `GERENTE`, `PRODUCAO`, `ENTREGADOR`.

Implementação: `app/Http/Middleware/PerfilMiddleware.php`, registrado como alias `perfil` em `bootstrap/app.php`.

### 4.6 Mapa resumido da API (`routes/api.php`)

| Área | Método / caminho (prefixo `/api`) | Middleware de perfil |
|------|-------------------------------------|----------------------|
| Login | `POST /login` | — |
| Usuário atual | `GET /me` | `auth:sanctum` |
| Rotas (lista leitura ampla) | `GET /rotas` | `auth:sanctum` |
| Clientes CRUD | `apiResource` → `/clientes` | CLIENTE, VENDEDOR, GERENTE, ENTREGADOR |
| Produtos leitura | `GET /produtos`, `GET /produtos/{id}` | idem |
| Produtos escrita | `POST/PUT/DELETE` produtos | GERENTE |
| Pedidos + aprovar/rejeitar | `apiResource` + extras | idem comercial |
| Dashboard | `GET /dashboard` | idem |
| Relatórios | `GET /relatorios` | GERENTE |
| Produção | `GET /producao`, consolidação, `PUT` status | PRODUCAO, GERENTE |
| Entregas | `GET /entregas`, marcar entregue, reordenar | ENTREGADOR, GERENTE |
| Usuários CRUD | `apiResource` → `/usuarios` | GERENTE |
| Rotas CRUD (escrita) | `POST/GET/PUT/DELETE /rotas...` | GERENTE |

Sempre confira o arquivo real `routes/api.php` — ele é a fonte da verdade.

### 4.7 Eloquent e nomes de tabelas

O schema não segue o plural padrão do Laravel em todos os modelos. Exemplos:

| Model | Tabela (`$table`) | Observação |
|-------|-------------------|------------|
| `Usuario` | `usuario` | Autenticação Sanctum; senha no campo `senha` |
| `Cliente` | `cliente` | PK `Usuario_id` (não auto-increment “clássico”) |
| `Pedido` | `pedido` | |
| `ItemPedido` | `itens_pedido` | |
| `Produto` | `produto` | |

Ao criar validações `exists:tabela,coluna`, use exatamente o nome da tabela no MySQL (ex.: `pedido`, `produto`).

### 4.8 CORS

Arquivo `config/cors.php`: origens de produção (`donabel.site`) + padrão local (`localhost`/`127.0.0.1` nas portas comuns). Opcionalmente estenda com `CORS_ALLOWED_ORIGINS` no `.env` (lista separada por vírgula).

### 4.9 Padrão para novos recursos (CRUD)

No repositório existe a regra `.cursor/rules/crud-completo.mdc` (resumo):

- **Laravel:** `Route::apiResource`, controller com `index/store/show/update/destroy`, validação em `store`/`update`, model com `$fillable` e relacionamentos.
- **Angular:** serviço `*-painel.service.ts` com `listar`, `buscar`, `criar`, `atualizar`, `excluir`; listagem com tabela e modal ou página de formulário; confirmação ao excluir.

---

## 5. Frontend (`frontend/`)

### 5.1 Instalação e servidor de desenvolvimento

```bash
cd frontend
npm install
npx ng serve
```

Abra `http://localhost:4200/`.

### 5.2 URL da API — um único lugar

A URL base da API vem de **`src/environments/environment.ts`** (desenvolvimento) e **`environment.prod.ts`** (build de produção). O arquivo **`src/app/config/api.config.ts`** exporta:

```typescript
export const API_URL = environment.apiUrl;
```

**Todos os serviços que chamam a API devem importar `API_URL` de `api.config.ts`.** Não duplique `http://127.0.0.1:8000/api` nos serviços: isso quebra o build de produção e dificulta mudança de ambiente.

O `angular.json` usa `fileReplacements` na configuração **production** para trocar `environment.ts` por `environment.prod.ts`.

### 5.3 Autenticação no Angular

- **`AuthService`** (`services/auth.service.ts`): login, logout, `getToken()`, `getUsuario()`, persistência em `localStorage` (chaves definidas no próprio serviço).
- **`authInterceptor`** (`interceptors/auth.interceptor.ts`): adiciona `Authorization: Bearer <token>` em todas as requisições se houver token.
- Registro em `app.config.ts`: `provideHttpClient(withInterceptors([authInterceptor]))`.

### 5.4 Rotas e guards (`app.routes.ts`)

| Rota | Guard / observação |
|------|---------------------|
| `/painel` | `authGuard` — exige login |
| `/painel` (filhas) | Vários guards por funcionalidade |
| `gerenteGuard` | Apenas `tipo_perfil === 'GERENTE'` |
| `notProducaoGuard` | Bloqueia perfil `PRODUCAO` em telas comerciais; redireciona para `/painel/producao` |
| `entregasGuard` | Apenas `ENTREGADOR` ou `GERENTE` |

O **alinhamento exato** entre guards do Angular e `perfil:` no Laravel é responsabilidade do time: se criar rota nova na API, defina perfil no backend e o guard correspondente no front, se necessário.

### 5.5 Serviços por domínio

Padrão: `src/app/services/<dominio>-painel.service.ts` — chamadas HTTP ao prefixo `API_URL` + recurso (`/clientes`, `/pedidos`, etc.).

### 5.6 Build de produção

```bash
npx ng build --configuration=production
```

Saída em `dist/frontend/browser` (conforme `angular.json`). Para hospedar o SPA, configure o servidor web para fallback para `index.html` (roteamento do lado do cliente).

---

## 6. Onde mexer para cada tipo de tarefa

| Objetivo | Onde olhar |
|----------|------------|
| Nova rota HTTP / regra de perfil | `backend-teste/routes/api.php`, controllers em `app/Http/Controllers/` |
| Regra de negócio / persistência | Models `app/Models/`, migrations `database/migrations/` |
| Nova tela no painel | `frontend/src/app/pages/painel/...`, rota em `app.routes.ts` |
| Chamadas HTTP do painel | Serviço `*-painel.service.ts` + `API_URL` |
| Texto público / landing | `pages/home`, `sobre`, `contato` |
| CORS / trust proxy | `config/cors.php`, `bootstrap/app.php` |

---

## 7. Testes e qualidade

- **Laravel:** `php artisan test` (se a suíte estiver configurada no projeto).
- **Angular:** `npx ng test` (Karma), conforme `frontend/README.md` genérico do CLI.

Recomenda-se, após alterações relevantes, validar manualmente login, uma listagem CRUD e um fluxo de pedido/produção conforme seu perfil de usuário de teste.

---

## 8. Problemas comuns

| Sintoma | O que verificar |
|---------|-----------------|
| 401 nas listagens | Token ausente ou expirado; faça login de novo. |
| CORS no navegador | Origem do front (porta) listada em `config/cors.php` ou `CORS_ALLOWED_ORIGINS`. |
| Erro ao limpar cache (`cache` table) | Use `CACHE_STORE=file` no `.env` local. |
| API 404 com Apache | DocumentRoot deve ser `public/`; `mod_rewrite` ativo; `.htaccess` do Laravel presente. |
| Dados não aparecem | `.env` com `DB_*` correto para o MySQL que você está usando; `php artisan migrate:status`. |

---

## 9. Referências cruzadas

- [DOCUMENTACAO_SIG_DONA_BELL.md](./DOCUMENTACAO_SIG_DONA_BELL.md) — negócio, MVP, atores.
- [`.cursor/rules/crud-completo.mdc`](./.cursor/rules/crud-completo.mdc) — convenção CRUD (se usar Cursor).
- Documentação oficial [Laravel](https://laravel.com/docs) e [Angular](https://angular.dev).

---

*Última atualização do guia: alinhado à estrutura `backend-teste` + `frontend` e às rotas/middlewares descritos acima. Se algo divergir do código, prevalece o repositório.*

# API Laravel — SIG Dona BEll (`backend-teste`)

Backend REST do **SIG Dona BEll**: autenticação com **Laravel Sanctum** (token Bearer), perfis de usuário e rotas sob o prefixo `/api`.

## Documentação

- **[Guia do desenvolvedor (setup MySQL, rotas, perfis, convenções)](../GUIA_DESENVOLVEDOR.md)** — leia primeiro.
- [Documentação de negócio / requisitos](../DOCUMENTACAO_SIG_DONA_BELL.md)

## Comandos rápidos

```bash
composer install
copy .env.example .env    # Windows
php artisan key:generate
php artisan migrate
php artisan serve         # http://127.0.0.1:8000 — API em /api/...
```

Configure `DB_*` no `.env` para o **MySQL local** em desenvolvimento. Comandos úteis estão descritos no guia (ex.: `admin:reset-senha`).

## Laravel

Documentação oficial do framework: [https://laravel.com/docs](https://laravel.com/docs).

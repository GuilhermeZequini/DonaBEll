# Frontend — SIG Dona BEll

SPA em **Angular 19** (componentes standalone) para o site público e o **painel** autenticado (clientes, pedidos, produção, entregas, etc.).

## Documentação

- **[Guia do desenvolvedor (ambiente completo + API + padrões)](../GUIA_DESENVOLVEDOR.md)** — leia primeiro.
- [Documentação de negócio / requisitos](../DOCUMENTACAO_SIG_DONA_BELL.md)

## Comandos rápidos

```bash
npm install
npx ng serve          # http://localhost:4200
npx ng build --configuration=production
```

A URL da API em desenvolvimento está em `src/environments/environment.ts`. Os serviços devem usar `API_URL` de `src/app/config/api.config.ts` (não fixar `127.0.0.1` nos serviços).

## Angular CLI

Documentação genérica do CLI: [Angular CLI](https://angular.dev/tools/cli).

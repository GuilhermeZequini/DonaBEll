# Documento — SIG Dona BEll

> **Para desenvolvedores (ambiente, pastas, API, Angular, convenções de código):** consulte o [Guia do desenvolvedor — GUIA_DESENVOLVEDOR.md](./GUIA_DESENVOLVEDOR.md).

## 1. Introdução

O **SIG Dona BEll** é um Sistema de Informação Gerencial desenvolvido para apoiar a gestão e a tomada de decisão da empresa **Produtos Dona BEll**, que atua na produção e distribuição de alimentos sob demanda.

O sistema tem como objetivo substituir controles manuais baseados em cadernos e comunicações informais por uma plataforma digital de apoio gerencial, centralizando informações de vendas, pedidos, produção sob demanda, rotas de entrega e acompanhamento operacional.

Ressalta-se que o sistema **não se caracteriza como um ERP**, pois não contempla módulos contábeis, fiscais, trabalhistas ou legais (como folha de pagamento, emissão de nota fiscal ou integração com a SEFAZ). Seu foco está na organização, visualização e análise das informações operacionais, típicas de um SIG.

---

## 2. Público-Alvo

- **Clientes finais**: pessoas físicas, restaurantes, hortifrutis/mercados de bairro e, futuramente, supermercados.
- **Vendedores**: responsáveis por registrar pedidos e interagir com clientes.
- **Gerência**: realiza controle de produção, finanças e relatórios.
- **Produção**: equipe responsável por fabricar e embalar produtos.
- **Entregadores**: responsáveis pela logística e entrega dos pedidos.

---

## 3. Objetivos do Sistema

- Automatizar o registro e aprovação de pedidos.
- Eliminar controles manuais e redundantes.
- Organizar a produção com base na demanda real dos pedidos.
- Priorizar a produção conforme rotas de entrega pré-definidas.
- Consolidar a produção por produto e rota.
- Facilitar a separação e embalagem dos pedidos.
- Gerar relatórios claros para produção, gerência e entregas.
- Permitir rastreabilidade completa do pedido, do registro à entrega.

---

## 4. Problemas que o Sistema Resolve

- Reduzir erros no registro de pedidos.
- Eliminar retrabalho e necessidade de acompanhamento presencial na produção.
- Aumentar a agilidade no atendimento ao cliente.
- Disponibilizar informações gerenciais de forma instantânea.

---

## 5. Critérios de Sucesso

- Registro e acompanhamento de pedidos 100% digital.
- Redução de pelo menos 50% no tempo de processamento de um pedido (do registro ao inico da produção).
- Cliente conseguindo visualizar status e histórico sem intervenção manual.

---

## 6. Definições e Atores

| Ator | Descrição |
|------|-----------|
| **Cliente** | Pessoa física / restaurante / hortifruti / supermercado (futuro). Pode navegar na landing page; se cadastrado, faz login e acompanha pedidos. |
| **Vendedor** | Registra pedidos e consulta catálogo e histórico de clientes. |
| **Gerente** | Aprova pedidos, gerencia rotas de clientes, acompanha produção consolidada e gera relatórios. |
| **Produção** | Visualiza pedidos organizados por rota, produz conforme consolidação automática e separa e embala pedidos. |
| **Entregador** | Vê pedidos para entrega, confirma entrega (foto/assinatura opcional). |
| **Sistema Externo (futuro)** | Gateway de pagamento / serviço de NFe / serviço de roteirização (integrações futuras). |

---

## 7. Escopo do Sistema

### 7.1 Funcionalidades Implementadas (MVP)

| Funcionalidade | Status | Observação |
|----------------|--------|------------|
| Landing page com apresentação da empresa e catálogo de produtos | ✅ Implementado | Home exibe produtos via API, banner, seção "Nossos Produtos" |
| Cadastro de clientes com vínculo opcional (PF) ou obrigatório (PJ) a rota | ✅ Implementado | CRUD completo com modal novo/editar |
| Login com perfis: Cliente, Vendedor, Gerente, Produção e Entregador | ✅ Implementado | Laravel Sanctum, controle por perfil |
| Registro digital de pedidos pelo vendedor | ✅ Implementado | Listagem, criar, editar (se NOVO), excluir |
| Aprovação gerencial obrigatória dos pedidos | ✅ Implementado | Endpoints aprovar/rejeitar |
| Painel de produção organizado por rotas de entrega | ✅ Implementado | Agrupamento por rota, aba consolidação |
| Consolidação automática de quantidades por produto e rota | ✅ Implementado | API `/producao/consolidacao` |
| Separação e embalagem (visualização individual dos pedidos) | ✅ Implementado | Lista de pedidos por rota |
| Painel do entregador com lista de entregas por rota | ✅ Implementado | Agrupado por semana e rota, reordenar |
| Histórico de pedidos acessível pelo cliente | ✅ Planejado | Via dashboard com filtro por usuário |
| Relatórios automáticos de vendas, produção e entregas | ✅ Implementado | Múltiplos relatórios gerenciais |
| CRUD de Rotas | ✅ Implementado | Listagem, modal novo/editar, excluir |
| CRUD de Produtos | ✅ Implementado | Listagem, modal ou página, preços PF/PJ |
| CRUD de Usuários | ✅ Implementado | Listagem, página novo/editar, só GERENTE |
| Marcar pedido como entregue | ✅ Implementado | API `PUT entregas/{id}/entregue` |
| Reordenar pedidos na rota de entrega | ✅ Implementado | API `POST entregas/reordenar` |
| Dashboard gerencial | ✅ Implementado | Pedidos por rota/semana, filtros ano/mês |

### 7.2 Funcionalidades Futuras

- Emissão automática de Nota Fiscal Eletrônica (NFe)
- Pagamentos online (Pix, cartão de crédito)
- Roteirização automática de entregas
- Painel dedicado ao cliente para histórico de pedidos (visão otimizada)

---

## 8. Requisitos Funcionais Detalhados

| ID | Requisito | Prioridade | Atores | Descrição resumida | Status |
|----|-----------|------------|--------|--------------------|--------|
| RF001 | Cadastro de Cliente | Essencial | Vendedor, Gerente | Cadastro com nome, tipo_pessoa (PF/PJ), telefone, endereço, rota obrigatória para PJ | ✅ |
| RF002 | Autenticação e Controle de Perfis | Essencial | todos | Login seguro com perfis (Cliente, Vendedor, Gerente, Produção, Entregador) | ✅ |
| RF003 | Landing Page / Catálogo Público | Importante | visitante | Informações da empresa e catálogo de produtos sem login | ✅ |
| RF004 | Cadastro e Gestão de Produtos | Essencial | Gerente | Cadastro, edição, inativação; preços PF e PJ | ✅ |
| RF005 | Registro Digital de Pedidos | Essencial | Vendedor | Registro vinculado a cliente, produtos, quantidades; status "Novo" | ✅ |
| RF006 | Aprovação Gerencial de Pedidos | Essencial | Gerente | Aprovar, rejeitar ou solicitar ajustes | ✅ |
| RF007 | Alteração de Rota do Cliente ou Pedido | Importante | Gerente | Alterar rota antes do início da produção | ✅ |
| RF008 | Encaminhamento Automático para Produção | Essencial | Sistema | Pedidos aprovados vão para fila de produção | ✅ |
| RF009 | Painel de Produção por Rotas | Essencial | Produção | Pedidos organizados em colunas por rota | ✅ |
| RF010 | Consolidação de Produção por Produto e Rota | Essencial | Produção | Quantidades consolidadas por produto e rota | ✅ |
| RF011 | Visualização Detalhada de Pedidos para Separação | Essencial | Produção | Visualização individual dos pedidos | ✅ |
| RF012 | Atualização de Status do Pedido | Essencial | Produção | "Em produção" e "Pronto para entrega" | ✅ |
| RF013 | Geração de Relatório/Etiqueta de Separação | Importante | Produção | Dados do pedido para separação | Em desenvolvimento |
| RF014 | Painel de Entregas por Rota | Essencial | Entregador | Lista de pedidos prontos, organizados por rota | ✅ |
| RF015 | Relatório de Entrega | Essencial | Entregador, Gerente | Nome, telefone, endereço e itens do pedido | ✅ |
| RF016 | Registro de Entrega Concluída | Essencial | Entregador | Confirmar entrega, finalizar processo | ✅ |
| RF017 | Histórico de Pedidos do Cliente | Essencial | Cliente | Visualizar histórico e status dos pedidos | Parcial (via dashboard) |
| RF018 | Dashboard Gerencial | Importante | Gerente | Visão consolidada de pedidos, produção, entregas | ✅ |
| RF019 | Relatórios Gerenciais | Importante | Gerente | Produtos mais vendidos, volume por rota, faturamento | ✅ |
| RF020 | Rastreabilidade Completa de Pedidos | Essencial | Sistema, Gerente | Alterações de status registradas | ✅ |

---

## 9. Requisitos Não-Funcionais

| ID | Requisito | Descrição |
|----|-----------|-----------|
| RNF001 | Disponibilidade | Sistema web, disponibilidade mínima 99% |
| RNF002 | Performance | Tempo de resposta < 2s para operações críticas |
| RNF003 | Segurança | Autenticação segura, controle de acesso por perfis |
| RNF004 | Controle de Acesso | Restrição por perfil (Cliente, Vendedor, Gerente, Produção, Entregador) |
| RNF005 | Responsividade | Interface adaptável a desktop e smartphones |
| RNF006 | Rastreabilidade e Auditoria | Ações relevantes registradas |
| RNF007 | Confiabilidade | Evitar inconsistências e garantir integridade |
| RNF008 | Usabilidade | Interface simples e intuitiva |
| RNF009 | Escalabilidade | Inclusão de usuários/rotas sem impacto |
| RNF010 | Backup e Recuperação | Backup automático diário |

---

## 10. Regras de Negócio

- O sistema opera exclusivamente em **produção sob demanda** (não há estoque de produtos acabados).
- Todo cliente **PJ** deve estar vinculado a uma rota de entrega obrigatória.
- Pode existir cliente sem acesso ao sistema (cadastrado apenas para pedidos).
- Cliente pode existir sem rota; prioridade definida pelo gerente na hora de produzir.
- A rota pode ser alterada pela gerência antes do início da consolidação da produção.
- Alteração de rota **não é permitida** após o início da consolidação da produção.
- A produção é priorizada conforme ordem de prioridade da rota e do pedido.
- Pedidos só podem ser alterados enquanto estiverem no status **"Novo"**.
- Após aprovação, os pedidos seguem automaticamente para produção.
- A produção consolida quantidades por produto e rota.
- A separação ocorre por pedido individual.
- Todos os pedidos devem possuir rastreabilidade completa.
- O preço aplicado no pedido depende do **tipo_pessoa** do cliente (PF ou PJ).
- O preço é "congelado" no item_pedido no momento da venda para preservar histórico.

---

## 11. Restrições Técnicas

### 11.1 Tecnologias Utilizadas

| Componente | Tecnologia |
|------------|------------|
| Banco de dados | MySQL |
| Front-end | Angular 18 (HTML, CSS, JavaScript/TypeScript) |
| Back-end | Laravel (API REST) |
| Autenticação | Laravel Sanctum (tokens Bearer) |
| Arquitetura | Web responsivo (desktop, tablets e smartphones) |
| Suporte | Múltiplos usuários simultâneos |

### 11.2 Dependências Externas

- Necessidade de domínio e e-mail para notificações.
- Integrações externas (NFe, gateway de pagamento) planejadas após MVP.
- Confirmação de requisitos legais (ANVISA, regras fiscais) pode alterar campos obrigatórios.

---

## 12. Arquitetura do Sistema

### 12.1 Estrutura do Projeto

```
oficial/
├── backend-teste/          # API Laravel
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── ClienteController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── EntregasController.php
│   │   │   ├── PedidoController.php
│   │   │   ├── ProducaoController.php
│   │   │   ├── ProdutoController.php
│   │   │   ├── RelatoriosController.php
│   │   │   ├── RotaController.php
│   │   │   └── UsuarioController.php
│   │   └── Models/
│   │       ├── Cliente.php
│   │       ├── ItemPedido.php
│   │       ├── Pedido.php
│   │       ├── Produto.php
│   │       ├── Rota.php
│   │       └── Usuario.php
│   └── routes/api.php
└── frontend/               # Angular 18
    └── src/app/
        ├── guards/         # auth, gerente, entregas, notProducao
        ├── pages/
        │   ├── home/       # Landing page
        │   ├── login/
        │   ├── painel/     # Dashboard, Pedidos, Produção, Entregas, etc.
        │   ├── sobre/
        │   └── contato/
        └── services/       # *-painel.service.ts
```

### 12.2 Controle de Acesso (Guards e Middleware)

| Guard/Middleware | Função |
|------------------|--------|
| `authGuard` | Exige usuário autenticado |
| `gerenteGuard` | Acesso apenas GERENTE (Rotas, Usuários, Relatórios) |
| `notProducaoGuard` | Impede PRODUCAO de acessar Dashboard, Pedidos, Produtos, Clientes |
| `entregasGuard` | Acesso apenas ENTREGADOR ou GERENTE (painel Entregas) |
| `PerfilMiddleware` (backend) | Restringe rotas da API por perfil |

### 12.3 Permissões por Página

| Página | GERENTE | VENDEDOR | PRODUCAO | ENTREGADOR | CLIENTE |
|--------|---------|----------|----------|------------|---------|
| Dashboard | ✅ | ✅ | ❌ | ✅ | ✅ |
| Pedidos | ✅ | ✅ | ❌ | ❌ | ❌ |
| Produção | ✅ | ❌ | ✅ | ❌ | ❌ |
| Entregas | ✅ | ❌ | ❌ | ✅ | ❌ |
| Rotas | ✅ | ❌ | ❌ | ❌ | ❌ |
| Produtos | ✅ (CRUD) | ✅ (leitura) | ❌ | ❌ | ❌ |
| Clientes | ✅ | ✅ | ❌ | ❌ | ❌ |
| Usuários | ✅ | ❌ | ❌ | ❌ | ❌ |
| Relatórios | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 13. API REST

### 13.1 Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/login` | Login (email, senha) → retorna token e usuário |

### 13.2 Rotas Autenticadas (auth:sanctum)

| Método | Endpoint | Perfis | Descrição |
|--------|----------|--------|-----------|
| GET | `/api/me` | Todos | Dados do usuário logado |
| GET | `/api/rotas` | Todos | Listar rotas ativas |

### 13.3 Comercial / Gestão (exceto PRODUCAO)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/clientes` | Listar clientes (paginado) |
| POST | `/api/clientes` | Criar cliente |
| GET | `/api/clientes/{id}` | Buscar cliente |
| PUT | `/api/clientes/{id}` | Atualizar cliente |
| DELETE | `/api/clientes/{id}` | Excluir cliente |
| GET | `/api/produtos` | Listar produtos |
| GET | `/api/produtos/{id}` | Buscar produto |
| GET | `/api/pedidos` | Listar pedidos |
| POST | `/api/pedidos` | Criar pedido |
| GET | `/api/pedidos/{id}` | Buscar pedido |
| PUT | `/api/pedidos/{id}` | Atualizar pedido (se NOVO) |
| DELETE | `/api/pedidos/{id}` | Excluir pedido (NOVO/REJEITADO) |
| POST | `/api/pedidos/{id}/aprovar` | Aprovar pedido |
| POST | `/api/pedidos/{id}/rejeitar` | Rejeitar pedido |
| GET | `/api/dashboard` | Dashboard (ano, mes) |

### 13.4 Produtos (escrita – só GERENTE)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/produtos` | Criar produto |
| PUT | `/api/produtos/{id}` | Atualizar produto |
| DELETE | `/api/produtos/{id}` | Excluir produto |

### 13.5 Relatórios (só GERENTE)

| Método | Endpoint | Parâmetros | Descrição |
|--------|----------|------------|-----------|
| GET | `/api/relatorios` | ano, mes | Relatórios gerenciais |

**Relatórios retornados**: clientes_mais_pedidos, produtos_mais_vendidos, meses_mais_produtivos, produtos_por_mes, faturamento_por_mes, rotas_mais_pedidos, vendedores_mais_vendas, pedidos_por_status, faturamento_por_cliente.

### 13.6 Produção (PRODUCAO, GERENTE)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/producao` | Pedidos por rota (APROVADO, EM_PRODUCAO, PRONTO) |
| GET | `/api/producao/consolidacao` | Consolidação por produto e rota |
| PUT | `/api/producao/pedidos/{id}/status` | Atualizar status (EM_PRODUCAO, PRONTO) |

### 13.7 Entregas (ENTREGADOR, GERENTE)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/entregas` | Pedidos prontos por semana/rota |
| PUT | `/api/entregas/{id}/entregue` | Marcar como ENTREGUE |
| POST | `/api/entregas/reordenar` | Reordenar pedidos na rota |

### 13.8 Usuários e Rotas (só GERENTE)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET/POST | `/api/usuarios` | Listar / Criar |
| GET/PUT/DELETE | `/api/usuarios/{id}` | Buscar / Atualizar / Excluir |
| POST | `/api/rotas` | Criar rota |
| GET/PUT/DELETE | `/api/rotas/{id}` | Buscar / Atualizar / Excluir |

---

## 14. Fluxos Principais

### 14.1 Fluxo de Login

1. Usuário acessa `/login` e informa email e senha.
2. Frontend chama `POST /api/login`.
3. Backend valida credenciais e retorna token + dados do usuário (Laravel Sanctum).
4. Token e usuário são salvos no `localStorage`.
5. Redirecionamento para `/painel`.
6. Interceptor envia `Authorization: Bearer {token}` em todas as requisições.

### 14.2 Fluxo de Pedido

1. **Vendedor/Gerente** cria pedido: seleciona cliente e itens (produto + quantidade).
2. Sistema aplica preço PF ou PJ conforme tipo do cliente.
3. Pedido inicia com status **NOVO**.
4. **Gerente** aprova ou rejeita.
5. Aprovado segue automaticamente para **Produção**.

### 14.3 Fluxo de Produção

1. **Produção** visualiza pedidos APROVADO, EM_PRODUCAO e PRONTO agrupados por rota.
2. Aba **Consolidação**: produtos e quantidades totais por rota.
3. Transições: APROVADO → EM_PRODUCAO → PRONTO.
4. Perfil PRODUCAO não visualiza valores monetários.

### 14.4 Fluxo de Entrega

1. **Entregador** visualiza pedidos PRONTOS com rota, agrupados por semana e rota.
2. Ordenação por `ordem_entrega` dentro de cada rota.
3. Ações: marcar como entregue (PRONTO → ENTREGUE) e reordenar (mover cima/baixo).

---

## 15. Status do Pedido

| Status | Descrição |
|--------|-----------|
| NOVO | Pedido registrado, aguardando aprovação |
| APROVADO | Aprovado pelo gerente, na fila de produção |
| REJEITADO | Rejeitado pelo gerente |
| EM_PRODUCAO | Em produção |
| PRONTO | Pronto para entrega |
| EM_ENTREGA | Saiu para entrega |
| ENTREGUE | Entregue ao cliente |
| CANCELADO | Pedido cancelado |

---

## 16. Modelo de Dados

### 16.1 Entidades Principais

- **Usuario**: nome, email, senha, tipo_perfil (CLIENTE, VENDEDOR, GERENTE, PRODUCAO, ENTREGADOR), ativo.
- **Cliente**: vinculado a Usuario, tipo_cliente (PF/PJ), CNPJ/CPF, endereço, Rota_id (obrigatório para PJ).
- **Rota**: nome, ordem_prioridade, descricao, ativo.
- **Produto**: nome, descricao, preco_pf, preco_pj, ativo.
- **Pedido**: Usuario_id (vendedor), Cliente_Usuario_id, data_cadastro, status, valor_total, ordem_entrega.
- **Itens_pedido**: Pedido_id, Produto_id, quantidade, preco_unitario (congelado na venda).

### 16.2 Regra de Cliente e Usuário

- Ao cadastrar um **cliente**, o sistema cria automaticamente um **usuário** do tipo CLIENTE (senha padrão: 123456) para acesso ao painel.

---

## 17. Rotas do Frontend

| Rota | Componente | Proteção |
|------|------------|----------|
| `/` | HomeComponent | Público |
| `/login` | LoginComponent | Público |
| `/sobre` | SobreComponent | Público |
| `/contato` | ContatoComponent | Público |
| `/painel` | DashboardPainelComponent | authGuard, notProducaoGuard |
| `/painel/pedidos` | PedidosListagemComponent | authGuard, notProducaoGuard |
| `/painel/producao` | ProducaoPainelComponent | authGuard |
| `/painel/entregas` | EntregasPainelComponent | authGuard, entregasGuard |
| `/painel/rotas` | RotasListagemComponent | authGuard, gerenteGuard |
| `/painel/produtos` | ProdutosListagemComponent | authGuard, notProducaoGuard |
| `/painel/clientes` | ClientesListagemComponent | authGuard, notProducaoGuard |
| `/painel/usuarios` | UsuariosListagemComponent | authGuard, gerenteGuard |
| `/painel/usuarios/novo` | UsuarioFormComponent | authGuard, gerenteGuard |
| `/painel/usuarios/editar/:id` | UsuarioFormComponent | authGuard, gerenteGuard |
| `/painel/relatorios` | RelatoriosPainelComponent | authGuard, gerenteGuard |

---

## 18. Critérios de Aceitação do MVP

- [x] Cadastro e autenticação de usuários funcionando com perfis
- [x] Landing page com catálogo básico visível
- [x] Vendedor registra pedidos; gerente vê no dashboard
- [x] Produção recebe lista e atualiza status para "Pronto"
- [x] Produção organizada por rotas com priorização automática
- [x] Consolidação automática da produção por produto e rota
- [x] Relatório de entrega disponível para o entregador
- [x] Status do pedido atualizado corretamente em cada etapa
- [x] Cliente cadastrado consegue ver status e histórico (via dashboard)
- [x] Relatórios básicos (vendas por período, produtos mais vendidos)
- [x] Sistema aplica preço correto (PF ou PJ) baseado no tipo_pessoa do cliente

---

## 19. Histórias de Usuário (Épicos)

### Épico 1: Gestão de Clientes e Produtos
- Como vendedor, quero cadastrar clientes com suas rotas para organizar as entregas. ✅
- Como gerente, quero gerenciar o catálogo de produtos para manter preços atualizados. ✅

### Épico 2: Registro e Aprovação de Pedidos
- Como vendedor, quero registrar pedidos digitalmente para eliminar cadernos. ✅
- Como gerente, quero aprovar pedidos antes da produção para validar informações. ✅

### Épico 3: Produção e Consolidação
- Como produção, quero ver pedidos organizados por rota para priorizar o trabalho. ✅
- Como produção, quero consolidação automática de produtos para produzir eficientemente. ✅

### Épico 4: Entrega e Acompanhamento
- Como entregador, quero lista de entregas por rota para otimizar meu trajeto. ✅
- Como cliente, quero acompanhar meus pedidos para saber quando vão chegar. ✅ (parcial)

### Épico 5: Gestão e Relatórios
- Como gerente, quero dashboard com indicadores para tomar decisões. ✅
- Como gerente, quero relatórios de vendas e produção para análise do negócio. ✅

---

## 20. Arquivos Entregáveis

### 20.1 Documentação
- [x] Documento ERS (este documento)
- [ ] Backlog inicial com estimativas de complexidade
- [ ] Critérios de aceitação detalhados por história
- [ ] Glossário de termos do domínio

### 20.2 Modelagem
- [ ] Diagrama de Casos de Uso
- [ ] Diagrama de Classes
- [ ] Diagrama de Sequência (fluxos principais)
- [ ] Diagrama de Atividades
- [ ] Diagrama de Estados (status do pedido)
- [x] Modelo Entidade-Relacionamento (conceitual no documento original)
- [ ] Dicionário de Dados

### 20.3 Design
- [ ] Wireframes de baixa fidelidade
- [ ] Protótipos de alta fidelidade
- [ ] Guia de estilo (cores, tipografia, componentes)
- [ ] Fluxo de navegação

### 20.4 Planejamento
- [ ] Cronograma de sprints
- [ ] Estimativas de esforço
- [ ] Plano de releases
- [ ] Matriz de riscos

### 20.5 Testes
- [ ] Plano de testes detalhado
- [ ] Casos de teste por funcionalidade
- [ ] Checklist de aceitação do MVP

---

## 21. Resumo Executivo — O que o Sistema Faz Hoje

O **SIG Dona BEll** permite:

1. **Gestão de clientes**: cadastro completo (PF/PJ), vínculo com rotas, CRUD via modal.
2. **Gestão de produtos**: cadastro com preços diferenciados PF/PJ, ativação/inativação.
3. **Gestão de rotas**: CRUD de rotas com ordem de prioridade para produção e entregas.
4. **Gestão de usuários**: CRUD de usuários com perfis (exceto CLIENTE, criado via cadastro de clientes).
5. **Pedidos**: registro, edição (se NOVO), aprovação/rejeição pelo gerente.
6. **Produção**: visualização por rota, consolidação automática de produtos, atualização de status.
7. **Entregas**: lista por semana/rota, reordenação, marcação de entrega concluída.
8. **Dashboard**: pedidos agrupados por rota e semana, filtros por ano/mês.
9. **Relatórios**: clientes mais pedidos, produtos mais vendidos, faturamento por mês, rotas, vendedores, etc.
10. **Landing page**: apresentação da empresa e catálogo de produtos.

O sistema está operacional para os perfis definidos e atende aos requisitos do MVP documentado.

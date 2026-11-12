# Santerra — Backend

API REST do Sistema de Gestão Comercial da Santerra.

O backend centraliza as regras de negócio e o gerenciamento de informações de produtores, revendas, ações comerciais, metas e demais dados do sistema.

## Tecnologias

* Node.js
* TypeScript
* Express
* Prisma ORM
* PostgreSQL
* JWT

## Funcionalidades

* Autenticação e autorização
* Cadastro e gerenciamento de produtores
* Cadastro e gerenciamento de revendas
* Gerenciamento de vendedores
* Controle de ações comerciais
* Gerenciamento de metas
* Registro de visitas e safras
* Dados para dashboard e indicadores
* Integração de leitura com o ERP da Santerra

## Requisitos

* Node.js
* Yarn
* PostgreSQL

## Instalação

Clone o projeto e instale as dependências:

```bash
git clone <URL_DO_REPOSITORIO>
cd <NOME_DO_REPOSITORIO>
yarn
```

Configure as variáveis de ambiente criando um arquivo `.env` (o `.env.example` lista todas):

```env
PORT=3333
DATABASE_URL="postgresql://usuario:senha@localhost:5432/santerra"
JWT_SECRET="uma-chave-aleatoria-com-pelo-menos-32-caracteres"
```

O servidor não sobe sem um `JWT_SECRET` de pelo menos 32 caracteres. Para gerar um:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Os e-mails (código de cadastro, recuperação de senha e convites) saem pelo [Resend](https://resend.com) quando `RESEND_API_KEY` está preenchida. Nesse caso, `MAIL_FROM` também é obrigatória e precisa ser de um domínio verificado no Resend, por exemplo `WebUp! <nao-responda@seudominio.com.br>`. Sem a chave, os e-mails só aparecem no console do servidor, o que serve para desenvolvimento. Se o Resend recusar um envio, a API responde `503` e o motivo fica no log.

Para apagar o banco, reaplicar as migrations, gerar o Prisma Client e rodar o seed:

```bash
yarn prisma:reset
```

> O `prisma:reset` apaga o banco do `DATABASE_URL`. Nunca rode apontando para o banco da `main`.

Ou, passo a passo, execute as migrations:

```bash
yarn prisma migrate dev
```

Para popular o banco com os dados de seed:

```bash
yarn prisma:seed
```

Os seeds ficam em `prisma/seeds/`. Os de desenvolvimento (como o de empresas) só rodam da `develop` para baixo: são ignorados quando `APP_ENV` ou `NODE_ENV` for `main`/`production`, ou quando a branch git atual for a `main`. A main tem uma seed própria, que o `prisma:seed` não chama: veja [Seed da main](#seed-da-main).

## Seed da main

A main não roda os seeds de desenvolvimento. O primeiro acesso vem de uma seed própria, em `prisma/seeds/main/`, que cria a empresa Santerra, o admin master e três cargos. O `prisma:seed` e o `prisma:reset` não chamam essa seed.

```bash
read -rs SEED_ADMIN_PASSWORD && export SEED_ADMIN_PASSWORD
SEED_CONFIRM=main yarn seed:main --dry-run
SEED_CONFIRM=main yarn seed:main
```

O `read -rs` lê a senha sem mostrá-la e sem deixá-la no histórico do shell. A seed usa o `DATABASE_URL` do ambiente (ou do `.env`) e roda com o `tsx`, que é dependência de desenvolvimento.

| Variável | Uso |
| --- | --- |
| `SEED_ADMIN_PASSWORD` | Senha do admin, com pelo menos 12 caracteres. É exigida em toda execução, mas só é usada quando o admin ainda não existe. |
| `SEED_CONFIRM` | Precisa ser `main`. Passe na linha de comando: no `.env`, a proteção deixa de valer. |

O que ela cria (os IDs saem do `@default(uuid())`, sem os UUIDs fixos dos seeds de desenvolvimento):

* A empresa "Santerra", sem descrição.
* O usuário "Santerra Admin" (`admin@santerra.com`), ativo e admin da plataforma (`isPlatformAdmin`), com a senha em hash argon2. Ele entra na Santerra como membro com o cargo Administrador, e não como dono.
* Os cargos Administrador, Vendedor e Financeiro na Santerra, com as permissões da tabela abaixo.

Proteções:

* Com `NODE_ENV` igual a `development` ou `test`, recusa rodar, a não ser com `--force`, que libera só isso.
* Sem `SEED_CONFIRM=main`, com a senha ausente ou curta, ou com uma opção desconhecida (ex.: `--dryrun`), para antes de conectar no banco e lista tudo o que falta.
* Tudo roda numa transação só: se algo falhar, nada é gravado. Duas execuções ao mesmo tempo esperam uma pela outra (advisory lock do Postgres), então nenhuma duplica a empresa nem falha por conflito.
* Antes do commit, uma verificação confere que a empresa existe e não está excluída; que o admin existe, está ativo, é `isPlatformAdmin` e tem o cargo Administrador na Santerra; e que os três cargos existem com pelo menos uma permissão, o Administrador com todas as de `ALL_PERMISSIONS`. Se algo não bater, a seed aborta dizendo o quê.
* O log mostra só o que foi criado, atualizado ou já existia. Senha e hash nunca aparecem, nem nas mensagens de erro.
* `--dry-run` roda tudo, inclusive a verificação, numa transação desfeita no final: mostra o que seria criado ou alterado sem gravar nada.
* Em qualquer recusa ou falha, sai com código 1.

Rodar de novo não duplica nem sobrescreve o que foi editado:

* A empresa é encontrada pelo nome (sem as excluídas), o admin pelo e-mail e os cargos pelo nome dentro da empresa. O que já existe não muda: nome e descrição da empresa, e nome, senha, status e `isPlatformAdmin` do admin. Se o admin existente estiver inativo, sem `isPlatformAdmin` ou fora da Santerra, a verificação falha: corrija pela plataforma ou no banco.
* As permissões dos três cargos são sincronizadas a cada execução: entram as que faltam e saem as que não estão na definição, inclusive as mudadas pela tela. Nome e descrição dos cargos não mudam.
* Como a chave é o nome, renomear a Santerra ou um desses cargos pela tela faz a próxima execução criar outro.
* As permissões vêm das migrations, não da seed. Se faltar alguma no banco, a seed falha dizendo qual.

Cargos e permissões, definidos em `prisma/seeds/main/roles.ts`. O Administrador tem todas (`ALL_PERMISSIONS`). Vendedor e Financeiro:

| Recurso | Vendedor | Financeiro |
| --- | --- | --- |
| `persons` | read, create, update | read |
| `producers` | read, create, update | read |
| `potentials` | read, create, update | read |
| `resellers` | read, create, update | read |
| `products` | read | read |
| `employees` | — | read |
| `members` | — | read |
| `events` | read, create, update | read |
| `commercial-actions` | read, create, update | read |
| `commercial-trips` | read, create, update | read |
| `groups` | read | read |
| `wallets` | — | read, create, update, delete |
| `files` | read, create | read, create, update |

`company`, `roles`, `invitations` e os `delete` que não aparecem na tabela ficam só com o Administrador.

Para testar a seed: `yarn test:seed:main` cria um banco temporário no servidor do `DATABASE_URL` (o usuário do banco precisa poder criar bancos), aplica as migrations, roda a seed nos cenários (proteções, `--dry-run`, primeira e segunda execução, falha na verificação, permissão faltando) e apaga o banco no final. O banco do `DATABASE_URL` não é alterado.

## Autenticação e empresas (multi-tenant)

Um usuário é uma conta global e pode participar de várias empresas, com cargos diferentes em cada uma.

1. O cadastro confirma o e-mail antes de criar a conta. `POST /auth/sign-up/verification-code` com `email` envia um código de 6 dígitos válido por 15 minutos (`409` se o e-mail já tiver conta, `429` se pedir de novo em menos de 60 segundos). `POST /auth/sign-up/verify-email` com `email` e `code` devolve um `verificationToken`; são 5 tentativas por código, e vale só o código mais recente. Depois, `POST /auth/sign-up` com `name`, `email`, `password`, `companyName` e o `verificationToken` (válido por 60 minutos e de uso único; se expirar, a resposta é `400` com o código `EMAIL_NOT_VERIFIED`) cria a conta e a empresa, com quem cadastrou como **dono**, e já devolve o token com a empresa escolhida. O dono tem todas as permissões e não pode ser alterado nem removido. Também é criado um cargo "Administrador" para convidar outros administradores.
2. `POST /auth/login` devolve um token sem empresa e a lista `companies`.
3. `POST /auth/select-company` (com o token do login) devolve um token com a empresa escolhida. Também serve para trocar de empresa.
4. As rotas da empresa (`/persons`, `/products`, `/wallets`, `/files`, `/roles`, `/members`, `/invitations`, `/companies/current`) usam o token com empresa no header `Authorization: Bearer <token>`, e cada ação exige a permissão correspondente nos cargos do usuário.
5. Novos funcionários entram por convite: `POST /invitations` envia o link por e-mail e `POST /invitations/accept` aceita. Se o e-mail ainda não tiver conta, ela é criada com `name` e `password`; se já tiver, é preciso informar a senha dela.
6. Recuperação de senha: `POST /auth/forgot-password` com `email` envia um link válido por 60 minutos (`PASSWORD_RESET_URL?token=...`) e sempre responde `204`, exista a conta ou não, para não revelar quais e-mails estão cadastrados. `POST /auth/reset-password` com `token` e `password` troca a senha e invalida os outros links pendentes do usuário.
7. Minha conta: com qualquer token, com ou sem empresa, `PATCH /auth/me` com `name` muda o nome do próprio usuário e devolve o usuário, e `PATCH /auth/me/password` com `currentPassword` e `newPassword` troca a senha (`204`) e invalida os links de recuperação pendentes, como o `reset-password`. Senha atual errada dá `400` com o código `INVALID_CURRENT_PASSWORD`, e a nova igual à atual dá `400`. O e-mail não muda por essas rotas (só pela plataforma, em `PATCH /users/:id`). Trocar a senha não encerra as outras sessões: o token já emitido vale até expirar (`JWT_EXPIRES_IN`, padrão 1 dia).

Ninguém cria, edita, exclui, atribui ou convida com um cargo que tenha permissões que a própria pessoa não tem.

As permissões ficam em `src/shared/application/auth/permissions.ts`, e a tabela `Permission` recebe o catálogo por migration. Uma permissão nova precisa entrar nos dois lugares.

Rotas globais (`/users`, `/companies`, e alterações em `/permissions`, `/harvests` e `/manufacturers`) são da administração da plataforma: usuários com `isPlatformAdmin`, que só é definido por seed ou direto no banco.

Usuários do seed (senha `Senha@123`):

| E-mail | Situação |
| --- | --- |
| `sipriano@email.com` | Dono da Santerra e AGD (só leitura) na Agro Vale Verde |
| `maria@valeverde.com` | Dona da Agro Vale Verde |
| `admin@santerra.com` | Administração da plataforma |
| `joao@cesar.com` | Inativo: o login é recusado |

## Convenções da API

### Listas

As rotas de lista aceitam `page`, `limit` (padrão 20, máximo 100), `search` e `includeDeleted`, e respondem `{ data, meta: { page, limit, total, totalPages } }`.

O filtro "Data de cadastro" usa `createdFrom` e `createdTo` em ISO com fuso (ex.: `2026-11-05T00:00:00-03:00`): quem chama decide onde o dia começa, e data sem fuso é recusada com `400`. No schema da lista, entra com `...createdAtRangeQuerySchema.shape`; outros períodos usam o `dateTimeQuerySchema`. Os dois ficam em `src/shared/http/request-schemas.ts`.

### Nomes das relações

A resposta traz o nome das relações que a tela mostra, para a lista não precisar de uma requisição por linha. O repositório usa `include` com `select` mínimo (ex.: `producer.person: { id, name }`) e devolve um tipo de resposta próprio com esses campos. Os `*Id` (`personId`, `groupIds`…) continuam na resposta, porque é o que o `PATCH` recebe.

Contagens que a lista mostra (ex.: `producersCount` em `GET /potentials`) entram do mesmo jeito, com `_count`, num tipo de resposta próprio (`PotentialListItemDto`). Quando a contagem também bloqueia a exclusão, as duas usam o mesmo filtro (ex.: `ACTIVE_PRODUCERS` no repositório de potenciais), para a lista e o 409 `RESOURCE_IN_USE` darem o mesmo número.

Quando a exclusão não é bloqueada, mas a tela avisa antes o que muda (vínculos N:N), a contagem vem em todas as respostas do registro, inclusive no `GET /:id`, para o diálogo da página do registro avisar como o da lista. Exemplo: `productsCount` em `/groups` (`GroupDetailsDto`), que conta só os produtos não excluídos. Excluir o grupo não mexe nos produtos: eles deixam de mostrá-lo porque o produto ignora grupo excluído.

Quando a relação tem permissão própria, os dados dela só vêm com essa permissão. `GET /persons` e `GET /persons/:id` sempre trazem `types` (`employee`, `producer`), mas `employee` (admissão, desligamento e o membro vinculado) só vem com `employees.read`, e `producer` (potencial, endereço, cultura e área) só com `producers.read`; sem a permissão, o campo vem `null` (`toPersonDetailsDto`). Do mesmo jeito, `GET /members` traz `employee` (`{ id, person: { id, name } }`, o funcionário ligado ao membro) só com `employees.read` (`toMemberDetailsDto`).

Remover um membro (`DELETE /members/:id`) desvincula o funcionário ligado a ele (`userCompanyId` nulo), que continua cadastrado.

### Fabricantes

* Globais (sem empresa): qualquer usuário logado lê `GET /manufacturers`, e só o admin da plataforma cria, edita e exclui.
* Nome único na plataforma (409 `CONFLICT`). A exclusão é bloqueada enquanto houver produto não excluído do fabricante, de qualquer empresa (409 `RESOURCE_IN_USE`), e a lista traz `productsCount` com o mesmo filtro.
* A lista aceita os filtros de data e `missing` (`registrationNumber`, `phoneNumber`, `email`), como revendas.
* O campo `passwordHash` do fabricante não é mais aceito pela API (era gravado como texto, sem hash). A coluna continua no banco.

### Produtos

* Todas as respostas de `/products` (lista, `GET /:id`, `POST` e `PATCH`) trazem `manufacturer` (`{ id, name }`) e `groups` (`[{ id, name }]`, só os grupos não excluídos), além de `manufacturerId` e `groupIds` (`ProductDetailsDto`).
* Dinheiro: `price` e `costPrice` são `Decimal(14, 2)` e vão como número no JSON (`1234.56`). A API aceita de 0 a 999.999.999.999,99; fora disso, 400 (antes, o valor acima do limite da coluna dava 500).
* A lista aceita `manufacturerId`, `groupId` (grupo não excluído), `priceMin` e `priceMax` (com faixa, produto sem preço fica de fora) e o filtro de data.
* `PATCH` sem `groupIds` mantém os grupos do produto.
* `files` (`[{ id, originalName, mimeType, size }]`, só arquivos não excluídos) vem em todas as respostas, mas só com `files.read`; sem a permissão, vem `null`, e o `fileIds` continua.

### Arquivos e anexos

* `POST /files` recebe o arquivo no campo `file` de um `multipart/form-data` e devolve o arquivo (`id`, `originalName`, `mimeType`, `size`…). Acima de 10 MB, 413; tipo fora da lista (PDF, JPG, PNG, WEBP, GIF, TXT, CSV, DOC/DOCX, XLS/XLSX, PPT/PPTX), 400. O `id` entra no `fileIds` do registro (por enquanto, produto; depois, visita e ação comercial).
* `GET /files/:id/download` exige o `Bearer` e `files.read`, e responde como anexo (`Content-Disposition: attachment`, `X-Content-Type-Options: nosniff`). O frontend repassa o download pela rota `/api/files/:id`, porque `<img>` e links não mandam token.
* **Remover um anexo** (decisão D7, seguindo a recomendação): quando o `PATCH` tira um arquivo do `fileIds`, o arquivo é excluído se não estiver em outro registro não excluído (produto, visita ou ação comercial), com o `FileRepository.deleteUnlinked`; senão, só sai deste registro. Tirar anexo exige `files.delete` (403 "Você não tem permissão para remover anexos."). Produtos e visitas já fazem isso; as ações comerciais, quando editarem `fileIds`, devem chamar o mesmo `deleteUnlinked` com os arquivos removidos.
* Arquivo enviado e nunca ligado a um registro (o formulário foi cancelado) continua no banco e no disco: ainda não há limpeza automática.

### Culturas (`/harvests`)

* Globais como os fabricantes: qualquer usuário logado lê, só o admin da plataforma escreve. O cadastro guarda culturas (Milho, Soja), então as mensagens da API falam em "cultura".
* Nome único na plataforma (409 `CONFLICT`). A lista vem em ordem alfabética e aceita o filtro de data.
* Todas as respostas trazem `tripsCount` (visitas não excluídas com a cultura). A exclusão não é bloqueada: a visita passa a ignorar a cultura excluída.

### Visitas (`/commercial-trips`)

* Na tela e nas mensagens da API é "visita" ("Visita não encontrada."), seguindo a recomendação da D8. As rotas continuam `/commercial-trips`.
* Todas as respostas (lista, `GET /:id`, `POST` e `PATCH`) trazem `producer` e `responsible` (`{ id, name }`, o nome da pessoa), `participants` e `harvests` (`[{ id, name }]`, em ordem alfabética), `recommendedProducts` (`[{ id, name }]`, só com `products.read`; senão `null`) e `files` (só com `files.read`; senão `null`), além dos ids (`CommercialTripDetailsDto`).
* A lista aceita `status` (`PENDING`, `IN_PROGRESS`, `COMPLETED`), `producerId`, `responsibleId` e os períodos `expectedFrom`/`expectedTo` (data prevista) e `tripFrom`/`tripTo` (data realizada), com fuso. A busca procura no nome do produtor e do responsável. A ordem é pela data prevista, da mais recente para a mais antiga (sem data no fim), e depois pelo cadastro.
* Regras (D13, seguindo a recomendação): finalizar (`COMPLETED`) exige a data realizada ("Informe a data realizada para finalizar a visita."); o responsável não pode estar entre os participantes; e o responsável precisa ser um funcionário ativo ao criar a visita ou ao trocá-lo (400 "O responsável precisa ser um funcionário ativo."). A visita de um responsável desligado depois continua editável enquanto ele não for trocado.
* Tirar anexo segue a D7, como no produto: `files.delete` e `deleteUnlinked`.

### Painel (`GET /dashboard/summary`)

* Um resumo para a página inicial, com `ensureTenant` e sem permissão própria: cada bloco só vem com a permissão de ler o módulo dele, senão vem `null`. `producers` (`producers.read`): `total` e `byPotential` (`[{ id, name, count }]`, todos os potenciais, os mais cheios primeiro). `trips` (`commercial-trips.read`): `byStatus` e `upcoming` (as 5 próximas visitas pendentes ou em andamento a partir de hoje, com produtor e responsável). `actions` (`commercial-actions.read`): `month` (AAAA-MM), `monthTotal` e `byEvent` (soma do valor das ações com início no mês, por evento) e `recent` (as 5 últimas ações cadastradas). `wallets` (`wallets.read`): `count` e `totalBalance`.
* "Hoje" e "o mês" são de São Paulo. Os números usam os mesmos filtros das listas (`?status=`, `?potentialId=`, `?eventId=` com `initialFrom`/`initialTo`), então batem com elas; ação sem data de início não entra no gasto do mês.

### Ações comerciais

* Todas as respostas trazem `event`, `responsible` e `wallet` (`{ id, name }`; na carteira, `name` é o nome do membro dono), `producerGuests`, `resellerGuests` e `participants` (`[{ id, name }]`, em ordem alfabética) e `files` (só com `files.read`; senão `null`), além dos ids (`CommercialActionDetailsDto`).
* A lista aceita `eventId`, `responsibleId`, `walletId` (o extrato da carteira) e `initialFrom`/`initialTo` (início da ação, com fuso), e busca na descrição e no nome do evento. A ordem é pelo início, do mais recente para o mais antigo (sem data no fim), e depois pelo cadastro.
* **Saldo:** criar a ação debita o valor da carteira; mudar o valor ou a carteira devolve o valor antigo e debita o novo, na mesma transação; excluir devolve o valor. Sem saldo, 400 `INSUFFICIENT_BALANCE` e nada muda.
* Tirar anexo segue a D7, como no produto e na visita.
* Eventos: o nome é único por empresa (D12, seguindo a recomendação): 409 `CONFLICT` ("Já existe um evento com este nome."), para dois eventos não ficarem iguais no select da ação.

### Carteiras

* Todas as respostas de `/wallets` trazem `member: { id, name, email }` (`WalletDetailsDto`); a lista traz também `actionsCount` (as ações comerciais não excluídas da carteira), o mesmo número do 409 da exclusão.
* **Uma carteira por membro** (D4, seguindo a recomendação): criar a segunda, ou trocar o membro para um que já tem carteira, dá 409 `CONFLICT` ("Este membro já tem uma carteira."). A regra fica na aplicação, sem índice único no banco, porque a carteira excluída (lógica) não pode impedir uma nova.
* **O saldo (`value`) só muda por crédito e pelas ações.** `POST /wallets/:id/credits` (`{ amount }`, com `wallets.update`) soma o valor com incremento no banco, então créditos ao mesmo tempo somam todos; crédito zero ou negativo, ou que passaria do máximo da coluna, dá 400. As ações debitam e estornam do mesmo jeito. O `POST /wallets` aceita `value` como saldo inicial, e o `PATCH` não aceita mais `value` (antes gravava o saldo inteiro e podia apagar um débito feito no meio): só `userCompanyId`.
* A lista aceita `balance` (`empty`: zerada; `positive`: com saldo).
* A exclusão é bloqueada enquanto houver ação comercial não excluída (409 `RESOURCE_IN_USE`, "Esta carteira está em uso por 2 ações comerciais.").
* O extrato vem das ações comerciais (recomendação da D4): `GET /commercial-actions?walletId=`. Os créditos não ficam registrados um a um.
* `GET /members` aceita `hasWallet` (`true`/`false`), para a tela oferecer só membros sem carteira. Remover um membro (`DELETE /members/:id`) é bloqueado quando a carteira dele tem ações (409 "A carteira deste membro está em uso por 1 ação comercial. Desative o membro em vez de removê-lo.") ou saldo (409 "A carteira deste membro ainda tem saldo. …"); a carteira zerada e sem ações é excluída junto com o membro. A regra fica no repositório de membros (`findWalletUsage`), sem importar o módulo de carteiras, que já importa o de membros.

### Metas (`/goals`)

* A meta é de um funcionário (o vendedor), vale de `startDate` a `endDate` e mede um indicador (`metric`): `COMPLETED_TRIPS` (visitas finalizadas), `VISITED_PRODUCERS` (produtores visitados), `COMMERCIAL_ACTIONS` (ações comerciais) ou `SALES` (vendas em R$). As datas vão em ISO com fuso, como os filtros (`2026-11-01T00:00:00-03:00`; sem fuso, 400), e valem como dias inteiros de São Paulo: a API guarda o início do dia, e o fim não pode ser antes do início.
* `targetValue` é a meta: maior que zero, até 999.999.999.999,99 e inteira nos indicadores de quantidade. `achievedValue` é o valor vendido, digitado à mão até a integração com o ERP (D17), e só existe nas vendas: em outro indicador, 400. Trocar uma meta de vendas para outro indicador apaga o valor.
* Todas as respostas trazem `employee` (`{ id, name }`) e `achieved`, o realizado, calculado na hora com os mesmos filtros das listas: as visitas `COMPLETED` com o funcionário como responsável e `tripDate` no período (`/commercial-trips?status=COMPLETED&responsibleId=&tripFrom=&tripTo=`); os produtores diferentes dessas visitas; as ações com ele como responsável e `initialDate` no período (`/commercial-actions?responsibleId=&initialFrom=&initialTo=`); nas vendas, o `achievedValue` (0 sem valor). Participantes não contam. A lista calcula a página inteira com uma consulta de visitas e uma de ações, e não uma por meta.
* O funcionário precisa estar ativo ao criar a meta ou ao trocá-lo (400 "O vendedor precisa ser um funcionário ativo."), como o responsável da visita. O `PATCH` com o mesmo `employeeId` não é troca: a meta de quem foi desligado depois continua editável. Metas iguais (mesmo funcionário, indicador e período) são aceitas: nas vendas, podem ser de linhas diferentes, separadas pela descrição.
* A lista aceita `employeeId`, `metric`, `status` (`current`: em andamento hoje; `upcoming`: começa depois de hoje; `finished`: terminou antes de hoje, pelo dia de São Paulo) e `periodFrom`/`periodTo` (as metas que tocam o intervalo), e busca no nome do funcionário e na descrição. A ordem é pelo início, do mais recente para o mais antigo.
* `GET /goals/summary` aceita os mesmos filtros e a busca, sem paginação, e é o total da equipe: `byMetric` traz, para cada indicador com meta, `goalsCount`, a soma de `targetValue` e a soma de `achieved`.
* Quem tem `goals.read` vê as metas de todos, como nas visitas e nas ações (D18). O funcionário com meta não é excluído (veja "Pessoas, funcionários e produtores").

### Empresas

* `POST /auth/companies` cria uma empresa para o usuário logado (`name`\* e `description`), com ou sem empresa no token (só `ensureAuthenticated`), e responde 201 com a empresa. Quem cria vira dono, com o cargo "Administrador" e todas as permissões.
* A montagem de empresa, cargo "Administrador" e dono fica num serviço só, o `CompanyOwnerCreator` (`modules/auth/application/services/`), usado pelo cadastro (que manda também o usuário novo e a verificação de e-mail, tudo numa transação) e por essa rota.
* O login de uma conta sem empresa responde 200 com `companies` vazio.
* **Pela plataforma** (`POST /companies`, só o admin da plataforma): `name`\*, `description` e `ownerEmail`\*, o e-mail de um usuário que já existe e está ativo. A empresa nasce com ele como dono, pelo mesmo `CompanyOwnerCreator` (com `createdById` do admin). Sem usuário com o e-mail, 404 ("Nenhum usuário com este e-mail. Cadastre o usuário antes de criar a empresa."); usuário inativo, 400. Antes, a empresa nascia sem dono nem membro, e ninguém a acessava.
* O módulo de empresa chama o serviço pela porta `PLATFORM_COMPANY_CREATOR` (`src/shared/application/companies/`), que o módulo de auth implementa e registra no container: o auth já importa o módulo de empresa, e o caminho inverso criaria importação circular.
* `GET /companies` e `GET /companies/:id` (plataforma) trazem `owner` (`{ id, name, email }` ou `null`) e `membersCount` (membros não removidos).
* `GET /users` (plataforma) aceita `active` (`true`/`false`). O backend não impede o admin de desativar a própria conta; a tela impede.

### Logo da empresa

* `PUT /companies/current/logo` (com `company.update`) recebe a imagem no campo `file` de um `multipart/form-data`: PNG, JPG ou WEBP, conferidos pelo conteúdo do arquivo (não pelo tipo informado), até 2 MB. Acima disso, 413; outro formato ou arquivo vazio, 400. Responde com a empresa. A logo nova substitui a anterior, que sai do armazenamento.
* `DELETE /companies/current/logo` (com `company.update`) remove a logo e responde 204, também quando não havia logo.
* `GET /companies/:id/logo` é **público**, sem token: `<img>` não manda o `Bearer`, e a escolha de empresa mostra empresas para as quais o token ainda não vale. Serve só a logo daquela empresa, com o `Content-Type` da imagem, `Content-Disposition: inline` e `X-Content-Type-Options: nosniff`. Com `?v=` igual ao `logo` atual, a resposta pode ficar um ano no cache (`immutable`); sem ele, ou com outro valor, `no-cache`. Empresa sem logo ou excluída dá 404.
* O `logo` das respostas (empresa e `companies` do login e do `/auth/me`) é a chave da imagem no armazenamento (`<empresa>/logo-<uuid>.png`), ou `null`. A tela usa esse valor para saber se há logo e como versão da URL: `GET /companies/:id/logo?v=<logo>`.
* O `PATCH /companies/current` e o `PATCH /companies/:id` não aceitam mais `logo`. Antes gravavam qualquer texto, o que, com a rota pública, deixaria apontar a logo para um arquivo de outra empresa.

### Convites

* O e-mail do convite leva para `INVITATION_ACCEPT_URL` (padrão `http://localhost:3000/auth/accept-invitation`) com `?token=`. O token só existe no e-mail: a API guarda o hash.
* `GET /invitations/preview?token=` é público e devolve `email`, `companyName`, `accountExists` (se já há conta com o e-mail), `status` (`pending`, `accepted` ou `expired`) e `expiresAt`, para a tela de aceite saber o que pedir. Token desconhecido, ou convite revogado ou trocado por um mais novo, dá 404.
* `GET /invitations` aceita `status` (`pending`, `accepted`, `expired`).
* Convidar de novo um e-mail com convite pendente troca o convite (o antigo deixa de valer). O convite aceito não é revogado (409).

### Pessoas, funcionários e produtores

* `POST /persons` aceita `employee` e `producer` no corpo, com os campos de `POST /employees` e `POST /producers` sem o `personId`, e cria tudo numa transação: se um vínculo for recusado, a pessoa também não é criada. Cada vínculo exige a própria permissão de criar (`employees.create`, `producers.create`).
* `GET /employees` aceita `active` (`true`: sem desligamento ou com desligamento futuro) e busca pelo nome e pelo documento da pessoa, como `GET /producers`. As duas listas trazem `person: { id, name, nationalId }`, e o `GET /:id` das duas também (`findListItemById`), para a tela mostrar o nome a partir do id (ex.: o filtro de produtor das visitas aberto pela URL).
* Pessoa, funcionário e produtor que aparecem numa visita ou ação comercial (como produtor, responsável, participante ou convidado), e o funcionário com meta, não são excluídos: 409 `RESOURCE_IN_USE`, com a mensagem "Este produtor está em 2 visitas e 1 ação comercial." ou "Este funcionário está em 2 visitas, 1 ação comercial e 1 meta.". A contagem é o `countCommercialUsage` (`src/shared/infrastructure/database/`) e o texto, o `describeCommercialUsage` (`src/shared/domain/commercial-usage.ts`).
* Excluir a pessoa exclui junto o funcionário e o produtor dela, liberando o membro vinculado. Quando ela tem esses vínculos, a exclusão também exige `employees.delete` e `producers.delete`.

### Erros

Todo erro responde `{ "error": { "code", "message", "details"? } }`. A `message` já vem pronta para a tela, e o `code` diz o que aconteceu:

| Status | `code` | Quando |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | Dados inválidos. Quando vêm do schema, `details` traz `{ field, message }` por campo |
| 400 | `INVALID_JSON` | Corpo com JSON malformado |
| 400 | `INVALID_REFERENCE` | Um dos IDs informados não existe |
| 400 | `EMAIL_NOT_VERIFIED` | Cadastro com `verificationToken` inválido ou expirado |
| 400 | `INSUFFICIENT_BALANCE` | A carteira não tem saldo para o valor da ação comercial ("Saldo insuficiente na carteira."): a tela mostra no campo Valor |
| 400 | `INVALID_CURRENT_PASSWORD` | Troca de senha em Minha conta com a senha atual errada ("A senha atual está incorreta."): a tela mostra no campo Senha atual |
| 401 | `UNAUTHORIZED` | Credenciais erradas, token ausente, inválido ou expirado, usuário inativo ou acesso à empresa removido |
| 403 | `FORBIDDEN` | Sem permissão para a ação |
| 404 | `RESOURCE_NOT_FOUND` | Registro inexistente (ou de outra empresa) |
| 409 | `CONFLICT` | Duplicidade, como "Já existe uma pessoa com este documento.": a tela mostra no campo |
| 409 | `RESOURCE_IN_USE` | Exclusão bloqueada porque outro registro usa este, como "Este potencial está em uso por 3 produtores.": a tela mostra no diálogo de exclusão |
| 409 | `MEMBER_ALREADY_LINKED` | O membro escolhido já está vinculado a outro funcionário: a tela mostra no campo do membro |
| 413 | `PAYLOAD_TOO_LARGE` | Arquivo acima de 10 MB |
| 429 | `TOO_MANY_REQUESTS` | Novo código de verificação em menos de 60 segundos |
| 503 | `SERVICE_UNAVAILABLE` | O envio de e-mail falhou |

Para lançar, use `ConflictError` na duplicidade e `ResourceInUseError` na exclusão bloqueada (`src/shared/errors/app-error.ts`). Quando a tela precisa reconhecer um caso específico, `ValidationError`, `ConflictError` e `DomainError` aceitam um `code` próprio (ex.: `EMAIL_NOT_VERIFIED`); sem código, o `DomainError` responde `VALIDATION_ERROR`.

## Arquivos

* `POST /files` recebe um `multipart/form-data` com um único arquivo no campo `file` (até 10 MB; PDF, imagens JPG/PNG/WEBP/GIF, TXT, CSV e documentos, planilhas e apresentações do Office).
* `GET /files` lista (com `page`, `limit` e `search` pelo nome), `GET /files/:id` devolve os dados, `PATCH /files/:id` renomeia (`originalName`) e `DELETE /files/:id` exclui (soft delete: o conteúdo continua no armazenamento).
* `GET /files/:id/download` devolve o conteúdo. Como exige o header `Authorization`, o front-end baixa com `fetch` e usa o `blob` da resposta (não funciona direto em `<img src>` ou `<a href>`).

O conteúdo fica em disco, na pasta `STORAGE_DIR` (padrão `uploads/`, fora do Git), separado por empresa. A logo da empresa fica na mesma pasta (`<empresa>/logo-<uuid>.png`), sem registro em `/files`. O campo `url` do registro é a chave do arquivo nessa pasta, não um link público. Para trocar por um serviço como S3, basta outra implementação de `StorageProvider` (`src/shared/application/storage/`) registrada em `src/shared/container.ts`.

## Executando

Para iniciar o ambiente de desenvolvimento:

```bash
yarn dev
```

A API estará disponível em:

```text
http://localhost:3333
```

## Qualidade de código

```bash
yarn validate    # todas as verificações: schema do Prisma, lint e tipos
yarn lint        # ESLint
yarn lint:fix    # ESLint corrigindo o que for automático
yarn typecheck   # checagem de tipos do TypeScript
yarn test:seed:main   # teste da seed da main, num banco temporário (veja Seed da main)
```

## Banco de dados

O projeto utiliza PostgreSQL e Prisma ORM para gerenciamento e acesso aos dados.

Para abrir o Prisma Studio:

```bash
yarn prisma studio
```

## Versionamento

O projeto utiliza Git para versionamento e segue o padrão Conventional Commits.

Exemplos:

```text
feat: add producer registration
fix: fix producer validation
refactor: improve authentication
```

## Status

Em desenvolvimento.

## Projeto

Projeto Integrador — Sistema Web
Engenharia de Software — UNISATC
Santerra — Criciúma/SC

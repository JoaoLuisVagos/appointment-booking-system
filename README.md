# Appointment Booking System

Sistema full stack de agendamento para pequenos negócios, com foco em operação diária de loja e atendimento ao cliente.

Este projeto foi construido para demonstrar entrega ponta a ponta: API, front-end, banco relacional e ambiente reproduzivel com Docker.

## Objetivo

Resolver um problema comum de operação: organizar serviços, equipe e agenda em um fluxo único, evitando controle manual disperso.

## Perfis e regras de acesso

- Cliente:
	agenda serviços e gerencia seus proprios horarios.
- Loja:
	cadastra produtos, funcionários e gerencia a agenda da equipe.
- Funcionario:
	visualiza apenas seus proprios horarios e não pode cadastrar outros funcionários.

## Funcionalidades implementadas

- Autenticação com JWT (registro e login).
- Isolamento de dados por loja (produtos, usuarios e horarios).
- Cadastro e gestão de produtos por loja.
- Gestão de funcionários pela loja (criar, editar e excluir).
- Agendamento e remarcacao de horarios.
- Regras de permissão por papel aplicadas no back-end.
- Tratamento de erros com mensagens amigaveis no front-end.

## Decisoes tecnicas relevantes

- Multi-tenant por loja:
	adicionada associacao de loja nas entidades principais e filtros de escopo no back-end.
- Autorizacao no servidor:
	regras de permissão são validadas na API, não apenas na interface.
- Evolucao incremental:
	o histórico de commits mostra ajustes de regra de negocio conforme feedback de uso.

## Stack tecnica

### Back-end
- .NET 8
- ASP.NET Core Web API
- Entity Framework Core + MySQL
- JWT Bearer Authentication
- BCrypt (hash de senha)

### Front-end
- React
- TypeScript
- Vite

### Infra
- Docker
- Docker Compose

## Arquitetura (visao rapida)

- front-end:
	interface web e consumo da API.
- back-end:
	autenticação, autorizacao, regras de negocio e persistencia.
- database:
	schema relacional para usuarios, produtos e horarios.

Fluxo principal:
1. Usuario autentica.
2. Front-end envia JWT nas requisições protegidas.
3. API valida token, papel e escopo da loja.
4. Dados sao persistidos e retornados conforme permissoes.

## Como executar

### Opcao 1: Docker (recomendado)

Requisitos:
- Docker
- Docker Compose

Comando:

```bash
docker compose up --build -d
```

Acessos:
- Front-end: http://localhost:5173
- API: http://localhost:5000
- Swagger: http://localhost:5000/swagger
- Banco (host): localhost:3307

### Opcao 2: Execucao local

Back-end:

```bash
cd back-end
dotnet restore
dotnet run
```

Front-end:

```bash
cd front-end
npm install
npm run dev
```

## Qualidade e proximos passos

Melhorias planejadas para maturidade de produção:

- Cobertura de testes automatizados (unitarios e integracao).
- Camada de serviços para reduzir regra de negocio em controllers.
- Migracoes versionadas de banco com EF Core.
- Pipeline CI para build, testes e validacao automatica.
- Observabilidade (logs estruturados e metricas).

## Sobre este repositorio

Este projeto representa minha evolução como dev, com foco em aprender construindo produto real: implementar, validar com feedback e refinar regras de negocio.

## Autor

Joao Luis Vagos

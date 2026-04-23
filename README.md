# Appointment Booking System

Sistema full stack de agendamento que estou construindo para treinar fluxo real de produto: autenticação, permissões, multi-tenant por loja e deploy em produção.

## Sobre o projeto

A ideia é simples: cada loja consegue organizar produtos, equipe e agenda em um lugar só.

Também estou usando esse projeto para evoluir como dev, então ele vem sendo melhorado em ciclos curtos (feature, feedback, ajuste).

## Links em produção

- Front-end (Vercel): https://appointment-booking-system-orcin.vercel.app
- API (Render): https://appointment-booking-system-tjfd.onrender.com

Observação: como a API está em plano gratuito, a primeira requisição pode demorar um pouco quando o serviço está "frio".

## Perfis do sistema

- Cliente: agenda e acompanha seus próprios horários.
- Loja: gerencia produtos, equipe e agenda da loja.
- Funcionário: visualiza e opera apenas os próprios horários.

## Funcionalidades atuais

- Login e registro com JWT.
- Isolamento de dados por loja (multi-tenant).
- Gestão de produtos da loja.
- Gestão de funcionários (somente loja).
- Agendamento e remarcação de horários.
- Regras de permissão validadas no back-end.
- Fluxo de cadastro de cliente por link da loja.
- Feedback de sucesso/erro no front com toasts.

## Stack usada

### Back-end
- .NET 8
- ASP.NET Core Web API
- Entity Framework Core
- PostgreSQL (Supabase)
- JWT + BCrypt

### Front-end
- React
- TypeScript
- Vite

### Infra
- Docker / Docker Compose (ambiente local)
- Render (API)
- Vercel (front-end)
- Supabase (banco)

## Como rodar localmente

### Opção 1: Docker (mais fácil)

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
- Banco (host): localhost:5432

### Opção 2: Manual

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

## Objetivos de evolução

Próximos passos que quero seguir:

- aumentar cobertura de testes
- organizar melhor regras de negócio em serviços
- melhorar observabilidade e logs
- continuar refinando UX do fluxo loja/cliente

## Autor

Joao Luis Vagos

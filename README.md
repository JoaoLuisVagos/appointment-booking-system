# Appointment Booking System

Projeto full stack de agendamento online, pensado para um fluxo simples:
cliente agenda, vendedor organiza serviços e horarios, sistema centraliza tudo.

Este repositorio foi construido para demonstrar capacidade de entrega ponta a ponta:
- API com autenticação e regras de negocio
- Front-end com fluxo real de uso
- Banco relacional com modelagem basica
- Ambiente reproduzivel com Docker

## Sobre o projeto

A ideia deste sistema e resolver um problema comum em pequenos negocios:
controle de agenda e serviços sem depender de processos manuais.

O produto tem dois perfis:
- Cliente: escolhe serviço e cria agendamento
- Vendedor: cadastra produtos/serviços e gerencia horarios
s
## Minha jornada de aprendizado

Estou em processo de aprendizado de .NET, e este projeto foi construído ao longo de semanas de estudo para colocar o conteúdo em prática de forma real.

Mais do que um código final, este repositório representa minha evolução técnica: cada ajuste, refatoração e melhoria foi parte do meu desenvolvimento como dev.

## O que este projeto demonstra

- Capacidade de construir uma aplicao completa (front + back + banco)
- Estruturacao de API REST com autenticação JWT
- Integracao entre React e ASP.NET
- Uso de Docker Compose para facilitar execucao local
- Evolução continua: melhorias de UX, mensagens de erro e robustez

## Stack tecnica

### Back-end
- .NET 8
- ASP.NET
- JWT Bearer Authentication
- BCrypt (hash de senha)
- MySQL

### Front-end
- React + TypeScript

### Infra
- Docker
- Docker Compose

## Funcionalidades atuais

- Registro e login de usuarios
- Controle de perfil por role (cliente/vendedor)
- Cadastro de produtos
- Criacao e consulta de agendamentos
- Retorno de dados de relacionamento (usuario e produto) nos horarios
- Tratamento de erros com mensagens amigaveis no front-end

## Arquitetura (visao rapida)

- front-end: interface e consumo da API
- back-end: autenticação, regras de negocio e persistencia
- database: schema SQL inicial

Fluxo principal:
1. Usuario autentica
2. Front envia token JWT
3. API valida token e executa regras
4. Dados persistem no banco

## Como executar

### Opcao 1: Docker (recomendado)

Requisitos:
- Docker
- Docker Compose

Passos:
1. Na raiz do projeto, ajuste o arquivo .env se necessario
2. Execute:

```bash
docker compose up --build -d
```

Acessos:
- Front-end: http://localhost:5173
- API: http://localhost:5000
- Swagger: http://localhost:5000/swagger
- Banco (host): localhost:3307

### Opcao 2: Execucao local sem Docker

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

## Diferenciais de engenharia

- Ambiente de desenvolvimento padronizado com compose
- Separacao de responsabilidades por camadas/pastas
- Ajustes de payload para melhorar consumo no front-end
- Mensagens de erro orientadas ao usuario final

## Melhorias planejadas

- Camada de serviços para reduzir logica em controllers
- Testes automatizados (unitarios e integracao)
- Migracoes versionadas de banco com EF
- Pipeline CI para build e validacao automatica
- Observabilidade (logs estruturados e metricas)

## Autor

João Luis Vagos

Se você é recrutador(a), obrigado por avaliar este projeto.
Ele representa não apenas o estado atual do codigo, mas tambem minha forma de evoluir produto com feedback rapido, foco em clareza e melhoria continua.

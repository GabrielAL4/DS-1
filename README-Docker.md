# Controle de Sala FEMASS - Docker Setup

Este projeto está configurado para rodar em containers Docker, separando o backend (Spring Boot) e frontend (Next.js) em containers distintos.

## Pré-requisitos

- Docker Desktop instalado e rodando
- Docker Compose (geralmente vem com Docker Desktop)

### Verificando o Docker Desktop

Antes de executar os containers, certifique-se de que o Docker Desktop está rodando:

1. Abra o Docker Desktop manualmente ou execute o script `check-docker.bat`
2. Aguarde até que o ícone do Docker na bandeja do sistema fique verde
3. Execute `docker info` no terminal para confirmar que está funcionando

## Estrutura dos Containers

- **Backend**: Spring Boot com Java 17 (porta 8080)
- **Frontend**: Next.js com Node.js 18 (porta 3000)

## Como Usar

### Opção 1: Script Automatizado (Recomendado)

#### Para Windows (Batch):
1. **Primeiro, verifique se o Docker Desktop está rodando:**
   ```bash
   check-docker.bat
   ```

2. **Depois, execute o script principal:**
   ```bash
   start-docker.bat
   ```

#### Para Windows (PowerShell):
```powershell
.\start-docker.ps1
```

Este script oferece um menu interativo com as seguintes opções:
1. Construir e iniciar containers
2. Parar containers
3. Remover containers
4. Ver logs do backend
5. Ver logs do frontend
6. Acessar shell do backend
7. Acessar shell do frontend
8. Sair

### Opção 2: Comandos Docker Compose

#### Iniciar os containers:
```bash
docker-compose up --build -d
```

#### Parar os containers:
```bash
docker-compose down
```

#### Ver logs:
```bash
# Logs do backend
docker-compose logs -f backend

# Logs do frontend
docker-compose logs -f frontend
```

#### Remover containers e imagens:
```bash
docker-compose down --rmi all --volumes --remove-orphans
```

## Acessos

Após iniciar os containers:

- **Backend API**: http://localhost:8080
- **Frontend**: http://localhost:3000
- **H2 Console**: http://localhost:8080/h2-console
- **Swagger UI**: http://localhost:8080/swagger-ui.html

## Configurações

### Backend
- Java 17
- Spring Boot 3.4.3
- H2 Database (memória)
- Porta: 8080

### Frontend
- Node.js 18
- Next.js 14
- Porta: 3000

## Troubleshooting

### Docker Desktop não inicia:
1. Verifique se o Docker Desktop está instalado corretamente
2. Reinicie o computador se necessário
3. Execute o script `check-docker.bat` para tentar iniciar automaticamente

### Se o frontend não conseguir conectar ao backend:
1. Verifique se o backend está rodando: `docker-compose logs backend`
2. Confirme se a porta 8080 está disponível
3. Verifique se a variável de ambiente `NEXT_PUBLIC_API_URL` está configurada corretamente
4. Teste a API diretamente: `curl http://localhost:8080`

### Se houver problemas de build:
1. Limpe as imagens Docker: `docker system prune -a`
2. Reconstrua os containers: `docker-compose up --build --force-recreate`
3. Verifique se há erros de sintaxe no código

### Problemas de permissão no Windows:
1. Execute o PowerShell como administrador
2. Verifique se o WSL2 está habilitado (necessário para Docker Desktop)

### Para desenvolvimento local:
- Backend: Execute `./mvnw spring-boot:run` na pasta `ControleDeSalaFEMASSJava`
- Frontend: Execute `npm run dev` na pasta `ds1-2025.1`

### Comandos úteis:
```bash
# Ver status dos containers
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Acessar shell do container
docker-compose exec backend /bin/bash
docker-compose exec frontend /bin/sh

# Parar e remover tudo
docker-compose down --rmi all --volumes --remove-orphans
```

## Volumes e Persistência

Os dados do H2 database são mantidos em memória e serão perdidos quando o container for parado. Para persistência, considere usar um banco de dados externo como PostgreSQL ou MySQL. 
# Sicredi Conexão - Nossas Ideias

## Como executar

Pré-requisito: ter o [Docker](https://docs.docker.com/get-docker/) com o Docker Compose instalado.

Na raiz do projeto, execute:

```bash
docker compose up -d --build
```

O comando inicia o banco de dados, o backend e o frontend. Na primeira execução, as migrações e os dados iniciais do banco são aplicados automaticamente.

Após a inicialização, acesse:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

Para parar os containers, pressione `Ctrl+C` ou execute:

```bash
docker compose down
```

Para parar os containers e remover os dados persistidos do banco:

```bash
docker compose down -v
```

#

# Evolução da Solução:

## - Quais mudanças arquiteturais seriam necessárias para suportar o crescimento da solução?

- Migrar o login para o EntraID, não necessitando mais de cadastro de usuários.
- Adição de index nas colunas das tabela de requests, visto que o número de requisição pode crescer exponencialmente.

#

## Quais seriam os principais riscos técnicos identificados?

- Por ser um MVP, não foi trabalho prevenção de SQL Injection e XSS injection.
- Não possui tabela de logs de auditoria, sendo assim, não tem rastreabilidade cobrada para homologação.

#

## Como garantir escalabilidade, disponibilidade e manutenibilidade da aplicação?

- Subir a aplicação na devconsole, trabalhando com CI/CD entre os ambientes de HOM/UAT/PROD, assim evitando que o sistema fique fora durante lançamento de novas versões.
- Trabalhar com os PODS disponíveis na devconsole, assim distribuindo o consumo da aplicação entre os pods, evitando estresse e quedas imprevistas.

#

## Quais componentes ou camadas poderiam ser adicionados em uma evolução futura da arquitetura?

- Login EntraID.
- Consumo de dados diretamente do Databricks (algo que só está disponível na devconsole).
- RBAC no backend, baseado nos cargos dos usuários das tabelas de colaboradores_por_cargo_nova do Denodo, que seria enviada para o Databricks para incorporar o sistema.
- Tabela de auditoria, que poderia ser populada através do logger.middleware.ts. Para isso, é necessário criar um logger.service e module para que cada requisição que passe pelo middleware, gere uma linha de log no banco, atendendo a homologação do CAS e tracking de, no mínimo, 6 meses da aplicação.

# Integração com Sistemas Externos:

## Como realizaria esta integração?

- Mensageria ou polling de requisições.

#

## Quais padrões ou tecnologias utilizaria?

- Para mensageria: poderia trabalhar com RabbitMQ para orquestrar a fila de requisições.
- Para polling: trabalharia controlando as solicitações por uma tabela de integration e números de tentativa a cada tempo.

#

## Como trataria falhas de comunicação?

- Implementaria timeouts para evitar que chamadas ao sistema externo fiquem aguardando indefinidamente.
- Em caso de falhas temporárias, como indisponibilidade ou timeout, realizaria novas tentativas com intervalos progressivos entre.
- Limitaria o número de tentativas e registraria as falhas persistentes para análise e possível reprocessamento.
- Utilizaria identificadores únicos para as operações e mecanismos de idempotência para evitar duplicidades durante as tentativas.

#

## Como garantiria rastreabilidade das operações realizadas?

- Manteria registros das integrações realizadas, contendo o identificador da solicitação, status da integração, data e hora, número de tentativas, código de resposta e detalhes de eventuais erros.
- Utilizaria logs estruturados com um identificador único para facilitar o acompanhamento de cada operação entre os serviços.
- Armazenaria o histórico das tentativas, permitindo consultar falhas, identificar a causa de problemas e realizar reprocessamentos quando necessário.

#

## Como evitaria impacto na experiência do usuário caso o sistema externo estivesse indisponível?

- Realizaria a integração de forma assíncrona, permitindo que o usuário conclua a aprovação sem precisar aguardar a resposta do sistema externo.
- Manteria a solicitação aprovada e o status da integração separado, permitindo informar ao usuário que a aprovação foi concluída, mas a integração ainda está pendente.

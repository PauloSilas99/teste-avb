# Health Check - Verificação de Conexão com Banco de Dados

## Endpoint de Health Check

Foi criado um endpoint para verificar a conexão com o banco de dados em ambiente de produção.

### URL do Endpoint

```
GET /api/health/db
```

### Como Usar

#### 1. **Na Vercel (Produção)**
Acesse a URL completa do seu projeto:
```
https://avb-teste.vercel.app/api/health/db
```

#### 2. **Localmente (Desenvolvimento)**
```
http://localhost:3000/api/health/db
```

### Resposta do Endpoint

O endpoint retorna um JSON com informações detalhadas sobre o status da conexão:

#### ✅ **Status 200 - Healthy**
```json
{
  "status": "healthy",
  "database": {
    "connected": true,
    "url": "configured",
    "urlMasked": "postgresql://hostname:port/database?***",
    "responseTime": 45,
    "error": null
  },
  "tests": {
    "connection": true,
    "query": true,
    "count": 5
  },
  "environment": "production",
  "timestamp": "2024-11-20T21:30:00.000Z"
}
```

#### ⚠️ **Status 200 - Degraded**
```json
{
  "status": "degraded",
  "database": {
    "connected": true,
    "urlMasked": "postgresql://hostname:port/database?***",
    "responseTime": 120,
    "error": "Query failed: ..."
  },
  "tests": {
    "connection": true,
    "query": false,
    "count": null
  },
  "environment": "production",
  "timestamp": "2024-11-20T21:30:00.000Z"
}
```

#### ❌ **Status 503 - Unhealthy**
```json
{
  "status": "unhealthy",
  "database": {
    "connected": false,
    "urlMasked": null,
    "responseTime": 5000,
    "error": "Connection failed: timeout"
  },
  "tests": {
    "connection": false,
    "query": false,
    "count": null
  },
  "environment": "production",
  "timestamp": "2024-11-20T21:30:00.000Z"
}
```

### Campos da Resposta

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `status` | string | `healthy`, `degraded`, `unhealthy`, `error` |
| `database.connected` | boolean | Se a conexão foi estabelecida |
| `database.url` | string | Sempre "configured" (não expõe a URL real) |
| `database.urlMasked` | string | URL mascarada mostrando apenas host e database |
| `database.responseTime` | number | Tempo de resposta em milissegundos |
| `database.error` | string \| null | Mensagem de erro se houver |
| `tests.connection` | boolean | Se o teste de conexão passou |
| `tests.query` | boolean | Se o teste de query passou |
| `tests.count` | number \| null | Número de usuários no banco |
| `environment` | string | Ambiente atual (development/production) |
| `timestamp` | string | ISO timestamp da verificação |

### Testes Realizados

O endpoint realiza os seguintes testes:

1. **Verificação de Variável de Ambiente**
   - Verifica se `DATABASE_URL` está configurada

2. **Teste de Conexão**
   - Tenta conectar ao banco usando `prisma.$connect()`
   - Mede o tempo de resposta

3. **Teste de Query**
   - Executa `prisma.usuario.count()` para verificar se consegue ler dados
   - Retorna o número de usuários cadastrados

4. **Teste de Schema**
   - Tenta contar registros em outras tabelas para validar o schema

### Como Testar no Navegador

1. Acesse `https://avb-teste.vercel.app/api/health/db`
2. O resultado será exibido como JSON
3. Use uma extensão como "JSON Formatter" para melhor visualização

### Como Testar com cURL

```bash
# Produção
curl https://avb-teste.vercel.app/api/health/db

# Local
curl http://localhost:3000/api/health/db
```

### Como Testar com JavaScript/Fetch

```javascript
fetch('https://avb-teste.vercel.app/api/health/db')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err))
```

### Troubleshooting

#### Erro: "DATABASE_URL not configured"
- Verifique se a variável `DATABASE_URL` está configurada na Vercel
- Vá em **Settings** → **Environment Variables**
- Certifique-se de que está configurada para **Production**

#### Erro: "Connection failed"
- Verifique se a URL do banco está correta
- Verifique se o banco Neon permite conexões da Vercel
- Verifique se há problemas de rede/firewall
- Verifique os logs da Vercel em **Deployments** → **Functions**

#### Erro: "Query failed"
- A conexão está OK mas as queries falham
- Pode indicar problema com o schema do banco
- Verifique se as migrations foram aplicadas
- Execute `prisma db push` ou `prisma migrate deploy` se necessário

#### Tempo de Resposta Alto
- Valores acima de 1000ms podem indicar problemas de rede
- Verifique a localização do banco de dados (região)
- Considere usar connection pooling

### Segurança

- ✅ A URL completa do banco **não é exposta** (apenas mascarada)
- ✅ O endpoint é público mas não expõe dados sensíveis
- ✅ Apenas contagens são retornadas, não dados reais
- ⚠️ Considere adicionar autenticação se necessário em produção

### Integração com Monitoramento

Este endpoint pode ser usado com:
- **Vercel Analytics** - Monitorar uptime
- **Uptime Robot** - Verificações periódicas
- **Status Page** - Exibir status público
- **Logs da Vercel** - Verificar erros em tempo real

### Exemplo de Uso em Monitoramento

Configure verificações periódicas (ex: a cada 5 minutos):
```
https://avb-teste.vercel.app/api/health/db
```

Se retornar status diferente de 200, você será notificado de problemas com o banco.


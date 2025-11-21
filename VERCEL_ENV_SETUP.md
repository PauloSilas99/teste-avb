# Configuração de Variáveis de Ambiente na Vercel

## Variáveis Obrigatórias

Para o projeto funcionar corretamente na Vercel, você precisa configurar as seguintes variáveis de ambiente:

### 1. `NEXTAUTH_URL` ou `AUTH_URL` ⚠️ **ESSENCIAL**
- **O que é**: URL base do seu aplicativo em produção
- **Valor**: A URL completa do seu projeto na Vercel
- **Exemplo**: `https://seu-projeto.vercel.app`
- **Como obter**: Após o deploy, copie a URL fornecida pela Vercel
- **Por que é importante**: Sem essa variável, o NextAuth não consegue gerar URLs corretas para callbacks e redirecionamentos, causando falhas no login

### 2. `NEXTAUTH_SECRET` ou `AUTH_SECRET` ⚠️ **ESSENCIAL**
- **O que é**: Chave secreta para criptografar tokens JWT
- **Valor**: Uma string aleatória segura
- **Como gerar**: 
  ```bash
  openssl rand -base64 32
  ```
  ou use o mesmo valor que você tem localmente
- **Por que é importante**: Necessário para criptografar e descriptografar os tokens de sessão

### 3. `DATABASE_URL` ⚠️ **ESSENCIAL**
- **O que é**: URL de conexão com o banco de dados PostgreSQL (Neon)
- **Valor**: A URL de conexão do seu banco Neon
- **Exemplo**: `postgresql://user:password@host/database?sslmode=require`
- **Por que é importante**: Sem essa variável, o Prisma não consegue conectar ao banco de dados

## Como Configurar na Vercel

1. Acesse o painel do seu projeto na Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione cada variável:
   - **Name**: O nome da variável (ex: `NEXTAUTH_URL`)
   - **Value**: O valor da variável
   - **Environment**: Selecione **Production**, **Preview** e **Development** conforme necessário
4. Clique em **Save**
5. **Redeploy** o projeto para aplicar as mudanças

## Variáveis Recomendadas por Ambiente

### Production
```
NEXTAUTH_URL=https://seu-projeto.vercel.app
NEXTAUTH_SECRET=sua-chave-secreta-aqui
DATABASE_URL=sua-url-do-neon-aqui
```

### Preview (opcional, pode usar as mesmas de Production)
```
NEXTAUTH_URL=https://seu-projeto-git-branch.vercel.app
NEXTAUTH_SECRET=sua-chave-secreta-aqui
DATABASE_URL=sua-url-do-neon-aqui
```

## Verificação

Após configurar as variáveis e fazer o redeploy:

1. Acesse a URL do seu projeto na Vercel
2. Tente fazer login
3. Se ainda não funcionar, verifique o console do navegador (F12) para ver erros
4. Verifique os logs da Vercel em **Deployments** → selecione o deploy → **Functions** → `/api/auth/[...nextauth]`

## Troubleshooting

### Login não funciona / Página carrega mas nada acontece
- ✅ Verifique se `NEXTAUTH_URL` está configurada com a URL correta da Vercel
- ✅ Certifique-se de que fez o redeploy após adicionar as variáveis
- ✅ Verifique se `NEXTAUTH_SECRET` está configurada
- ✅ Verifique os logs da Vercel para erros específicos

### Erro de conexão com banco de dados
- ✅ Verifique se `DATABASE_URL` está correta
- ✅ Verifique se o banco Neon permite conexões da Vercel
- ✅ Certifique-se de que a URL inclui `?sslmode=require` se necessário

### Erro "MissingSecretError"
- ✅ Adicione `NEXTAUTH_SECRET` ou `AUTH_SECRET` nas variáveis de ambiente


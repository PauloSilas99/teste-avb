# Troubleshooting: Erro 307 Temporary Redirect

## Problema
Ao tentar acessar `/dashboard` após o login, você vê um erro **307 Temporary Redirect** no Network tab do navegador.

## Causa
O middleware está redirecionando para `/login` porque não está conseguindo ler o token de autenticação do cookie.

## Checklist de Verificação na Vercel

### 1. ✅ NEXTAUTH_URL (Você já configurou)
- **Valor**: `https://avb-teste.vercel.app`
- **Importante**: Deve começar com `https://` (não `http://`)
- **Ambiente**: Production (e Preview se necessário)

### 2. ⚠️ NEXTAUTH_SECRET (VERIFIQUE AGORA)
- **Nome**: `NEXTAUTH_SECRET` ou `AUTH_SECRET`
- **Valor**: Deve ser **exatamente o mesmo** do seu `.env` local
- **Valor local**: `ZVwHCPXnXGj/6sjOHV1gY19u9oB8G8VLLOU8Q/Geh+c=`
- **Ambiente**: Production (e Preview se necessário)
- **⚠️ CRÍTICO**: Se o secret estiver diferente, o token não será validado!

### 3. ⚠️ DATABASE_URL
- **Nome**: `DATABASE_URL`
- **Valor**: URL completa do seu banco Neon
- **Ambiente**: Production (e Preview se necessário)

## Passos para Resolver

### Passo 1: Verificar Variáveis na Vercel
1. Acesse **Settings** → **Environment Variables**
2. Verifique se TODAS as 3 variáveis estão configuradas:
   - `NEXTAUTH_URL` ✅ (você já tem)
   - `NEXTAUTH_SECRET` ⚠️ (VERIFIQUE)
   - `DATABASE_URL` ⚠️ (VERIFIQUE)

### Passo 2: Redeploy Obrigatório
**IMPORTANTE**: Após adicionar/modificar variáveis de ambiente:
1. Vá em **Deployments**
2. Clique nos **3 pontos** do último deploy
3. Selecione **Redeploy**
4. Aguarde o deploy completar

### Passo 3: Testar
1. Limpe o cache do navegador (Ctrl+Shift+Delete ou Cmd+Shift+Delete)
2. Acesse `https://avb-teste.vercel.app/login`
3. Faça login
4. Verifique no Network tab se o redirecionamento para `/dashboard` é **200 OK** (não 307)

## Debug Adicional

### Verificar Logs da Vercel
1. Vá em **Deployments** → selecione o último deploy
2. Clique em **Functions** → `/api/auth/[...nextauth]`
3. Procure por erros relacionados a:
   - "MissingSecretError"
   - "JWT decode error"
   - Erros de conexão com banco

### Verificar Console do Navegador
1. Abra o DevTools (F12)
2. Vá na aba **Console**
3. Tente fazer login
4. Procure por erros como:
   - "Failed to fetch"
   - Erros de CORS
   - Erros de autenticação

### Verificar Cookies
1. Abra o DevTools (F12)
2. Vá em **Application** → **Cookies**
3. Verifique se existe um cookie chamado:
   - `authjs.session-token` ou
   - `__Secure-authjs.session-token`
4. Se o cookie não existir após o login, o problema é na criação do cookie
5. Se o cookie existir mas o 307 continua, o problema é na leitura do cookie

## Possíveis Causas Adicionais

### 1. Secret Diferente
**Sintoma**: Cookie é criado mas middleware não valida
**Solução**: Garantir que `NEXTAUTH_SECRET` é idêntico em dev e produção

### 2. Cookie Não Criado
**Sintoma**: Não aparece cookie após login
**Solução**: 
- Verificar logs da Vercel em `/api/auth/[...nextauth]`
- Verificar se `trustHost: true` está na configuração (já está)
- Verificar se há erros no console do navegador

### 3. Problema com Secure Cookies
**Sintoma**: Cookie não é enviado em requisições
**Solução**: NextAuth v5 detecta automaticamente HTTPS e usa `__Secure-` prefix

### 4. Cache do Navegador
**Sintoma**: Comportamento inconsistente
**Solução**: Limpar cache e cookies do site

## Se Nada Funcionar

1. **Verifique os logs da Vercel** em tempo real durante o login
2. **Teste em modo anônimo/incógnito** do navegador
3. **Verifique se o usuário existe no banco** de dados
4. **Confirme que o DATABASE_URL está correto** e acessível da Vercel


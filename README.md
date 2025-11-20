# Teste AVB

Sistema de gerenciamento de cadastros de materiais de aço desenvolvido com Next.js, TypeScript e Prisma.

## Tecnologias Utilizadas

### Frontend
- **Next.js 16** 
- **TypeScript** 
- **Tailwind CSS 4** 
- **Heroicons** - Ícones React
- **Recharts** - Gráficos e visualizações de dados

### Backend & Autenticação
- **NextAuth v5** - Autenticação e gerenciamento de sessão
- **bcryptjs** - Hash de senhas
- **API Routes** - Endpoints RESTful

### Banco de Dados
- **Prisma ORM** - ORM para TypeScript
- **PostgreSQL** - Banco de dados (Neon Database)
- **@neondatabase/serverless** - Driver para Neon

## Funcionalidades

### Autenticação
- Login com email e senha
- Registro de novos usuários
- Proteção de rotas com middleware
- Sessão persistente com JWT
- Modal de confirmação para logout
- Redirecionamento automático baseado em autenticação

### Cadastro de Materiais
- CRUD completo de cadastros de aço
- Campos: Nome, Composição, Formato, Norma Técnica, Acabamento
- Modal de criação/edição
- Lista de materiais com scroll otimizado
- Exclusão com modal de confirmação
- Validação de formulários

### Dashboard e Relatórios
- Dashboard com lista de cadastros
- Página de relatórios com gráficos
- Gráfico de barras (distribuição por composição)
- Gráfico de pizza (distribuição por acabamento)
- Estatísticas em tempo real
- Layout responsivo

### Instalação

```bash
# Instalar dependências
npm install
```

### Configuração do Banco de Dados

```bash
# Gerar cliente Prisma
npm run db:generate

# Aplicar migrations
npm run db:push
# ou
npm run db:migrate

# (Opcional) Popular banco com dados de teste
npm run seed

# Abrir Prisma Studio
npm run db:studio
```

### Executar o Projeto

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar produção
npm start
```

Acesse [http://localhost:3000](http://localhost:3000)

## Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm start` - Inicia servidor de produção
- `npm run lint` - Executa ESLint
- `npm run db:generate` - Gera cliente Prisma
- `npm run db:push` - Aplica schema ao banco
- `npm run db:migrate` - Executa migrations
- `npm run db:studio` - Abre Prisma Studio
- `npm run seed` - Popula banco com dados de teste

## Modelos de Dados

- **Usuario** - Usuários do sistema
- **CadastroAco** - Cadastros de materiais de aço
- **Composicao** - Tipos de composição
- **Formato** - Formatos de material
- **NormaTecnica** - Normas técnicas
- **AcabamentoSuperficial** - Tipos de acabamento

## Segurança

- Senhas hasheadas com bcrypt
- Proteção de rotas com middleware
- Validação de sessão em todas as requisições
- Headers de cache para prevenir navegação após logout
- CSRF protection do NextAuth

## Responsividade

- Layout adaptável para mobile, tablet e desktop
- Componentes otimizados para diferentes tamanhos de tela
- Scroll otimizado em listas e modais

Projeto de teste para AVB.

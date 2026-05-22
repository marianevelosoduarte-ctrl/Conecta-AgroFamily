# 🌱 Conecta Agrofamily

> **Gestão Inteligente para o Campo** — tecnologia que conecta o campo e a família.

Plataforma digital de gestão rural para **agricultores familiares**: controle de
produção, finanças e vendas em um só lugar, com linguagem simples e acesso pelo
celular ou computador.

Projeto desenvolvido para o **Piauí para o Mundo 2026** — Trilha de Tecnologia da
Informação (CETI Irapuã, Sebastião Leal-PI).

---

## 🎯 O problema

Muitos agricultores familiares administram a produção sem planejamento e sem
controle de gastos, anotando tudo no caderno ou na memória. Isso gera
desperdício, baixa lucratividade e dificulta a tomada de decisão.

## 💡 A solução

O **Conecta Agrofamily** organiza, de forma simples, a vida financeira e produtiva
da propriedade:

- 🏠 **Painel** com saldo, receitas, despesas e gráficos
- 🌱 **Produção** — registro de plantios e colheitas
- 💸 **Despesas** — controle de gastos por categoria
- 🛒 **Vendas** — registro de vendas e clientes (com cálculo automático)
- 📊 **Relatórios** — visão geral com gráficos e impressão
- 🧮 **Simulador de Lucro** — estima o resultado da safra antes de plantar
- ☁️ **Clima** — previsão do tempo da região (API Open-Meteo)

Cada agricultor acessa **apenas os dados da própria propriedade** (multi-tenant).

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework | **Next.js 16** (App Router, React 19, TypeScript) |
| Estilo | **Tailwind CSS 4** + **shadcn/ui** + Poppins |
| Banco de dados | **PostgreSQL** + **Prisma 7** |
| Autenticação | **NextAuth 5** (credenciais + JWT) |
| Dados no cliente | **TanStack Query** |
| Gráficos | **Recharts** |
| Clima | **Open-Meteo** (API gratuita) |
| Deploy | **Railway** |

## 🧱 Arquitetura (resumo)

```
src/
├─ app/
│  ├─ (auth)/        → login e cadastro
│  ├─ (app)/         → painel, produção, despesas, vendas, relatórios,
│  │                   simulador, clima, ajustes
│  └─ api/           → rotas de dados (escopadas por propriedade)
├─ features/         → hooks + componentes de cada módulo
├─ components/       → UI (shadcn), layout, marca
└─ lib/              → prisma, auth, utilitários, constantes
prisma/schema.prisma → modelo de dados
```

Segurança **multi-tenant**: toda rota de API valida a sessão e filtra os dados
pela propriedade do usuário logado.

---

## 🚀 Como executar localmente

**Pré-requisitos:** Node.js 20+ e um banco PostgreSQL.

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
#   edite o .env com sua DATABASE_URL e gere o AUTH_SECRET:
#   openssl rand -base64 32

# 3. Criar as tabelas no banco
npm run db:push

# 4. (Opcional) Popular com dados de exemplo
npm run db:seed

# 5. Rodar em desenvolvimento
npm run dev
```

Acesse **http://localhost:3000**.

### 🔑 Acesso de demonstração

Após rodar o seed:

- **E-mail:** `joao@exemplo.com`
- **Senha:** `123456`

Ou crie sua própria conta na tela de cadastro.

---

## 🌍 Próximos passos (roadmap)

- Marketplace rural para venda direta
- Alertas de pragas e clima
- Mapa da fazenda com talhões
- Aplicativo offline para áreas sem internet
- Relatórios em PDF e exportação de dados

---

## 👥 Equipe — CETI Irapuã (Sebastião Leal-PI)

- Roberta Alves Rocha
- André Veloso de Sousa
- Ingrid Pereira de Araújo Sousa
- Mariane Veloso Duarte
- Carlos Henrique Araújo de Sousa

**Orientadora:** Carla Patrícia Feitosa de Sousa

---

*Conecta Agrofamily — Juntos, cultivamos um futuro melhor.* 🌾

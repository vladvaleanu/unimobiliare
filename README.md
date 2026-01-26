# Unimobiliare

Platforma de Unificare Imobiliară din România - Agregăm automat anunțurile de pe principalele platforme, eliminăm duplicatele și te alertăm instant când apare ceva nou.

## 🚀 Tech Stack

- **Frontend**: React 18 + Redux Toolkit + Material-UI 5
- **Backend**: Node.js 20 + Express + TypeScript
- **Database**: PostgreSQL 15 + Prisma ORM
- **Cache/Queue**: Redis 7 + BullMQ
- **Search**: Meilisearch
- **AI**: Ollama (local) + OpenAI/Anthropic (fallback)
- **Payments**: Stripe
- **Hosting**: Docker + Synology NAS

## 📁 Project Structure

```
unimobiliare/
├── apps/
│   ├── api/          # Node.js REST API
│   ├── web/          # React user app
│   ├── admin/        # React admin panel
│   └── worker/       # Background jobs
├── packages/
│   ├── shared/       # Shared code (types, constants, utils)
│   ├── database/     # Prisma schema, migrations
│   └── integrations/ # Platform adapters
├── docker/           # Dockerfiles
└── docs/             # Documentation
```

## 🛠️ Development

### Prerequisites

- Node.js 20+
- npm 10+
- Docker & Docker Compose

### Setup

```bash
# Clone repository
git clone https://github.com/vladvaleanu/unimobiliare.git
cd unimobiliare

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your values

# Start infrastructure
docker-compose up -d postgres redis meilisearch

# Run database migrations
npm run db:migrate

# Start development servers
npm run dev:api    # API on http://localhost:3000
npm run dev:web    # Web on http://localhost:3002
npm run dev:admin  # Admin on http://localhost:3001
```

## 📋 Key Features

- **No-Code Integration Builder** - Create platform adapters visually
- **Multi-Model AI** - Different AI models per task
- **Full Admin Panel** - Complete control with audit logging
- **Configurable Subscriptions** - Multiple tiers with Stripe

## 📄 License

Private - All rights reserved

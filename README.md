# Omni-Stock Inventory Aggregator

Real-time inventory and pricing aggregation from **Amazon**, **Target**, and **Menards** — unified into a single, beautiful dashboard.

## Architecture

```mermaid
graph TD
    subgraph Frontend["React + Vite + Tailwind"]
        UI[Dashboard UI]
        Hook[useInventorySearch Hook]
        TQ[TanStack Query Cache]
    end

    subgraph Backend["NestJS API"]
        Controller[SearchController]
        Orchestrator[RetailOrchestrator]
        Pipe[StandardizationPipe]
        Cache[(Redis Cache)]
    end

    subgraph Providers["Data Providers"]
        Amazon[AmazonProvider<br/>Rainforest API]
        Target[TargetProvider<br/>RedSky API]
        Menards[MenardsProvider<br/>Playwright Scraper]
    end

    UI --> Hook --> TQ
    TQ -->|GET /api/search| Controller
    Controller --> Orchestrator
    Orchestrator -->|Cache Hit| Cache
    Orchestrator -->|Promise.allSettled| Amazon & Target & Menards
    Amazon & Target & Menards --> Pipe
    Pipe -->|InventoryResult[]| Orchestrator
    Orchestrator -->|Cache Set| Cache
```

## Tech Stack

| Layer     | Technology                                      |
| --------- | ----------------------------------------------- |
| Frontend  | React 18, Vite, Tailwind CSS, TanStack Query    |
| Backend   | NestJS, TypeScript, Swagger/OpenAPI              |
| Providers | Rainforest API, Target RedSky API, Playwright    |
| Caching   | Redis via cache-manager (15 min TTL)             |
| Testing   | Jest (unit), Playwright (E2E)                    |
| CI/CD     | GitHub Actions, Vercel                           |
| Infra     | Docker, docker-compose                           |

## Monorepo Structure

```
omni-stock-inventory-aggregator/
├── packages/
│   ├── common/          # Shared types (InventoryResult, etc.)
│   ├── backend/         # NestJS API server
│   │   └── src/
│   │       └── search/
│   │           ├── providers/   # Amazon, Target, Menards
│   │           ├── services/    # RetailOrchestrator
│   │           ├── pipes/       # StandardizationPipe
│   │           └── dto/         # SearchQueryDto
│   └── frontend/        # React + Vite dashboard
│       └── src/
│           ├── components/  # Header, StatusBar, ProductGrid, ProductCard
│           └── hooks/       # useInventorySearch, useLocalStorage
├── e2e/                 # Playwright E2E tests
├── docker-compose.yml
├── Dockerfile.scraper   # Backend (Playwright-enabled)
├── Dockerfile.frontend  # Frontend (Nginx)
└── .github/workflows/   # CI/CD pipeline
```

## Quick Start

### Prerequisites

- Node.js 18+
- Redis (or use Docker)
- API keys for Rainforest API

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp packages/backend/.env.example packages/backend/.env
# Edit .env with your API keys
```

### 3. Start with Docker Compose

```bash
docker-compose up
```

Or run individually:

```bash
# Terminal 1 - Redis
docker run -p 6379:6379 redis:7-alpine

# Terminal 2 - Backend
npm run start:dev --workspace=packages/backend

# Terminal 3 - Frontend
npm run dev --workspace=packages/frontend
```

### 4. Open the app

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/search?query=drill&zipCode=55401
- **Swagger Docs**: http://localhost:3000/api/docs

## API

### `GET /api/search`

| Param   | Type   | Required | Description          |
| ------- | ------ | -------- | -------------------- |
| query   | string | Yes      | Product search term  |
| zipCode | string | Yes      | 5-digit US zip code  |

**Response:**

```json
{
  "results": [
    {
      "id": "uuid",
      "retailer": "Amazon",
      "title": "DeWalt 20V MAX Drill",
      "price": 129.99,
      "currency": "USD",
      "inStock": true,
      "storeLocation": "Amazon.com",
      "productUrl": "https://...",
      "imageUrl": "https://...",
      "lastUpdated": "2024-01-15T..."
    }
  ],
  "query": "drill",
  "zipCode": "55401",
  "timestamp": "2024-01-15T...",
  "errors": []
}
```

## Testing

```bash
# Unit tests
npm run test --workspace=packages/backend

# E2E tests
npx playwright test
```

## Environment Variables

| Variable           | Description                  | Default                 |
| ------------------ | ---------------------------- | ----------------------- |
| RAINFOREST_API_KEY | Rainforest API key           | —                       |
| TARGET_REDSKY_KEY  | Target RedSky API key        | —                       |
| REDIS_URL          | Redis connection URL         | redis://localhost:6379  |
| PORT               | Backend server port          | 3000                    |
| FRONTEND_URL       | Frontend URL for CORS        | http://localhost:5173   |

## License

MIT

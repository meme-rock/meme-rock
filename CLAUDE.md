# Meme-Rock

Telegram Mini App idle/clicker game. Players mine stones, upgrade pickaxes (hilti), buy boosters, and compete on leaderboards.

## Project Structure

```
meme-rock/
├── client/          # React 18 + TypeScript + Vite 7
│   └── src/
│       ├── pages/           # 9 pages (Main, Mine, Rock, Task, Market, Leaderboard, Profile, Airdrop)
│       ├── components/      # Feature-based folders (main/, miner/, rock/, task/, etc.)
│       ├── redux/
│       │   ├── slices/      # userSlice, minerSlice, hiltiSlice, boosterSlice, etc.
│       │   └── services/    # RTK Query API services (userApi, minerApi, hiltiApi, etc.)
│       ├── hooks/           # useGlobalRockCounter and other custom hooks
│       ├── types/           # TypeScript interfaces
│       ├── utils/           # Helper functions
│       └── ton/             # TON Connect integration
│
├── server/          # NestJS 11 + MongoDB (Mongoose) + Redis
│   └── src/
│       ├── user/            # User CRUD, balance, exchange
│       ├── miner/           # Miner level progression system
│       ├── hilti/           # Pickaxe upgrade system
│       ├── booster/         # Multiplier/booster marketplace
│       ├── market/          # Stone purchase (TON / Stars)
│       ├── task/            # Quest/task system
│       ├── ad/              # Ad rewards (Adsgram)
│       ├── daily-reward/    # 7-day login streak rewards
│       ├── ranks/           # Leaderboard
│       ├── bot/             # Telegraf bot (webhook, invoices, notifications)
│       ├── purchases/       # TON payment worker
│       ├── achievement/     # Achievement system
│       ├── admin/           # Admin panel
│       ├── schemas/         # Mongoose schemas (user, miner, hilti, booster, task, ton-payments, stats, market)
│       ├── helpers/         # Guards, interceptors
│       └── common/          # Shared utilities
│
└── docker-compose.yml  # API (port 8080) + Worker (port 8081) services
```

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, TypeScript, Redux Toolkit (RTK Query), React Router 7, Tailwind CSS 4, Framer Motion, Vite 7 |
| Backend | NestJS 11, TypeScript, Mongoose 8, Telegraf 4, ioredis |
| Database | MongoDB, Redis (rate limiting) |
| Blockchain | TON (tonweb, @ton/core, TonConnect UI) |
| Ads | Adsgram (@adsgram/react) |
| Telegram | TWA SDK (@twa-dev/sdk), nestjs-telegraf |
| DevOps | Docker Compose |

## Development

```bash
# Client (port 5173)
cd client && npm run dev

# Server (port 8080)
cd server && npm run start:dev

# Docker (API + Worker)
docker-compose up
```

## Environment Variables

- **Client**: `client/.env` — `VITE_API_URL`, `VITE_TON_URL`, `VITE_ADSGRAM_BLOCK_ID`
- **Server**: `server/.env.local` — MongoDB URI, Redis, Telegram token, webhook secret, TON wallet

## Server Modes

- **API Mode** (default): Game server, Telegram webhook, all endpoints
- **Worker Mode** (`APP_MODE=WORKER`): TON payment verification cron jobs only

## API Structure

All endpoints under `/api/` prefix:

| Module | Prefix | Key Endpoints |
|--------|--------|--------------|
| User | `/api/user` | `POST /loading/:id`, `POST /claim-achievement/:id`, `POST /stone-to-dust-exchange/:id` |
| Miner | `/api/miner` | `POST /upgrade/:id`, `POST /claim/:id` |
| Hilti | `/api/hilti` | `POST /upgrade/:id` |
| Booster | `/api/booster` | `GET /get/:id`, `POST /unlock/:id`, `POST /upgrade/:id` |
| Market | `/api/market` | `GET /get-stones-market-data`, `POST /purchase-stones-with-ton/:id` |
| Task | `/api/task` | `GET /get-all/:id`, `POST /complete/:id` |
| DailyReward | `/api/daily-reward` | Daily reward claim |
| Ranks | `/api/ranks` | Weekly/general leaderboard |

## Auth

- Header: `x-telegram-init-data` (Telegram Web App init data)
- Rate limiting: Redis-based throttler guard (2 req/2s general, 1 req/1s strict)

## Currencies

- **Stone**: Primary currency, earned from mining, spent on upgrades
- **Dust**: Secondary currency, exchangeable with stone
- **Rock Coins**: Airdrop leaderboard score (based on profit_per_hour)

## Game Loop

1. Miner produces stones (profit_per_hour) → accumulate Stone/Dust
2. Spend stone to upgrade miner level → higher production
3. Upgrade hilti (pickaxe) → increased profit_per_hour
4. Unlock and upgrade boosters → multiplier bonuses
5. Complete tasks → bonus stone
6. Claim daily login rewards
7. Watch ads → earn dust
8. Purchase stones with TON/Stars from market
9. Compete on leaderboard

## Conventions

- Communicate with me in **Turkish**
- Client components in feature-based folders (`components/main/`, `components/miner/`, etc.)
- Redux slices in `redux/slices/`, API services in `redux/services/`
- Server modules follow NestJS convention: `module/controller/service` structure
- Mongoose schemas centralized in `server/src/schemas/`
- Enums are string-based (e.g., `EMinerLevel = "LEVEL_1"`, `EHiltiLevel = "LEVEL_1"`)
- Tailwind CSS 4 via Vite plugin (not PostCSS)

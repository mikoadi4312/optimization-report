# Plan: Cloudflare D1 Integration

## Objective
Connect the React application to Cloudflare D1 database for persistent data storage of Deposit Tools.

## Phase 1: Database Setup
- [x] Create D1 Database (`optimization-db`)
- [x] Configure `wrangler.toml`
- [x] Create initial migration (`migrations/0001_create_deposit_table.sql`)
- [x] Apply migration (Local)
- [ ] Apply migration (Remote - Production)

## Phase 2: API Development (Pages Functions)
- [x] Create `functions/api` directory
- [x] `functions/api/deposit.ts` (GET, POST with Chunking)
- [x] Setup type definitions for D1

## Phase 3: Frontend Integration
- [x] Create API Service (`services/api.ts`)
- [x] Replace local Excel logic with API calls
- [ ] Test connection (In Progress)

## Phase 4: Deployment
- [ ] Build & Deploy to Cloudflare Pages

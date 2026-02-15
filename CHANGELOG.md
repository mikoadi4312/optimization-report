# Changelog

## [2026-02-11]
### Added
- **Cloudflare D1 Integration**: 
    - Implemented `functions/api/deposit.ts` to handle database operations via Cloudflare Workers.
    - Set up `optimization-db` on Cloudflare D1.
    - Added `npm run clouddb:dev` script for local development with cloud database.

### Fixed
- **Deposit Tools Table Display**: 
    - Resolved issue where table wasn't rendering in Electron by forcing a re-render with `key={orders.length}`.
    - Fixed "White Screen" issue in local cloud dev by correctly pointing Wrangler to `dist` folder.
- **Excel Header Detection**:
    - Restored and enhanced support for Indonesian headers (e.g., 'Jenis voucher', 'Nama pelanggan').

### Changed
- **Database Architecture**: 
    - Migrated from local SQLite (Electron-based) to Cloudflare D1 (Serverless) for Deposit Tools.
    - `App.tsx` now communicates via HTTP API (`/api/deposit`) instead of Electron IPC.

## [2026-02-02]
### Fixed
- **Deposit Tools Report Logic**: 
    - Implemented logic to support 'Voucher Concert' pairing.
    - Refunds referencing a specific Deposit via the 'Voucher concert' column now automatically exclude both the Refund and the original Deposit from the report (they cancel each other out).
    - Updated deduplication logic: if multiple transactions share the same Voucher ID, only the *latest* transaction (smallest checkDay) is kept, without modifying its date. This ensures accurate reporting of the most recent status.

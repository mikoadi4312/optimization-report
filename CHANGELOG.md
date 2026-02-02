# Changelog

## [2026-02-02]
### Fixed
- **Deposit Tools Report Logic**: 
    - Implemented logic to support 'Voucher Concert' pairing.
    - Refunds referencing a specific Deposit via the 'Voucher concert' column now automatically exclude both the Refund and the original Deposit from the report (they cancel each other out).
    - Updated deduplication logic: if multiple transactions share the same Voucher ID, only the *latest* transaction (smallest checkDay) is kept, without modifying its date. This ensures accurate reporting of the most recent status.

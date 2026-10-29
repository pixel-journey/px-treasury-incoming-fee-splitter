# Security notes

## Config attacks

| Issue | Mitigation in this lab |
|-------|------------------------|
| Legs that do not sum to 10000 | `assertConfig` throws |
| Duplicate destinations | refused |
| Zero or oversized bps | refused |
| Too many legs | max 8 |

## Allocation attacks

| Issue | Mitigation in this lab |
|-------|------------------------|
| Value lost to floors | last leg receives remainder; sum checked |
| Negative / oversized amount | refused |

## Still required on-chain (not implemented here)

- Notification hygiene (`get_first_receiver`, ignore self-outbound)
- Only accept intended token contracts
- Admin-only `setconfig` with msig-friendly pause/unpause
- No user-supplied inline action names

See `px-antelope-contract-template` SECURITY.md for the shared checklist.

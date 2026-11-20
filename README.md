# Fee split that must sum to 10000 bps

> **Domain:** treasury fee splitter  
> **Sources:** [SOURCES.md](SOURCES.md)  
> **Catalog:** `px-contract-examples-vault` (private; not this public course)

**Goal:** A fee-split configuration is refused unless the legs sum to **exactly 10000** basis points. Allocation still sums to the input after per-leg floors (remainder on the last leg).

**Code under test:** `npm test` (unit + sequential composition).

**Build record, not this course:** a private compiler tree `pxsplit` produced wasm SHA256 `a76fc2f8a93ff5e92f907ca04016df2a2c11eae049b62a1463236e217c345dc9`. Audit 0 errors / 1 warning. That tree is not public and is **not deployed**. It does not transfer tokens. The course is the TypeScript under `npm test`.

**Network docs:** [docs.wax.io](https://docs.wax.io/). **Token shape:** [eosio.token](https://github.com/eosio/eosio.contracts). **Shared bps helper:** [px-invariant-kit](https://github.com/pixel-journey/px-invariant-kit).

## Learning materials

| Doc | Role |
| --- | --- |
| [EDUCATION.md](EDUCATION.md) | Beginner → masterclass |
| [WORKED-EXAMPLES.md](WORKED-EXAMPLES.md) | Exact splits, dust-to-last-leg, sequential desk |
| [TIPS.md](TIPS.md) | Config design, 128-bit multiply, notify hygiene |
| [SECURITY.md](SECURITY.md) | Config and allocation attacks |
| [SOURCES.md](SOURCES.md) | Official docs + production mirror |

## Composition

`split.composition.test.ts` runs a fee desk: several intakes accumulate per leg, and `sum(leg balances) === total accepted`. Wrong symbol and zero amount leave balances unchanged. Dust (`1n`) still lands on the last leg so conservation holds.

## What is true (executed)

Config symbol `WAX`, legs 7000 / 2000 / 1000.

| Rule | Result |
| --- | --- |
| Sum ≠ 10000 / duplicate `to` / 0 bps leg | refused |
| `allocate(10000n)` | 7000, 2000, 1000 |
| Any allocate | outputs sum to input; last leg gets remainder after floors |
| Wrong symbol / zero amount on accept | refused; desk unchanged |
| Sequential intakes | balances sum to total in |

## Layered path

```
assertConfig + allocate + acceptTransfer   [tested TS]
setconfig + preview                        [C++ mirror; no token move]
    → on_notify / token precision          [not shipped]
```

## Related

- [px-treasury-linear-cliff-vesting](https://github.com/pixel-journey/px-treasury-linear-cliff-vesting)
- [px-token-dust-truncation-visualizer](https://github.com/pixel-journey/px-token-dust-truncation-visualizer)

```bash
npm test
```

MIT — Pixel Journey

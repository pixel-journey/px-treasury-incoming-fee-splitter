# Split only when the basis points add to 10000

> **Trust:** private educational lab (Tier B)  
> **Quest:** 086 — incoming fee splitter  
> **Vault:** [px-contract-examples-vault](https://github.com/pixel-journey/px-contract-examples-vault)

**One-sentence goal:** Teach a fee-split config that is refused unless the legs sum to **exactly 10000** basis points, and an allocation that still sums to the input after floors.

**Real code:** `npm test`. **Not** a treasury contract, **not** an `on_notify` handler, **not** wasm.

## What you can learn

- Why 9000 basis points is not "close enough." The missing 1000 is value the config never assigned.
- Why a zero-basis-point leg is refused instead of stored as a no-op destination.
- Why duplicate destinations are refused even when the two slices would sum to 10000.
- Why the last leg is `amount - already allocated`, not another independent floor.

## What is actually in the repo

| Piece | Role |
| --- | --- |
| `invariants/split.ts` | `assertConfig`, `allocate`, `acceptTransfer` |
| `invariants/split.test.ts` | Executed claims |
| `EDUCATION.md` | Sum-to-10000 and the last-leg rule |
| `SECURITY.md` | Notify and admin gaps |

## What is true (executed)

Config symbol `WAX`, legs `treasury.a` 7000, `treasury.b` 2000, `treasury.c` 1000.

| Rule | Result |
| --- | --- |
| That config | accepted, 3 legs |
| 5000 + 4000 | `bps must sum to 10000` |
| Two legs both to `treasury.a` | `duplicate destination` |
| A leg at 0 bps next to a 10000 leg | refused |
| `allocate(10000n, …)` | 7000, 2000, 1000 |
| `allocate(100n, …)` | outputs sum to `100`; last leg is `100` minus the first two slices |
| Negative amount | refused |
| `acceptTransfer("WAX", 10000n, …)` | first leg `7000` |
| Symbol `PXJ` | `symbol not whitelisted` |
| Amount `0n` on `acceptTransfer` | `amount must be positive` |

`allocate(100n)` with these legs is an exact floor split (70, 20, 10). The test checks the sum. It does not use an input where the floors leave a leftover unit.

## The rule, in order

```text
config:  1..8 legs, each bps an integer 1..10000, unique `to`, sum === 10000
symbol:  1..7 uppercase letters
slice:   floor(amount * bps / 10000) for every leg except the last
last:    amount - sum of the earlier slices
```

`acceptTransfer` requires the incoming symbol to equal `config.symbol` and the amount to be positive, then calls `allocate`. `allocate(0n)` itself returns a zero for every leg. The accept gate is the one that refuses zero.

Amounts must be a non-negative `bigint` at or below `MAX_AMOUNT` (`2^62 - 1`).

```ts
import { allocate, acceptTransfer } from "./invariants/split.ts";

const fair = {
  symbol: "WAX",
  legs: [
    { to: "treasury.a", bps: 7000 },
    { to: "treasury.b", bps: 2000 },
    { to: "treasury.c", bps: 1000 },
  ],
};

allocate(10_000n, fair);
// 7000n, 2000n, 1000n

acceptTransfer("PXJ", 10_000n, fair); // throws "symbol not whitelisted"
```

For a 1-unit amount the first two floors are 0, so the source gives the whole unit to `treasury.c`. The tests do not assert that row. They do assert that whatever the first two slices are, the last slice makes the sum exact.

## Edge cases

- Each leg must be at least 1 bps, so a config cannot list a destination that is configured to receive nothing.
- The last leg can receive more than `floor(amount * itsBps / 10000)` when earlier floors drop units. That is the conservation rule, not a bonus the tests quantify on the 100n case.
- Symbol match is a string compare. There is no precision and no token-contract check.
- Nothing here sends the slices. The return value is the allocation list.

## Best practice and the opposite

**Do** refuse a config whose basis points are not exactly 10000.  
**Do** give leftover floor units to one named leg and check the sum.

**Do not** call `allocate` an incoming transfer. `acceptTransfer` is only a symbol and amount gate.  
**Do not** document the 100n case as dust. With 7000/2000/1000 those floors are exact.

## Live path, not shipped

```
assertConfig + allocate + acceptTransfer   [tested]
    → on_notify / first-receiver hygiene     [not in this repo]
    → token contract + precision              [not in this repo]
    → admin setconfig                         [not in this repo]
```

See [EDUCATION.md](EDUCATION.md) and [SECURITY.md](SECURITY.md).

## Related

- `px-token-dust-truncation-visualizer` — when a floor is zero
- `px-token-transfer-tax-burn-treasury` — a tax split, not a full 10000 fan-out
- Vault index: `px-contract-examples-vault`

## Run

```bash
npm test
```

MIT — Pixel Journey

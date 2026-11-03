# Education — incoming fee split

> **Rung:** `npm test` passes. No treasury is deployed, no `on_notify` runs, no wasm exists.  
> **The test is the rule.** The masterclass section is the work this lab deliberately leaves out.

## What you should be able to do

| Level | After this file |
| --- | --- |
| Beginner | Explain why basis points must sum to 10000, and read a 70/20/10 split |
| Intermediate | Separate `assertConfig`, `allocate`, and `acceptTransfer`, including the zero-amount difference |
| Masterclass | Specify notification hygiene, symbol precision, and why the last leg is a governance choice |

---

## Beginner — one scene

Ten thousand units of `WAX` arrive. The config says:

| Destination | Basis points | Units out of 10000 |
| --- | --- | --- |
| `treasury.a` | 7000 | 7000 |
| `treasury.b` | 2000 | 2000 |
| `treasury.c` | 1000 | 1000 |

10000 basis points means 100%. If the legs summed to 9000, one tenth of every deposit would have no destination. The lab refuses that config (`bps must sum to 10000`) instead of silently keeping or burning the gap.

A leg at 0 basis points is also refused, even if another leg is 10000. A destination listed twice is refused, even if the two slices add to 10000. You cannot hide a share by splitting one name across two rows.

### Words

| Word | In this lab |
| --- | --- |
| Basis point | 1/10000. 7000 bps is 70% |
| Leg | One `{ to, bps }` row |
| Floor | Integer division that drops the fraction |
| Last leg | Receives `amount - everything already allocated`, so the outputs sum to the input |
| Symbol | A 1–7 letter uppercase string. The tests use `WAX`. This is not an `eosio::asset` |

### Predict, then run

```bash
npm test
```

1. `allocate(10000n, fair)` is 7000 / 2000 / 1000. What is `allocate(100n, fair)`? (70 / 20 / 10. Those floors are exact. This input is **not** a dust example.)
2. `acceptTransfer("PXJ", 10000n, fair)` throws what? (`symbol not whitelisted`)
3. `acceptTransfer("WAX", 0n, fair)` throws what? (`amount must be positive`)

---

## Intermediate — walk the file

Source: `invariants/split.ts`. Tests: `invariants/split.test.ts`.

### `assertConfig`

- Symbol matches `^[A-Z]{1,7}$`.
- One to eight legs.
- Each `bps` is an integer from 1 to 10000. Zero is out.
- Each `to` is a well-formed account name, and names are unique.
- The sum of `bps` is exactly 10000. 5000 + 4000 fails. 10000 + 0 never reaches the sum check, because 0 already failed the per-leg check.

### `allocate`

For every leg except the last: `floor(amount * bps / 10000)`. The last leg is `amount - allocated`. Then the function checks the rows sum to `amount` and throws `internal: allocation sum mismatch` if they do not.

`allocate(0n, …)` returns a zero row per leg. It does not throw.

Negative amounts throw `amount must not be negative`. Amounts above `MAX_AMOUNT` (`2^62 - 1`) throw.

### `acceptTransfer`

This is the gate a deposit would call. It re-checks the config, refuses a symbol that is not `config.symbol`, refuses `amount <= 0`, then calls `allocate`.

So zero is legal for `allocate` and illegal for `acceptTransfer`. If you teach only one of them, you will mis-state the other.

### The leftover unit (source, not a pinned test)

`allocate(1n, fair)` floors the first two legs to 0, so the last leg receives `1`. The tests never assert that row. They assert that on `100n` the last leg equals `100` minus the first two slices, which happens to be the exact 10. Do not cite the 100n test as proof of dust.

### Attack → test

| Attack | Naive code | This lab | Test |
| --- | --- | --- | --- |
| Legs sum to 9000 | 10% disappears or is kept by the contract | `bps must sum to 10000` | `refuses sum not equal to 10000` |
| Same account twice | One party bypasses a "max share" reading | `duplicate destination` | `refuses duplicate destinations` |
| 0 bps placeholder | A dead row that later gets edited into a surprise | per-leg `bps` error | `refuses zero bps leg` |
| Wrong token | You split PXJ with a WAX config | `symbol not whitelisted` | `refuses non-whitelisted symbol` |
| Zero deposit | You record an empty split | `amount must be positive` on accept | `refuses zero amount` |

---

## Masterclass — the notify you have not written

A real splitter sits on a token notification. This file never sees one.

### What `acceptTransfer` is not

It does not know which contract sent the tokens. A symbol string `"WAX"` can be minted by any token contract. Production must:

1. Handle `on_notify` of `transfer` from the **intended** token account only.
2. `get_first_receiver()` is that token account. If it is not, return.
3. If `from == get_self()`, return. That is your own outgoing transfer, not new income.
4. Check `quantity.symbol` **and** precision, not a 1–7 letter stand-in.
5. Refuse a memo-driven destination. Legs come from config, not from the sender.

The vault standard says inline action names are constants. A user-supplied account may be a `to` in config, but the action you call is `transfer` on the token contract, not a name the depositor chose.

### Last leg is a policy

Whoever is last receives every unit the earlier floors dropped. That favors the last row. Swapping `treasury.c` to the front changes who gets dust. Document the order in the config transaction. Do not pretend the split is "fair to the unit" for every leg.

On chain, `amount * bps` must be computed in `__int128` (or equivalent) before dividing by 10000. This lab uses `bigint`, which does not overflow at `MAX_AMOUNT`. A `uint64` multiply can.

### Admin

Nothing here changes config under an authority. A production `setconfig` needs `require_auth` of an admin, and a pause path that `eosio.msig` can still clear. See `px-token-pausable-emergency-guard` for that pause shape. It is not imported here.

### Exercise

Without running new code, compute `allocate` for amount `3` and legs 5000 / 5000 (two legs; sum is 10000).

- First slice: `floor(3 * 5000 / 10000) = floor(1.5) = 1`
- Last slice: `3 - 1 = 2`

The second leg's own floor would also have been 1. It receives 2 because it is last. The tests do not include this pair. If you add it, you are extending the lab, not quoting it.

---

## What this course will not teach

- That `allocate(100n)` demonstrates remainder dust (the floors are exact)
- An `on_notify` integration test
- A deployed treasury

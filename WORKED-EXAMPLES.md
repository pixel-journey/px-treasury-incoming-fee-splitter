# Worked examples — fee split

Companion to [EDUCATION.md](EDUCATION.md). Config used throughout unless noted:

```text
symbol: WAX
legs: treasury.a 7000 | treasury.b 2000 | treasury.c 1000
```

## Example 1 — exact 10000 input

`allocate(10000n)` → `[7000, 2000, 1000]`. Sum 10000.

## Example 2 — exact 100 input

`allocate(100n)` → `[70, 20, 10]`. Floors are exact; **not** a dust example.

## Example 3 — dust to the last leg

`allocate(1n)` → `[0, 0, 1]`.

- `floor(1 * 7000 / 10000) = 0`
- `floor(1 * 2000 / 10000) = 0`
- last leg = `1 - 0 - 0 = 1`

Policy: **last leg absorbs remainder.** Reordering legs changes who gets dust.

## Example 4 — two-leg uneven remainder (*exercise from EDUCATION*)

Amount `3`, legs 5000 / 5000:

- first: `floor(3 * 5000 / 10000) = 1`
- last: `3 - 1 = 2` (not 1)

## Example 5 — sequential desk (composition)

Accept `10000`, then `100`, then `1` on symbol `WAX`:

| Leg | After all intakes |
| --- | --- |
| a | 7000 + 70 + 0 |
| b | 2000 + 20 + 0 |
| c | 1000 + 10 + 1 |
| **sum** | **10101** |

Conservation: sum of legs equals total accepted. Wrong symbol / zero amount leave balances unchanged (`split.composition.test.ts`).

## Example 6 — refused configs

| Config | Error |
| --- | --- |
| 5000 + 4000 | sum ≠ 10000 |
| 10000 + 0 | zero bps leg |
| same `to` twice | duplicate destination |
| 9 legs | too many |
| symbol `wax` | must match `^[A-Z]{1,7}$` |

## Example 7 — production notify sketch (not implemented)

```text
on_notify(transfer):
  if first_receiver != intended_token: return
  if from == self: return          // ignore outbound
  if quantity.symbol != config: refuse
  if quantity.amount <= 0: refuse
  rows = allocate(amount, config)
  for each row: transfer token to row.to
```

The C++ mirror in [pxsplit](https://github.com/pixel-journey/wax-contract-compiler/tree/main/contracts/pxsplit) validates config and previews allocation only — it does not move tokens.

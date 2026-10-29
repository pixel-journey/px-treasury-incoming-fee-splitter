# Education

## The pattern

Treasury splitters often take an incoming transfer and fan it out by basis points. Two properties matter immediately:

1. **Configuration integrity** — `sum(bps) === 10000` or the contract invents or destroys value in intent.
2. **Conservation under floors** — `floor` per leg can leave remainder; that remainder must be assigned (here: last leg) so `sum(outputs) === amount`.

## What the tests teach

- Reject configs that look “almost right” (9000 total, duplicate destinations, zero bps legs).
- Show a clean 70/20/10 split on a round amount.
- Show a non-round amount where floor would lose units without the last-leg rule.

## What a production `on_notify` still must add

- `get_first_receiver()` / outgoing-transfer hygiene (see template notify rules)
- Exact symbol **and** precision on `eosio::asset`
- Authorization for config changes (admin / msig)
- Optional pause + recovery path

This lab isolates the **split arithmetic and config gate** so those checks stay teachable.

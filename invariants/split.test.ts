import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { assertConfig, allocate, acceptTransfer } from "./split.ts";

const fair: Parameters<typeof assertConfig>[0] = {
  symbol: "WAX",
  legs: [
    { to: "treasury.a", bps: 7000 },
    { to: "treasury.b", bps: 2000 },
    { to: "treasury.c", bps: 1000 },
  ],
};

describe("assertConfig", () => {
  it("accepts legs that sum to 10000", () => {
    assert.equal(assertConfig(fair).legs.length, 3);
  });

  it("refuses sum not equal to 10000", () => {
    assert.throws(
      () =>
        assertConfig({
          symbol: "WAX",
          legs: [
            { to: "treasury.a", bps: 5000 },
            { to: "treasury.b", bps: 4000 },
          ],
        }),
      /sum to 10000/
    );
  });

  it("refuses duplicate destinations", () => {
    assert.throws(
      () =>
        assertConfig({
          symbol: "WAX",
          legs: [
            { to: "treasury.a", bps: 5000 },
            { to: "treasury.a", bps: 5000 },
          ],
        }),
      /duplicate/
    );
  });

  it("refuses zero bps leg", () => {
    assert.throws(
      () =>
        assertConfig({
          symbol: "WAX",
          legs: [
            { to: "treasury.a", bps: 0 },
            { to: "treasury.b", bps: 10000 },
          ],
        }),
      /bps/
    );
  });
});

describe("allocate", () => {
  it("splits 10000 as 7000 / 2000 / 1000", () => {
    const rows = allocate(10_000n, fair);
    assert.deepEqual(rows, [
      { to: "treasury.a", amount: 7_000n },
      { to: "treasury.b", amount: 2_000n },
      { to: "treasury.c", amount: 1_000n },
    ]);
  });

  it("remainder from floors goes to last leg so sum is exact", () => {
    // 100 * 7000/10000 = 70, 100 * 2000/10000 = 20, last gets 10
    const rows = allocate(100n, fair);
    assert.equal(
      rows.reduce((a, r) => a + r.amount, 0n),
      100n
    );
    assert.equal(rows[2].amount, 100n - rows[0].amount - rows[1].amount);
  });

  it("refuses negative amount", () => {
    assert.throws(() => allocate(-1n, fair), /negative/);
  });
});

describe("acceptTransfer", () => {
  it("accepts matching symbol", () => {
    const rows = acceptTransfer("WAX", 10_000n, fair);
    assert.equal(rows[0].amount, 7_000n);
  });

  it("refuses non-whitelisted symbol", () => {
    assert.throws(() => acceptTransfer("PXJ", 10_000n, fair), /whitelist/);
  });

  it("refuses zero amount", () => {
    assert.throws(() => acceptTransfer("WAX", 0n, fair), /positive/);
  });
});

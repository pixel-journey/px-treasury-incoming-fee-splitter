import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  assertConfig,
  allocate,
  acceptTransfer,
  MAX_AMOUNT,
  MAX_LEGS,
} from "./split.ts";

const fair = {
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
      /sum to 10000/,
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
      /duplicate/,
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
      /bps/,
    );
  });

  it("refuses more than MAX_LEGS", () => {
    const nine = Array.from({ length: 9 }, (_, i) => ({
      to: `t${i}`,
      bps: i === 0 ? 10000 - 8 : 1,
    }));
    assert.throws(() => assertConfig({ symbol: "WAX", legs: nine }), /legs must be 1 to 8/);
  });

  it("refuses a bad symbol format", () => {
    assert.throws(
      () => assertConfig({ symbol: "wax", legs: [{ to: "treasury.a", bps: 10000 }] }),
      /bad symbol/,
    );
  });

  it("accepts a single leg of 10000", () => {
    const one = assertConfig({
      symbol: "WAX",
      legs: [{ to: "treasury.a", bps: 10000 }],
    });
    assert.equal(one.legs.length, 1);
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
    const rows = allocate(100n, fair);
    assert.equal(
      rows.reduce((a, r) => a + r.amount, 0n),
      100n,
    );
    assert.equal(rows[2].amount, 100n - rows[0].amount - rows[1].amount);
  });

  it("one unit gives the whole amount to the last leg", () => {
    // floor(1 * 7000/10000) = 0, floor(1 * 2000/10000) = 0, last = 1
    const rows = allocate(1n, fair);
    assert.deepEqual(rows, [
      { to: "treasury.a", amount: 0n },
      { to: "treasury.b", amount: 0n },
      { to: "treasury.c", amount: 1n },
    ]);
    assert.equal(rows.reduce((a, r) => a + r.amount, 0n), 1n);
  });

  it("allocate zero returns zero for every leg", () => {
    const rows = allocate(0n, fair);
    assert.deepEqual(rows, [
      { to: "treasury.a", amount: 0n },
      { to: "treasury.b", amount: 0n },
      { to: "treasury.c", amount: 0n },
    ]);
  });

  it("refuses negative amount", () => {
    assert.throws(() => allocate(-1n, fair), /negative/);
  });

  it("refuses amount above MAX_AMOUNT", () => {
    assert.throws(() => allocate(MAX_AMOUNT + 1n, fair), /MAX_AMOUNT/);
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

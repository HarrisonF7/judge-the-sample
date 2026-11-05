import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseVisits, seededRandom, simpleRandomSample, systematicSample, weekdayAllocation, stratifiedSample, createDisplay, meanWait } from './sampling.js';

const rows = parseVisits(readFileSync(new URL('../data/clinic_visits.csv', import.meta.url), 'utf8'));
const ids = sample => sample.map(row => row.visit_id);
function checkSample(sample, n, population = rows) {
  assert.equal(sample.length, n);
  assert.equal(new Set(sample).size, n);
  const members = new Set(population);
  assert.ok(sample.every(row => members.has(row)));
}

test('SRS bounds, reproducibility, and original population order', () => {
  const before = ids(rows);
  for (const n of [1, 10, 100, 101, 9999, 10000]) {
    checkSample(simpleRandomSample(rows, n, 20261105), n);
    assert.deepEqual(ids(simpleRandomSample(rows, n, 42)), ids(simpleRandomSample(rows, n, 42)));
  }
  assert.deepEqual(ids(rows), before);
  for (const n of [0, -1, 1.5, 10001]) assert.throws(() => simpleRandomSample(rows, n, 1));
});

test('systematic supports every n from 1 through N with distinct in-range rows', () => {
  for (let n = 1; n <= rows.length; n++) checkSample(systematicSample(rows, n, n).sample, n);
});

test('systematic whole and fractional rules agree with independent formulas', () => {
  for (const n of [1, 10, 100, 101, 333, 9999, 10000]) {
    for (const seed of [0, 42, 20261105, 4294967295]) {
      const result = systematicSample(rows, n, seed);
      const k = rows.length / n;
      const random = seededRandom(seed)();
      const whole = rows.length % n === 0;
      const start = whole ? 1 + Math.floor(random * k) : (1 - random) * k;
      assert.equal(result.whole, whole);
      assert.equal(result.start, start);
      assert.ok(start > 0 && start <= k);
      assert.deepEqual(ids(result.sample), Array.from({ length: n }, (_, j) => Math.min(rows.length, whole ? start + j*k : Math.ceil(start + j*k))));
    }
  }
});

test('weekday largest remainder has exact totals and stable Mon–Fri ties', () => {
  for (const n of [5, 6, 7, 10, 100, 101, 9999, 10000]) {
    const allocation = weekdayAllocation(rows, n);
    assert.equal(allocation.reduce((sum, g) => sum + g.count, 0), n);
    assert.ok(allocation.every(g => g.count >= 1 && g.count <= g.rows.length));
    checkSample(stratifiedSample(rows, n, 42).sample, n);
  }
  assert.deepEqual(weekdayAllocation(rows, 7).map(g => g.count), [2, 2, 1, 1, 1]);
  assert.throws(() => stratifiedSample(rows, 4, 42));
  // Unequal synthetic strata exercise the minimum-one constraint and capacity limits.
  const synthetic = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].flatMap((weekday, i) => Array.from({length: [1, 2, 3, 4, 90][i]}, (_, j) => ({weekday, visit_id: `${i}-${j}`, wait_time: i * 10})));
  for (let n = 5; n <= synthetic.length; n++) {
    const allocation = weekdayAllocation(synthetic, n);
    assert.equal(allocation.reduce((s,g) => s+g.count,0),n);
    assert.ok(allocation.every(g => g.count >= 1 && g.count <= g.rows.length));
  }
  const result = stratifiedSample(synthetic, 6, 42);
  const expected = [1,2,3,4,90].reduce((sum, size, i) => sum + size / 100 * i * 10, 0);
  assert.equal(result.estimate, expected);
  assert.notEqual(result.estimate, meanWait(result.sample));
});

test('all display results share the current sample and preserve population statistics', () => {
  const baseline = createDisplay(rows, 100, 20261105);
  for (const method of ['srs', 'systematic', 'stratified']) {
    for (const n of [5, 10, 100, 101, 10000]) {
      for (const seed of [0,42,20261105]) {
        const d = createDisplay(rows, n, seed, method);
        checkSample(d.sample, n);
        assert.deepEqual(d, createDisplay(rows, n, seed, method));
        assert.equal(d.populationMean, baseline.populationMean);
        assert.deepEqual(d.populationBins, baseline.populationBins);
        assert.equal(d.sampleBins.reduce((s,b) => s+b.count, 0), n);
        assert.deepEqual(d.sampleBins.map(b => b.start), d.populationBins.map(b => b.start));
        assert.equal(d.sampleMean, method === 'stratified' ? d.allocation.reduce((s,g) => s + g.weight * meanWait(g.sample), 0) : meanWait(d.sample));
      }
    }
  }
  const blocked = createDisplay(rows, 4, 42, 'stratified');
  assert.equal(blocked.blocked, true);
  assert.equal(blocked.sampleMean, null);
  assert.equal(blocked.sample.length, 0);
  assert.ok(blocked.sampleBins.every(b => b.count === 0 && b.percent === 0));
});


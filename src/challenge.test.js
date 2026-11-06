import test from 'node:test';
import assert from 'node:assert/strict';
import { shuffledPopulation, runOrderingChallenge, meanWait, repeatedSampling } from './sampling.js';

const rows = Object.freeze(Array.from({ length: 10000 }, (_, i) => Object.freeze({ visit_id: i + 1, weekday: ['Mon','Tue','Wed','Thu','Fri'][i % 5], wait_time: (i * 17) % 83 })));
const ids = values => values.map(r => r.visit_id);

test('shuffle is a reproducible permutation without changing appointments or original order', () => {
  const before = JSON.stringify(rows);
  for (const seed of [0,42,4294967295]) {
    const shuffled = shuffledPopulation(rows, seed);
    assert.deepEqual(ids(shuffled), ids(shuffledPopulation(rows, seed)));
    assert.equal(shuffled.length, 10000);
    assert.equal(new Set(shuffled).size, 10000);
    assert.deepEqual([...ids(shuffled)].sort((a,b) => a-b), ids(rows));
    assert.ok(shuffled.every(row => rows[row.visit_id - 1] === row));
    assert.equal(meanWait(shuffled), meanWait(rows));
  }
  assert.equal(JSON.stringify(rows), before);
});

test('both systematic conditions enumerate every start and select 100 distinct appointments', () => {
  const result = runOrderingChallenge(rows,42,20261105);
  for (const [index, population] of [rows, shuffledPopulation(rows,42)].entries()) {
    const exact = result.results[index];
    assert.equal(exact.type,'Exact');
    assert.equal(exact.seed,null);
    assert.equal(exact.n,100);
    assert.equal(exact.count,100);
    assert.equal(exact.trueMean,meanWait(rows));
    const covered = new Set();
    for (let start = 1; start <= 100; start++) {
      const sample = Array.from({length:100}, (_,j) => population[start-1+j*100]);
      assert.equal(new Set(sample).size,100);
      sample.forEach(row => covered.add(row));
      assert.equal(exact.estimates[start-1],meanWait(sample));
    }
    assert.equal(covered.size,10000);
  }
});

test('challenge separates shuffle and simulation seeds, labels conditions, and uses 1000 SRS draws', () => {
  const a = runOrderingChallenge(rows,42,7);
  assert.deepEqual(a,runOrderingChallenge(rows,42,7));
  const simulationChange = runOrderingChallenge(rows,42,8);
  assert.deepEqual(a.results.slice(0,2),simulationChange.results.slice(0,2));
  const shuffleChange = runOrderingChallenge(rows,99,7);
  assert.deepEqual(a.results[0],shuffleChange.results[0]);
  assert.deepEqual(a.results[2],shuffleChange.results[2]);
  assert.match(a.results[0].population,/Baseline/);
  assert.match(a.results[1].population,/Shuffled.*42/);
  const srs = a.results[2];
  assert.equal(srs.type,'Monte Carlo');
  assert.equal(srs.count,1000);
  assert.equal(srs.n,100);
  assert.equal(srs.seed,7);
  assert.deepEqual(srs.estimates,repeatedSampling(rows,'srs',100,7,1000).estimates);
  assert.throws(() => runOrderingChallenge(rows.slice(0,100),42,7));
  assert.throws(() => runOrderingChallenge(rows,-1,7));
});

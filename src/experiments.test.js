import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeEstimates, repeatedSampling, runExperiments, estimateDistributions, meanWait, seededRandom, simpleRandomSample, stratifiedSample } from './sampling.js';

const rows = Array.from({length: 200}, (_,i) => ({visit_id:i+1, weekday:['Mon','Tue','Wed','Thu','Fri'][i%5],wait_time:(i*7)%31}));
const close = (a,b) => assert.ok(Math.abs(a-b)<1e-10);

test('metrics use population-divisor SD and satisfy RMSE identity',()=>{
  const s=summarizeEstimates([1,3,5],2);
  close(s.bias,1);close(s.sd,Math.sqrt(8/3));close(s.rmse,Math.sqrt(11/3));
  close(s.rmse**2,s.bias**2+s.sd**2);
  assert.throws(()=>summarizeEstimates([],2));
});

test('exact enumeration visits every start once and ignores seed and repetition settings',()=>{
  const a=repeatedSampling(rows,'systematic',10,0,100);
  const b=repeatedSampling(rows,'systematic',10,123,1000);
  assert.deepEqual(a,b);assert.equal(a.type,'Exact');assert.equal(a.seed,null);assert.equal(a.count,20);
  const expected=Array.from({length:20},(_,i)=>meanWait(Array.from({length:10},(_,j)=>rows[i+j*20])));
  assert.deepEqual(a.estimates,expected);
  close(a.bias,0);
});

test('Monte Carlo repetitions match independently drawn seeded samples and weighted estimators',()=>{
  for(const method of ['srs','stratified']) {
    const r=repeatedSampling(rows,method,11,42,100);
    const rng=seededRandom(42);
    const expected=Array.from({length:100},()=>{
      const seed=Math.floor(rng()*4294967296);
      return method==='srs'?meanWait(simpleRandomSample(rows,11,seed)):stratifiedSample(rows,11,seed).estimate;
    });
    assert.deepEqual(r.estimates,expected);
    assert.deepEqual(r,repeatedSampling(rows,method,11,42,100));
    assert.equal(r.type,'Monte Carlo');assert.equal(r.seed,42);assert.equal(r.count,100);
    close(r.rmse**2,r.bias**2+r.sd**2);
  }
  assert.throws(()=>repeatedSampling(rows,'srs',10,42,99));
  assert.equal(repeatedSampling(rows,'systematic',11,42,100).type,'Monte Carlo');
});

test('dashboard reuses SRS100 object, replaces runs, and separates exact counts',()=>{
  const a=runExperiments(rows,42,100), b=runExperiments(rows,42,1000);
  assert.strictEqual(a.methods[0],a.sizes[2]);
  assert.deepEqual(a.methods[1],b.methods[1]);
  assert.equal(a.methods[1].count,2);
  for(const r of [...b.methods,...b.sizes]) if(r.type==='Monte Carlo') assert.equal(r.count,1000);
  assert.deepEqual(a,runExperiments(rows,42,100));
  assert.deepEqual(a.methods[0].estimates,b.methods[0].estimates.slice(0,100));
  for(const comparison of [a.methods,a.sizes]) {
    const d=estimateDistributions(comparison);
    assert.ok(d.lower<comparison[0].trueMean && d.upper>comparison[0].trueMean);
    d.charts.forEach((bins,i)=>{
      assert.equal(bins.reduce((s,b)=>s+b.count,0),comparison[i].count);
      close(bins.reduce((s,b)=>s+b.percent,0),100);
      assert.deepEqual(bins.map(b=>b.start),d.charts[0].map(b=>b.start));
    });
  }
});

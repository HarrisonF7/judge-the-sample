import React, { useState } from 'react';
import { runExperiments, estimateDistributions } from './sampling.js';
const names = { srs: 'Simple random', systematic: 'Systematic', stratified: 'Weekday-stratified' };
const fmt = x => x.toFixed(4);

export function Comparison({ title, results, challenge = false, distribution, chartOffset = 0 }) {
  const d = distribution ?? estimateDistributions(results);
  const x = value => 44 + (value - d.lower) / (d.upper - d.lower) * 300;
  return <section className="experiment-comparison"><h3>{title}</h3>
    <p>{challenge ? 'Same 10,000 appointments in both conditions' : 'Baseline population'} · true population mean: <strong>{fmt(results[0].trueMean)} minutes</strong>. Common bins and axis scales within this experiment.</p>
    <div className="experiment-charts">{results.map((r, index) => <article className="panel" key={`${r.population}-${r.method}-${r.n}`}>
      <h4>{names[r.method]} · n = {r.n}</h4>
      {challenge && <p><strong>{r.population}</strong> · true mean {fmt(r.trueMean)} minutes</p>}
      {r.reusedFrom && <p><strong>Reused from {r.reusedFrom}.</strong> {r.reuseExplanation}</p>}
      <p><strong>{r.type === 'Exact' ? 'Exact enumeration' : r.type}</strong> · {r.count} {r.type === 'Exact' ? 'equally likely starts · no sampling seed' : `repetitions · seed ${r.seed}`}</p>
      {r.method === 'stratified' && <p>Weekday allocation: {r.allocation.map(g => `${g.day} ${g.count}/${g.population} (weight ${g.weight})`).join('; ')}. Proportional largest remainder; SRS within weekdays; population-weighted estimate.</p>}
      {r.method === 'systematic' && <p>{r.orderDescription ?? 'Chronological file order'} · interval k = 100 · all starts 1–100, each used once.</p>}
      {r.method === 'srs' && r.n === 100 && <p>{r.challengeAlternative ? r.reusedFrom ? 'SRS without replacement; baseline samples reused for the shuffled condition.' : 'SRS without replacement from the same population, using baseline array order. Population membership and values match both systematic conditions.' : 'Same SRS n = 100 result reused in both experiments.'}</p>}
      <svg viewBox="0 0 370 270" role="img" aria-label={`${names[r.method]}, n ${r.n}: distribution of estimates in minutes. Vertical axis is percentage; dashed line is true population mean.`}>
        {[0,1,2,3,4].map(i => <g key={i}><line className="grid" x1="44" x2="344" y1={200-i*40} y2={200-i*40}/><text x="38" y={204-i*40} textAnchor="end">{d.yMax*i/4}%</text></g>)}
        {d.charts[index + chartOffset].map((b,i) => <rect key={i} className="population-bar" x={x(b.start)+1} y={200-b.percent/d.yMax*160} width="13" height={b.percent/d.yMax*160}><title>{fmt(b.start)}–&lt;{fmt(b.end)} minutes: {b.count} estimates ({b.percent.toFixed(1)}%)</title></rect>)}
        <line className="true-mean-line" x1={x(r.trueMean)} x2={x(r.trueMean)} y1="35" y2="200"/>
        <text x="194" y="20" textAnchor="middle">Dashed line: true population mean</text>
        {[0,1,2].map(i => {const v=d.lower+(d.upper-d.lower)*i/2;return <text key={i} x={x(v)} y="222" textAnchor="middle">{v.toFixed(2)}</text>;})}
        <text x="194" y="250" textAnchor="middle">Estimated mean (minutes)</text>
      </svg>
      <details><summary>View distribution bin counts</summary><table><thead><tr><th>Minutes [lower, upper)</th><th>Estimates</th><th>%</th></tr></thead><tbody>{d.charts[index + chartOffset].map((b,i)=><tr key={i}><td>{fmt(b.start)}–{fmt(b.end)}</td><td>{b.count}</td><td>{b.percent.toFixed(1)}</td></tr>)}</tbody></table></details>
      {r.type==='Exact' && <details><summary>View all 100 starts and estimates</summary><table><thead><tr><th>Start</th><th>Estimate (minutes)</th></tr></thead><tbody>{r.estimates.map((v,i)=><tr key={i}><td>{i+1}</td><td>{fmt(v)}</td></tr>)}</tbody></table></details>}
    </article>)}</div>
    <div className="table-scroll"><table><caption>{title} · current results · all metrics in minutes</caption><thead><tr>{['Population / condition','Method','n','Type','Sampling seed','Repetitions / starts','Bias','SD','RMSE'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{results.map(r=><tr key={`${r.population}-${r.method}-${r.n}`}><td>{r.population}{r.reusedFrom && <><br /><strong>Reused baseline draws</strong></>}</td><td>{names[r.method]}</td><td>{r.n}</td><td>{r.type === 'Exact' ? 'Exact enumeration' : r.type}</td><td>{r.seed??'Not used'}</td><td>{r.count} {r.type==='Exact'?'starts':'repetitions'}</td><td>{fmt(r.bias)}</td><td>{fmt(r.sd)}</td><td>{fmt(r.rmse)}</td></tr>)}</tbody></table></div>
  </section>;
}

export default function Experiments({ population }) {
  const [seed,setSeed]=useState('20261105');
  const [repetitions,setRepetitions]=useState(100);
  const [results,setResults]=useState(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const valid=/^\d+$/.test(seed)&&Number(seed)<=4294967295;
  const pending=results&&(!valid||Number(seed)!==results.seed||repetitions!==results.repetitions);
  async function run() {
    setBusy(true);setError('');
    await new Promise(resolve=>setTimeout(resolve,0));
    try {setResults(runExperiments(population,Number(seed),repetitions));}
    catch(e) {setError(e.message);}
    finally {setBusy(false);}
  }
  return <section className="experiment-dashboard" aria-label="Repeated-sampling experiments">
    <h2>Stage 4 · Repeated-sampling dashboard</h2>
    <p>Separate from the single-sample workspace above. Both experiments use the unchanged baseline population of 10,000 appointments.</p>
    <div className="experiment-controls">
      <div className="seed-control"><label htmlFor="experiment-seed">Experiment seed</label><input id="experiment-seed" value={seed} inputMode="numeric" disabled={busy} onChange={e=>setSeed(e.target.value)} aria-invalid={!valid} aria-describedby="experiment-seed-help"/><p id="experiment-seed-help">Whole number 0–4,294,967,295. Used for Monte Carlo only.</p></div>
      <div className="seed-control"><label htmlFor="repetitions">Monte Carlo repetitions</label><select id="repetitions" value={repetitions} disabled={busy} onChange={e=>setRepetitions(Number(e.target.value))}><option value="100">100</option><option value="1000">1,000</option></select></div>
      <button type="button" disabled={!valid||busy} onClick={run}>{busy?'Running…':'Run experiments'}</button>
    </div>
    <p>Sample size n is appointments in one sample; repetitions are separate samples. Each sample is drawn without replacement; an appointment may appear again in another repetition. Systematic n = 100 always uses all 100 starts exactly, with no random draws or seed.</p>
    <p>100 repetitions usually reveal the main pattern; 1,000 give smoother distributions and more stable bias, SD, and RMSE estimates. Neither guarantees stability, and 100 repetitions cannot reliably separate small method differences. Rerun with different seeds to check whether your conclusions hold. A small nonzero Monte Carlo bias can reflect simulation variability.</p>
    <p><strong>Bias</strong> = mean estimate − true mean. <strong>SD</strong> = spread across estimates, dividing variance by the number of repetitions or starts. <strong>RMSE</strong> = square root of mean squared error relative to the true mean: typical estimation error combining bias and variability; RMSE² = bias² + SD².</p>
    <p role="status">{busy?'Calculating new results…':pending?'Settings changed. Displayed results retain their labelled settings; run experiments to replace them.':results?`Current results: experiment seed ${results.seed}; ${results.repetitions} Monte Carlo repetitions; 100 exact systematic starts.`:'Choose settings and run experiments to display results.'}</p>
    {error&&<p role="alert">{error}</p>}
    {results&&<><Comparison title="Experiment A · Methods at n = 100" results={results.methods}/><Comparison title="Experiment B · SRS at n = 1, 10, and 100" results={results.sizes}/></>}
  </section>;
}

import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import csv from '../data/clinic_visits.csv?raw';
import { parseVisits, createDisplay } from './sampling.js';
import './style.css';

const SEED = 20261105;
const N = 100;
const population = parseVisits(csv);
const number = value => value.toLocaleString('en-US');

function Histogram({ title, bins, yMax, sample = false }) {
  const left = 48, top = 16, width = 540, height = 220;
  const step = width / bins.length;
  return <section className="panel">
    <h2>{title}</h2>
    <p>{sample ? '100 selected appointments' : 'All 10,000 appointments'} · percentage of appointments in this panel</p>
    <svg viewBox="0 0 610 300" role="img" aria-label={`${title}. Waiting time in minutes on the horizontal axis; percentage of appointments on the vertical axis.`}>
      {[0, 1, 2, 3, 4].map(i => {
        const value = yMax * i / 4;
        const y = top + height - height * i / 4;
        return <g key={i}><line x1={left} x2={left + width} y1={y} y2={y} className="grid" /><text x={left - 8} y={y + 4} textAnchor="end">{value}%</text></g>;
      })}
      {bins.map((bin, i) => <rect key={bin.start} x={left + i * step + 1} y={top + height - bin.percent / yMax * height} width={Math.max(1, step - 2)} height={bin.percent / yMax * height} className={sample ? 'sample-bar' : 'population-bar'}><title>{bin.start} to under {bin.end} minutes: {bin.count} appointments ({bin.percent.toFixed(2)}%)</title></rect>)}
      {bins.map((bin, i) => <text key={bin.start} x={left + i * step} y={top + height + 20} textAnchor="middle">{bin.start}</text>)}
      <text x={left + width} y={top + height + 20} textAnchor="middle">{bins.at(-1).end}</text>
      <text x={left + width / 2} y={287} textAnchor="middle">Waiting time (minutes)</text>
    </svg>
    <details><summary>View bin counts as a table</summary><table><thead><tr><th>Minutes (lower inclusive, upper exclusive)</th><th>Appointments</th><th>Percentage</th></tr></thead><tbody>{bins.map(bin => <tr key={bin.start}><td>{bin.start}–&lt;{bin.end}</td><td>{number(bin.count)}</td><td>{bin.percent.toFixed(2)}%</td></tr>)}</tbody></table></details>
  </section>;
}

function App() {
  const [seedInput, setSeedInput] = useState(String(SEED));
  const [seed, setSeed] = useState(SEED);
  const validSeed = /^\d+$/.test(seedInput) && Number(seedInput) <= 4294967295;
  const display = useMemo(() => createDisplay(population, N, seed), [seed]);
  const selected = useMemo(() => new Set(display.sample.map(row => row.visit_id)), [display]);

  function changeSeed(event) {
    const value = event.target.value;
    setSeedInput(value);
    if (/^\d+$/.test(value) && Number(value) <= 4294967295) setSeed(Number(value));
  }

  return <main>
    <header><p className="eyebrow">Judge the Sample · Stage 2</p><h1>Clinic waiting times</h1><p>Explore the waiting-time distribution and where the selected appointments fall in the chronological record.</p></header>
    <section className="context" aria-label="Population and sample settings">
      <strong>Baseline population: {number(population.length)} simulated appointments</strong>
      <p>The finite population is every appointment in this file, across 100 weeks. It does not represent every clinic or appointment.</p>
      <p><strong>Temporary simple random sample · n = 100 · without replacement</strong><br />Current sample seed: <code>{seed}</code> · One sample, not repeated-sampling results.</p>
      <div className="seed-control">
        <label htmlFor="sample-seed">Temporary sample seed</label>
        <input id="sample-seed" type="text" inputMode="numeric" value={seedInput} onChange={changeSeed} aria-describedby="seed-help" aria-invalid={!validSeed} />
        <p id="seed-help" role={validSeed ? undefined : 'status'}>{validSeed ? 'Enter a whole number from 0 to 4,294,967,295. Valid changes update the sample immediately.' : 'Enter a whole number from 0 to 4,294,967,295. The last valid sample remains displayed.'}</p>
      </div>
      <p>Each set of 100 distinct appointments is equally likely under simple random sampling. The same seed and settings reproduce the same selection.</p>
    </section>
    <section className="means" aria-label="Mean waiting times">
      <div><h2>Sample mean</h2><p className="value">{display.sampleMean.toFixed(4)} <span>minutes</span></p><p>Single-sample estimate · 100 appointments</p></div>
      <div><h2>True population mean</h2><p className="value">{display.populationMean.toFixed(4)} <span>minutes</span></p><p>Calculated from all 10,000 appointments</p></div>
    </section>
    <p>Both histograms use identical five-minute bins and the same percentage scale. A bin labelled 10–&lt;15 contains waiting times from 10 up to, but not including, 15 minutes.</p>
    <div className="charts"><Histogram title="Population waiting times" bins={display.populationBins} yMax={display.yMax} /><Histogram title="Sample waiting times" bins={display.sampleBins} yMax={display.yMax} sample /></div>
    <section className="panel strip-panel"><h2>Chronological selection strip</h2><p>File order is chronological: week, Monday–Friday, then appointment slot 1–20. Each of the 100 rows below is one week; each contains 100 appointments.</p>
      <p className="legend"><span className="swatch population" /> All appointments <span className="swatch sample" /> Selected appointments (100 distinct rows)</p>
      <div className="strip-layout"><div className="week-labels"><span>Week 1</span><span>Week 25</span><span>Week 50</span><span>Week 75</span><span>Week 100</span></div><div className="strip-content"><div className="days">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => <span key={day}>{day}</span>)}</div>
      <svg viewBox="0 0 1000 600" role="img" aria-label="All 10,000 appointments arranged chronologically in 100 weekly rows, with 100 sampled appointments highlighted in orange with dark outlines.">
        {population.map((row, i) => <rect key={row.visit_id} x={(i % 100) * 10 + 0.5} y={Math.floor(i / 100) * 6 + 0.5} width="9" height="5" className={selected.has(row.visit_id) ? 'selected-cell' : 'population-cell'}><title>Appointment {row.visit_id} · week {row.week} · {row.weekday} · slot {row.slot} · {selected.has(row.visit_id) ? 'selected' : 'not selected'}</title></rect>)}
      </svg><p className="axis-note">Read left to right within each week, then continue on the next row. Appointment 1 → appointment 10,000.</p></div></div>
      <details><summary>View the 100 selected appointment IDs</summary><p className="ids">{display.sample.map(row => row.visit_id).sort((a, b) => a - b).join(', ')}</p></details>
    </section>
    <footer>Source: simulated clinic_visits.csv · Waiting times are measured in minutes. Original data remain unchanged.</footer>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);

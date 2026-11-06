import React, { useState } from 'react';
import { runOrderingChallenge } from './sampling.js';
import { Comparison } from './Experiments.jsx';

const validSeed = value => /^\d+$/.test(value) && Number(value) <= 4294967295;

export default function Challenge({ population }) {
  const [shuffleSeed, setShuffleSeed] = useState('42');
  const [simulationSeed, setSimulationSeed] = useState('20261105');
  const [current, setCurrent] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const valid = validSeed(shuffleSeed) && validSeed(simulationSeed);
  const pending = current && (!valid || Number(shuffleSeed) !== current.shuffleSeed || Number(simulationSeed) !== current.simulationSeed);

  async function run() {
    setBusy(true); setError('');
    await new Promise(resolve => setTimeout(resolve, 0));
    try { setCurrent(runOrderingChallenge(population, Number(shuffleSeed), Number(simulationSeed))); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  return <section className="experiment-dashboard" aria-label="Stage 5 appointment-order challenge">
    <h2>Stage 5 · Appointment-order challenge</h2>
    <p>Compare baseline chronological order with a fixed, reproducibly shuffled order. Shuffling changes only appointment order: all 10,000 appointments, their values, and the true population mean remain unchanged. The shuffled condition is modified in order only; the original CSV remains unchanged.</p>
    <p>Fixed sample size: <strong>n = 100</strong>. Systematic interval: <strong>k = 100</strong>. For each ordering, enumerate all 100 possible starts exactly. The shuffle seed fixes one ordering; exact results are conditional on that ordering, not averaged across different shuffles. No sampling seed or Monte Carlo repetitions are used for systematic results.</p>
    <p>Alternative: simple random sampling without replacement, n = 100, with <strong>1,000 seeded Monte Carlo repetitions</strong> from the identical population membership and values. Weekday-stratified sampling also uses 1,000 Monte Carlo repetitions with the same simulation seed. The simulation seed controls these repetitions separately from the shuffle seed. Weekday allocation is 20 appointments per weekday, with population weights 0.2 each and a population-weighted estimate.</p>
    <div className="experiment-controls">
      <div className="seed-control"><label htmlFor="shuffle-seed">Shuffle seed</label><input id="shuffle-seed" inputMode="numeric" value={shuffleSeed} disabled={busy} onChange={e => setShuffleSeed(e.target.value)} aria-invalid={!validSeed(shuffleSeed)} aria-describedby="challenge-seed-help" /></div>
      <div className="seed-control"><label htmlFor="challenge-simulation-seed">Monte Carlo simulation seed</label><input id="challenge-simulation-seed" inputMode="numeric" value={simulationSeed} disabled={busy} onChange={e => setSimulationSeed(e.target.value)} aria-invalid={!validSeed(simulationSeed)} aria-describedby="challenge-seed-help" /></div>
      <button type="button" disabled={!valid || busy} onClick={run}>{busy ? 'Running…' : 'Run challenge'}</button>
    </div>
    <p id="challenge-seed-help">Enter whole-number seeds from 0 to 4,294,967,295. Apply changed settings with Run challenge. The same seeds reproduce the same ordering and results.</p>
    <p role="status">{busy ? 'Calculating challenge results…' : pending ? 'Settings changed. Results below retain their displayed seeds until you run the challenge again.' : current ? `Current run · shuffle seed ${current.shuffleSeed} · Monte Carlo simulation seed ${current.simulationSeed} · n = 100 · 100 exact starts per systematic condition · 1,000 repetitions per Monte Carlo method (reused across orderings).` : 'Run the challenge to display results. Stages 1–4 remain independent.'}</p>
    {error && <p role="alert">{error}</p>}
    <p>SRS and weekday-stratified sampling do not depend on appointment order. Their shuffled panels reuse the baseline appointment draws and estimates, with separate condition labels. These are paired results, not independent simulations. All six charts share the same bins and percentage scale.</p>
    {current && <><Comparison title="Ordering conditions and SRS alternative · n = 100" results={current.results} distribution={current.distributions} challenge /><Comparison title="Additional method–condition comparisons · n = 100" results={current.additionalResults} distribution={current.distributions} chartOffset={3} challenge /></>}
  </section>;
}

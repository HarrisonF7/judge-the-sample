// Shared sampling, estimation, and display calculations for Stages 2–3.
export function parseVisits(csv) {
  const [header, ...lines] = csv.trim().split(/\r?\n/);
  const columns = header.split(',');
  return lines.map(line => {
    const row = Object.fromEntries(line.split(',').map((value, i) => [columns[i], value]));
    for (const key of ['visit_id', 'week', 'slot', 'wait_time']) row[key] = Number(row[key]);
    if (!Number.isFinite(row.wait_time) || row.wait_time < 0) throw new Error('Invalid waiting time in CSV.');
    return row;
  });
}

export function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function simpleRandomSample(rows, n, seed) {
  return sampleWithRandom(rows, n, seededRandom(seed));
}

function sampleWithRandom(rows, n, random) {
  if (!Number.isInteger(n) || n < 1 || n > rows.length) throw new Error('Sample size must be between 1 and N.');
  const shuffled = [...rows];
  // Partial Fisher–Yates shuffle: select distinct rows without replacement.
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(random() * (shuffled.length - i));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

export function systematicSample(rows, n, seed) {
  if (!Number.isInteger(n) || n < 1 || n > rows.length) throw new Error('Sample size must be between 1 and N.');
  const interval = rows.length / n;
  const whole = rows.length % n === 0;
  const random = seededRandom(seed);
  const start = whole ? 1 + Math.floor(random() * interval) : (1 - random()) * interval;
  const indices = Array.from({ length: n }, (_, j) => Math.min(rows.length, whole ? start + j * interval : Math.ceil(start + j * interval)) - 1);
  return { sample: indices.map(i => rows[i]), interval, start, whole };
}

export function weekdayAllocation(rows, n) {
  if (!Number.isInteger(n) || n < 1 || n > rows.length) throw new Error('Sample size must be between 1 and N.');
  const groups = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => ({ day, rows: rows.filter(row => row.weekday === day) })).filter(group => group.rows.length);
  if (n < groups.length) throw new Error('Stratified sampling requires at least one appointment per weekday (n ≥ 5).');
  const allocation = groups.map(group => {
    const quota = n * group.rows.length / rows.length;
    return { ...group, quota, weight: group.rows.length / rows.length, count: Math.max(1, Math.floor(quota)) };
  });
  let total = allocation.reduce((sum, group) => sum + group.count, 0);
  // Constrained largest remainder; stable ties follow Mon–Fri order.
  while (total !== n) {
    const adding = total < n;
    const candidates = allocation.filter(g => adding ? g.count < g.rows.length : g.count > 1);
    candidates.sort((a, b) => adding ? (b.quota - b.count) - (a.quota - a.count) : (b.count - b.quota) - (a.count - a.quota));
    candidates[0].count += adding ? 1 : -1;
    total += adding ? 1 : -1;
  }
  return allocation;
}

export function stratifiedSample(rows, n, seed) {
  const random = seededRandom(seed);
  const allocation = weekdayAllocation(rows, n).map(group => ({ ...group, sample: sampleWithRandom(group.rows, group.count, random) }));
  const estimate = allocation.reduce((sum, group) => sum + group.weight * meanWait(group.sample), 0);
  return { sample: allocation.flatMap(group => group.sample), allocation, estimate };
}

export function meanWait(rows) {
  if (!rows.length) throw new Error('Cannot calculate a mean for an empty set.');
  return rows.reduce((sum, row) => sum + row.wait_time, 0) / rows.length;
}

export function histogram(rows, binCount, width = 5) {
  const bins = Array.from({ length: binCount }, (_, i) => ({ start: i * width, end: (i + 1) * width, count: 0 }));
  for (const row of rows) {
    const index = Math.floor(row.wait_time / width);
    if (!bins[index]) throw new Error('Waiting time outside histogram range.');
    bins[index].count++;
  }
  return bins.map(bin => ({ ...bin, percent: rows.length ? bin.count / rows.length * 100 : 0 }));
}

export function createDisplay(rows, n, seed, method = 'srs') {
  const blocked = method === 'stratified' && n < 5;
  let details = {};
  let sample = [];
  if (!blocked) {
    if (method === 'srs') sample = simpleRandomSample(rows, n, seed);
    else if (method === 'systematic') { details = systematicSample(rows, n, seed); sample = details.sample; }
    else if (method === 'stratified') { details = stratifiedSample(rows, n, seed); sample = details.sample; }
    else throw new Error('Unknown sampling method.');
  }
  const binCount = Math.floor(Math.max(...rows.map(row => row.wait_time)) / 5) + 1;
  const populationBins = histogram(rows, binCount);
  const sampleBins = histogram(sample, binCount);
  const maxPercent = Math.max(...populationBins.map(b => b.percent), ...sampleBins.map(b => b.percent));
  return { ...details, blocked, sample, populationBins, sampleBins, populationMean: meanWait(rows), sampleMean: blocked ? null : method === 'stratified' ? details.estimate : meanWait(sample), yMax: Math.max(5, Math.ceil(maxPercent / 5) * 5) };
}

export function summarizeEstimates(estimates, trueMean) {
  if (!estimates.length) throw new Error('Estimates are required.');
  const average = estimates.reduce((s, x) => s + x, 0) / estimates.length;
  const bias = average - trueMean;
  const sd = Math.sqrt(estimates.reduce((s, x) => s + (x - average) ** 2, 0) / estimates.length);
  const rmse = Math.sqrt(estimates.reduce((s, x) => s + (x - trueMean) ** 2, 0) / estimates.length);
  return { bias, sd, rmse };
}

export function repeatedSampling(rows, method, n, seed, repetitions = 100) {
  if (!Number.isInteger(n) || n < 1 || n > rows.length) throw new Error('Invalid sample size.');
  const trueMean = meanWait(rows);
  const exact = method === 'systematic' && rows.length % n === 0;
  const estimates = [];
  let allocation;
  if (exact) {
    const interval = rows.length / n;
    for (let start = 1; start <= interval; start++) {
      estimates.push(meanWait(Array.from({ length: n }, (_, j) => rows[start - 1 + j * interval])));
    }
  } else {
    if (![100, 1000].includes(repetitions)) throw new Error('Choose 100 or 1,000 repetitions.');
    const random = seededRandom(seed);
    for (let i = 0; i < repetitions; i++) {
      const repetitionSeed = Math.floor(random() * 4294967296);
      if (method === 'srs') estimates.push(meanWait(simpleRandomSample(rows, n, repetitionSeed)));
      else if (method === 'stratified') {
        const result = stratifiedSample(rows, n, repetitionSeed);
        estimates.push(result.estimate);
        allocation = result.allocation.map(g => ({ day: g.day, population: g.rows.length, count: g.count, weight: g.weight }));
      } else if (method === 'systematic') estimates.push(meanWait(systematicSample(rows, n, repetitionSeed).sample));
      else throw new Error('Unknown sampling method.');
    }
  }
  return { population: 'Baseline', method, n, type: exact ? 'Exact' : 'Monte Carlo', seed: exact ? null : seed, count: estimates.length, estimates, trueMean, allocation, ...summarizeEstimates(estimates, trueMean) };
}

export function runExperiments(rows, seed, repetitions) {
  const srs100 = repeatedSampling(rows, 'srs', 100, seed, repetitions);
  return {
    seed, repetitions,
    methods: [srs100, repeatedSampling(rows, 'systematic', 100, seed, repetitions), repeatedSampling(rows, 'stratified', 100, seed, repetitions)],
    sizes: [repeatedSampling(rows, 'srs', 1, seed, repetitions), repeatedSampling(rows, 'srs', 10, seed, repetitions), srs100],
  };
}

export function shuffledPopulation(rows, seed) {
  return simpleRandomSample(rows, rows.length, seed);
}

export function runOrderingChallenge(rows, shuffleSeed = 42, simulationSeed = 20261105) {
  if (rows.length !== 10000) throw new Error('This challenge requires the original 10,000 appointments.');
  for (const seed of [shuffleSeed, simulationSeed]) {
    if (!Number.isInteger(seed) || seed < 0 || seed > 4294967295) throw new Error('Seeds must be whole numbers from 0 to 4,294,967,295.');
  }
  const shuffled = shuffledPopulation(rows, shuffleSeed);
  const baseline = { ...repeatedSampling(rows, 'systematic', 100, null), population: 'Baseline · chronological', orderDescription: 'Original chronological order' };
  const modified = { ...repeatedSampling(shuffled, 'systematic', 100, null), population: `Shuffled · order modified · shuffle seed ${shuffleSeed}`, orderDescription: `Fixed shuffled order (shuffle seed ${shuffleSeed})` };
  const alternative = { ...repeatedSampling(rows, 'srs', 100, simulationSeed, 1000), population: 'Baseline membership · SRS alternative', challengeAlternative: true };
  return { shuffleSeed, simulationSeed, results: [baseline, modified, alternative] };
}

// One common bin range and percentage scale per comparison, including the true mean.
export function estimateDistributions(results) {
  const values = results.flatMap(r => [...r.estimates, r.trueMean]);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const padding = Math.max((maximum - minimum) * 0.05, 0.1);
  const lower = minimum - padding, upper = maximum + padding;
  const width = (upper - lower) / 20;
  const charts = results.map(result => {
    const bins = Array.from({ length: 20 }, (_, i) => ({ start: lower + i * width, end: lower + (i + 1) * width, count: 0 }));
    for (const value of result.estimates) bins[Math.min(19, Math.max(0, Math.floor((value - lower) / width)))].count++;
    return bins.map(bin => ({ ...bin, percent: bin.count / result.count * 100 }));
  });
  return { lower, upper, charts, yMax: Math.max(5, Math.ceil(Math.max(...charts.flat().map(b => b.percent)) / 5) * 5) };
}

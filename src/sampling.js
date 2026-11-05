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

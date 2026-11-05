// Shared calculations for the Stage 2 display. Later-stage methods are not implemented yet.
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
  if (!Number.isInteger(n) || n < 1 || n > rows.length) throw new Error('Sample size must be between 1 and N.');
  const shuffled = [...rows];
  const random = seededRandom(seed);
  // Partial Fisher–Yates shuffle: select distinct rows without replacement.
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(random() * (shuffled.length - i));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
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
  return bins.map(bin => ({ ...bin, percent: bin.count / rows.length * 100 }));
}

export function createDisplay(rows, n, seed) {
  const sample = simpleRandomSample(rows, n, seed);
  const binCount = Math.floor(Math.max(...rows.map(row => row.wait_time)) / 5) + 1;
  const populationBins = histogram(rows, binCount);
  const sampleBins = histogram(sample, binCount);
  const maxPercent = Math.max(...populationBins.map(b => b.percent), ...sampleBins.map(b => b.percent));
  return { sample, populationBins, sampleBins, populationMean: meanWait(rows), sampleMean: meanWait(sample), yMax: Math.max(5, Math.ceil(maxPercent / 5) * 5) };
}

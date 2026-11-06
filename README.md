[https://harrisonf7.github.io/judge-the-sample/](https://harrisonf7.github.io/judge-the-sample/)

# Judge the Sample: My Sampling App

**Central question:** Which sampling method would you trust for this population, at what sample size, and with what limits?

## Scenario and Dataset

**Scenario:** Clinic waiting times (simulated data)

**Data file:** `data/clinic_visits.csv`

**Population:** All 10,000 appointments recorded in the supplied dataset, covering 100 weeks of clinic appointments. This finite population does not represent every clinic, patient, or time period.

**Target:** `wait_time`, measured in minutes.

**Row order:** Chronological, organized by week, weekday, and appointment slot.

**True population mean:** 22.6842 minutes.

The dataset was simulated for this activity. Its source, provenance, and additional information are documented in `data/README.md`.

## Sampling Methods

The application compares three sampling methods:

- **Simple random sampling (SRS):** Selects distinct appointments without replacement. The estimate is the sample mean.
- **Systematic sampling:** Selects appointments at regular intervals from the dataset's row order, using a random start. The estimate is the sample mean.
- **Weekday-stratified sampling:** Divides appointments into Monday–Friday groups and samples within each weekday using proportional allocation. The estimate is the population-weighted mean of the weekday sample means.

The application displays the selected observations, sampling settings, estimated mean, and true population mean.

## Experiments

**Experiment A — Sampling methods:** Compares SRS, systematic sampling, and weekday-stratified sampling at n = 100.

**Experiment B — Sample size:** Compares SRS at n = 1, 10, and 100.

**Stage 5 — Appointment-order challenge:** Compares the original chronological appointment order with a reproducibly shuffled order, evaluating systematic sampling, simple random sampling (SRS), and weekday-stratified sampling under both conditions (six comparisons).

The experiments display distributions of estimates, bias, standard deviation (SD), and root mean squared error (RMSE).

## Seeds and Settings Used for Evidence

| Experiment | Sample size | Seed | Repetitions or starts |
|---|---|---|---|
| Method comparison: SRS | 100 | 42 | 1,000 Monte Carlo repetitions |
| Method comparison: Systematic | 100 | Exact (no sampling seed) | 100 possible starts |
| Method comparison: Weekday-stratified | 100 | 42 | 1,000 Monte Carlo repetitions |
| Sample-size comparison: SRS | 1, 10, 100 | 42 | 1,000 Monte Carlo repetitions per size |
| Stage 5: Systematic, baseline and shuffled | 100 | Shuffle seed 42 | 100 exact starts per condition |
| Stage 5: SRS, baseline and shuffled | 100 | Simulation seed 20261105; shuffle seed 42 identifies modified order | 1,000 Monte Carlo repetitions, baseline draws reused for shuffled condition |
| Stage 5: Weekday-stratified, baseline and shuffled | 100 | Simulation seed 20261105; shuffle seed 42 identifies modified order | 1,000 Monte Carlo repetitions, baseline draws reused for shuffled condition; 20 per weekday, weights 0.2 each |

## Results and Findings

### Experiment A — Comparing Sampling Methods

At a sample size of 100 appointments, the three methods produced the following results:

| Sampling method | Bias (minutes) | SD (minutes) | RMSE (minutes) |
|---|---:|---:|---:|
| Simple random | -0.0355 | 1.4398 | 1.4402 |
| Systematic | 0.0000 | 6.9567 | 6.9567 |
| Weekday-stratified | -0.0314 | 1.3952 | 1.3955 |

Weekday-stratified sampling had the lowest observed RMSE in this Monte Carlo run, closely followed by simple random sampling. The small difference may vary with the seed and does not establish a stable ranking. Systematic sampling had a much higher SD and RMSE for the chronological ordering, consistent with the ordering sensitivity investigated in Stage 5.

All three methods had bias close to zero, but systematic sampling produced much less consistent estimates.

### Experiment B — Comparing Sample Sizes

Simple random sampling was evaluated at sample sizes of 1, 10, and 100 appointments, using 1,000 Monte Carlo repetitions for each size.

| Sample size | Bias (minutes) | SD (minutes) | RMSE (minutes) |
|---|---:|---:|---:|
| 1 | 0.2218 | 13.9674 | 13.9691 |
| 10 | 0.0315 | 4.5941 | 4.5942 |
| 100 | -0.0355 | 1.4398 | 1.4402 |

As sample size increased, both SD and RMSE decreased substantially. Samples of 100 appointments produced much more consistent estimates of the true population mean than samples of 1 or 10 appointments.

For SRS without replacement from this fixed population, larger samples reduce the sampling variance of the mean. The results at the three tested sizes illustrate that reduction; they do not guarantee that every individual larger sample is closer to the true mean.

### Stage 5 — Appointment-Order Challenge

This challenge investigated whether the ordering of appointments affects the reliability of systematic sampling. The original chronological dataset was compared with a reproducibly shuffled version using shuffle seed 42.

All comparisons used a sample size of 100 appointments.

| Sampling method | Bias (minutes) | SD (minutes) | RMSE (minutes) |
|---|---:|---:|---:|
| Systematic — Original order | 0.0000 | 6.9567 | 6.9567 |
| Systematic — Shuffled order | 0.0000 | 1.4752 | 1.4752 |
| SRS — Baseline alternative | 0.0863 | 1.4572 | 1.4597 |
| Weekday-stratified — Baseline | -0.0409 | 1.4291 | 1.4297 |
| Weekday-stratified — Shuffled (reused) | -0.0409 | 1.4291 | 1.4297 |
| SRS — Shuffled (reused) | 0.0863 | 1.4572 | 1.4597 |

For the tested ordering with shuffle seed 42, shuffling substantially reduced the variability of systematic sampling. Its RMSE decreased from 6.9567 to 1.4752 minutes, making its performance much closer to simple random sampling.

The shuffled SRS and weekday-stratified panels reuse the baseline appointment samples, estimates, and metrics because reordering changes neither membership nor these sampling designs. Weekday groups and weights remain unchanged. These are paired Monte Carlo results, not independent runs or exact distributions. Independently running the array-based sampler on shuffled rows with the same seed could select different appointment IDs. Systematic distributions are calculated separately for each order.

This demonstrates that systematic sampling can be sensitive to patterns in the population's row order. Although systematic sampling was unbiased when considering all possible random starts, its estimates were much less reliable with the original chronological ordering.


## Final Conclusion and Limitations

For this simulated clinic population, I would trust weekday-stratified sampling with a sample size of 100 appointments. It produced the lowest observed RMSE (1.3955 minutes) in Experiment A, although simple random sampling performed almost as well (RMSE = 1.4402 minutes). This small Monte Carlo difference should be checked with different seeds before treating it as a stable advantage.

I would also consider simple random sampling a reliable alternative because it does not depend on the ordering of appointments. I would be more cautious about using systematic sampling on the original chronological dataset because its RMSE was substantially higher (6.9567 minutes).

Experiment B demonstrated that larger sample sizes produced more consistent estimates. Based on the sample sizes tested, I would choose 100 appointments rather than 1 or 10.

These findings have several limitations. The dataset is simulated and represents a fixed population of 10,000 appointments, so the results cannot automatically be generalized to real clinics. The experiments evaluated only selected sample sizes and sampling methods. Additionally, the results depend on the population structure, and systematic sampling was particularly sensitive to appointment ordering.

Overall, the experiments demonstrate that both sampling method and sample size matter. A method that performs well for one population may not perform equally well for another, especially when the data contain patterns that interact with the sampling procedure.

## Evidence Screenshots

The `evidence/` folder contains screenshots documenting the experiment results and settings.

- `evidence/stage4_methods.png` — Experiment A: Comparison of simple random, systematic, and weekday-stratified sampling at n = 100.
- `evidence/stage4_sample_sizes.png` — Experiment B: Comparison of simple random sampling at n = 1, 10, and 100.
- `evidence/stage5_comparison.png` — Stage 5: Clean metrics capture for the original three panels; replaces the earlier preview-obscured screenshot.
- `evidence/stage4_methods_distributions.png` — Experiment A distributions, true-mean reference lines, calculation labels, seeds, and weekday allocation.
- `evidence/stage4_sample_size_distributions.png` — Experiment B distributions and true-mean reference lines at n = 1, 10, and 100.
- `evidence/stage5_original_distributions.png` — Baseline systematic, shuffled systematic, and baseline SRS distributions with current run settings.
- `evidence/stage5_additional_distributions.png` — Baseline and shuffled weekday-stratified and shuffled SRS distributions, including allocation, weights, seeds, and reuse explanations.
- `evidence/stage5_additional_metrics.png` — Added Stage 5 metrics and reused-result labels.

Together, the screenshots show the distributions, true-mean reference lines, settings, seeds, repetitions or exact starts, allocations, reused-result labels, and numerical results. New captures were saved directly from the running application without pixel editing. No individual capture is intended to contain the whole dashboard.

## How to Run the App

The application is built with React and Vite. Use Node.js 20.19+ within version 20, or Node.js 22.12+ (including newer major versions), with npm, and a Bash terminal. The launcher runs npm install if node_modules is missing; all app calculations run in the browser without a backend.

1. Open a terminal in the project folder.
2. Run `bash run_app.sh`.
3. Open the local URL displayed in the terminal (typically `http://localhost:5173/`).
4. Use the app to explore the population, compare sampling methods, run repeated sampling experiments, and investigate the appointment-order challenge.

5. Stop the local server with **Ctrl+C** in the terminal. If port 5173 is already occupied, stop the existing app terminal before restarting.

The single-sample workspace and Stage 4 default to seed 20261105; Stage 4 defaults to 100 Monte Carlo repetitions. Set seed 42 and 1,000 repetitions to reproduce the Stage 4 evidence. Stage 5 defaults to shuffle seed 42 and simulation seed 20261105 with 1,000 repetitions per Monte Carlo method. Apply experiment settings with Run experiments or Run challenge.

## Test and Build

From the project folder, after dependencies are installed:

```bash
node --test src/*.test.js
npm run build
```

The build creates dist/. Dependencies are pinned in package.json and package-lock.json. Local running is sufficient unless the course requires a public deployment; screenshots alone are not a live app.

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

**Stage 5 — Appointment-order challenge:** Compares the original chronological appointment order with a reproducibly shuffled order, evaluating systematic sampling and simple random sampling (SRS) under both conditions.

The experiments display distributions of estimates, bias, standard deviation (SD), and root mean squared error (RMSE).

## Seeds and Settings Used for Evidence

| Experiment | Sample size | Seed | Repetitions or starts |
|---|---|---|---|
| Method comparison: SRS | 100 | 42 | 1,000 Monte Carlo repetitions |
| Method comparison: Systematic | 100 | Exact (no sampling seed) | 100 possible starts |
| Method comparison: Weekday-stratified | 100 | 42 | 1,000 Monte Carlo repetitions |
| Sample-size comparison: SRS | 1, 10, 100 | 42 | 1,000 Monte Carlo repetitions per size |
| Stage 5: Systematic, baseline and shuffled | 100 | Shuffle seed 42 | 100 exact starts per condition |
| Stage 5: SRS, baseline and shuffled | 100 | Simulation seed 20261105 | 1,000 Monte Carlo repetitions, reused across conditions |

## Results and Findings

### Experiment A — Comparing Sampling Methods

At a sample size of 100 appointments, the three methods produced the following results:

| Sampling method | Bias (minutes) | SD (minutes) | RMSE (minutes) |
|---|---:|---:|---:|
| Simple random | -0.0355 | 1.4398 | 1.4402 |
| Systematic | 0.0000 | 6.9567 | 6.9567 |
| Weekday-stratified | -0.0314 | 1.3952 | 1.3955 |

Weekday-stratified sampling had the lowest RMSE, closely followed by simple random sampling. Systematic sampling had a much higher SD and RMSE because the chronological ordering of appointments created patterns that affected which appointments were selected.

All three methods had bias close to zero, but systematic sampling produced much less consistent estimates.

### Experiment B — Comparing Sample Sizes

Simple random sampling was evaluated at sample sizes of 1, 10, and 100 appointments, using 1,000 Monte Carlo repetitions for each size.

| Sample size | Bias (minutes) | SD (minutes) | RMSE (minutes) |
|---|---:|---:|---:|
| 1 | 0.2218 | 13.9674 | 13.9691 |
| 10 | 0.0315 | 4.5941 | 4.5942 |
| 100 | -0.0355 | 1.4398 | 1.4402 |

As sample size increased, both SD and RMSE decreased substantially. Samples of 100 appointments produced much more consistent estimates of the true population mean than samples of 1 or 10 appointments.

These results demonstrate the law of large numbers: larger random samples tend to produce estimates closer to the population mean, although individual estimates are not guaranteed to be accurate.

### Stage 5 — Appointment-Order Challenge

This challenge investigated whether the ordering of appointments affects the reliability of systematic sampling. The original chronological dataset was compared with a reproducibly shuffled version using shuffle seed 42.

All comparisons used a sample size of 100 appointments.

| Sampling method | Bias (minutes) | SD (minutes) | RMSE (minutes) |
|---|---:|---:|---:|
| Systematic — Original order | 0.0000 | 6.9567 | 6.9567 |
| Systematic — Shuffled order | 0.0000 | 1.4752 | 1.4752 |
| SRS alternative | 0.0863 | 1.4572 | 1.4597 |

Shuffling the appointment order substantially reduced the variability of systematic sampling. Its RMSE decreased from 6.9567 to 1.4752 minutes, making its performance much closer to simple random sampling.

This demonstrates that systematic sampling can be sensitive to patterns in the population's row order. Although systematic sampling was unbiased when considering all possible random starts, its estimates were much less reliable with the original chronological ordering.


## Final Conclusion and Limitations

For this simulated clinic population, I would trust weekday-stratified sampling with a sample size of 100 appointments. It produced the lowest RMSE (1.3955 minutes) in Experiment A, although simple random sampling performed almost as well (RMSE = 1.4402 minutes).

I would also consider simple random sampling a reliable alternative because it does not depend on the ordering of appointments. I would be more cautious about using systematic sampling on the original chronological dataset because its RMSE was substantially higher (6.9567 minutes).

Experiment B demonstrated that larger sample sizes produced more consistent estimates. Based on the sample sizes tested, I would choose 100 appointments rather than 1 or 10.

These findings have several limitations. The dataset is simulated and represents a fixed population of 10,000 appointments, so the results cannot automatically be generalized to real clinics. The experiments evaluated only selected sample sizes and sampling methods. Additionally, the results depend on the population structure, and systematic sampling was particularly sensitive to appointment ordering.

Overall, the experiments demonstrate that both sampling method and sample size matter. A method that performs well for one population may not perform equally well for another, especially when the data contain patterns that interact with the sampling procedure.

## Evidence Screenshots

The `evidence/` folder contains screenshots documenting the experiment results and settings.

- `evidence/stage4_methods.png` — Experiment A: Comparison of simple random, systematic, and weekday-stratified sampling at n = 100.
- `evidence/stage4_sample_sizes.png` — Experiment B: Comparison of simple random sampling at n = 1, 10, and 100.
- `evidence/stage5_comparison.png` — Stage 5: Comparison of systematic sampling under original and shuffled appointment ordering, with an SRS alternative.

The screenshots include the sampling settings, seeds, repetitions or exact starts, and numerical results used to support the findings.

## How to Run the App

The application is built with React and Vite and requires Node.js and npm.

1. Open a terminal in the project folder.
2. Run `bash run_app.sh`.
3. Open the local URL displayed in the terminal (typically `http://localhost:5173/`).
4. Use the app to explore the population, compare sampling methods, run repeated sampling experiments, and investigate the appointment-order challenge.

The experiments use fixed seeds and settings to make their results reproducible.
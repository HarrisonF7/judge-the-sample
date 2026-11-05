# My decisions and evidence notes

Written by me, not by my AI agent. Write my challenge hypothesis (section 5) **before** consulting
my agent about it, and do not edit it afterwards; add a dated revision below instead.

## 1. Population and target


- **Scenario and file:** Clinic waiting times, `data/clinic_visits.csv`
- **One row means:** One patient appointment at the clinic.
- **Number of rows (N):** 10,000
- **Row order, and what it means in this file:** The rows are in chronological order, organized by week, weekday, and appointment slot. Appointments next to each other in the dataset occurred next to each other in the schedule.
- **Target column and units:** `wait_time`, measured in minutes.
- **My finite population is (and what it is not):** My population consists of 10,000 appointments from a simulated clinic over 100 weeks. It does not represent every appointment at every clinic.
- **True mean I calculated (and how):** The true population mean is 22.6842 minutes. I calculated this by adding the waiting times for all 10,000 appointments and dividing by 10,000.

## 2. Design choices

Stage 2, visualization: I chose side-by-side histograms showing the waiting times for the full population and the sample, along with a chronological strip highlighting the selected appointments. I chose this design because it makes it easy to compare the sample with the population and see where the sampled appointments fall within the full dataset. The chronological strip is meant to help users recognize whether the sample is spread across the appointment schedule or concentrated in certain areas, which could reveal a sampling problem.

Stage 3, sampling interactions and stratification column: I chose Option 1, which lets users view one sampling method at a time. Users can switch between simple random, systematic, and stratified sampling while keeping the same histogram and chronological selection strip. I chose this because it keeps the app organized and makes it easier to understand how each sampling method selects appointments. For stratified sampling, I chose weekday as the grouping variable so users can see how appointments are sampled across the five weekdays. Stratified sampling will require a sample size of at least five so every weekday is represented.

## 3. Results table

One row per result I read from my app. Add rows as needed. Rerun and update a row whenever I
like: my app does not need to keep a history of runs. Seed is "exact" for exact enumeration;
type is Monte Carlo or exact. In Settings I record the settings that matter for the result, such
as the stratification column and allocation, or my challenge-control values. Keep results from
different conditions in separate rows.

| Experiment | Population or condition | Method | Settings | Seed (or exact) | n | Repetitions or starts | Type | Bias | SD | RMSE |
|---|---|---|---|---|---|---|---|---|---|---|
| Methods at n = 100 | baseline | Simple random | | | 100 | | | | | |
| Methods at n = 100 | baseline | Systematic | | | 100 | | | | | |
| Methods at n = 100 | baseline | Stratified | | | 100 | | | | | |
| Sample size | baseline | Simple random | | | 1 | | | | | |
| Sample size | baseline | Simple random | | | 10 | | | | | |
| Challenge | | | | | | | | | | |

The simple random n = 100 row is also the n = 100 sample-size result when the population and
settings match. If I reran it with different settings, I add a separate row.

## 4. Findings (in my own words, using my own numbers)

- (a) The three sampling methods compared at n = 100 (bias versus variability, and for which population):
- (b) How sample size affects the spread of estimates and the estimation error, and what a larger sample cannot fix:

## 5. Challenge (hypothesis written independently, before consulting my agent)

Hypothesis, written before I consult my agent:

- Date written:
- Method I chose to challenge:
- The change to the population or its ordering:
- Why the selection rule would interact with that change:
- Evidence I expect across repeated samples:
- Evidence that would contradict my hypothesis:

After I test it:

- Test settings (conditions, methods, alternative method or correction, n, seeds); results are in the table above:
- Did the evidence support my hypothesis? Bias versus variability, other explanations, what the alternative or correction showed, and any dated revision (keep the original above):

## 6. AI use

- Tools used:
- What I asked my agent to do, and what I checked myself:

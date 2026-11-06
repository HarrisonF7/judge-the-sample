# My decisions and evidence notes

These notes document my project decisions, results, and findings, with AI assistance described in Section 6. My Stage 5 hypothesis was recorded before implementation and testing.

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

Stage 4, presentation of the method comparison and sample-size experiments: I chose Option 2, which displays both repeated-sampling experiments together on one dashboard. The first experiment compares simple random, systematic, and stratified sampling at a sample size of 100, while the second compares simple random sampling at sample sizes of 1, 10, and 100. I chose this design because it makes it easier to compare the distributions of sample estimates and understand how sampling methods and sample sizes affect bias, standard deviation, and RMSE. The dashboard will also distinguish exact systematic results from Monte Carlo simulations.

Stage 5, challenge dashboard (implemented design): The dashboard shows SRS, systematic, and weekday-stratified sampling under baseline chronological and modified shuffled order, using the same 10,000 appointments and n = 100. Shuffle seed 42 fixes the modified order. Each systematic condition enumerates all 100 starts at k = 100 exactly, without a sampling seed. SRS and weekday-stratified sampling use simulation seed 20261105 and 1,000 Monte Carlo repetitions. Weekday allocation is 20 per weekday, with population weights 0.2 each and a population-weighted estimate. Because order does not change either random-sampling design, the shuffled SRS and stratified panels reuse the corresponding baseline draws and estimates, explicitly labelled as paired reused results. All six distributions use common bins and scales; settings changes require Run challenge to replace the current results.

## 3. Results table

The following results were obtained from my app using the baseline population of 10,000 simulated clinic appointments, with a true population mean of 22.6842 minutes. Stage 4 Monte Carlo results use seed 42 and 1,000 repetitions. Stage 5 uses shuffle seed 42 and Monte Carlo simulation seed 20261105 for SRS and weekday-stratified sampling. Systematic sampling at n = 100 uses exact enumeration of all 100 possible starts.

| Experiment | Population or condition | Method | Settings | Seed (or exact) | n | Repetitions or starts | Type | Bias | SD | RMSE |
|---|---|---|---|---|---|---|---|---|---|---|
| Methods at n = 100 | Baseline | Simple random | Without replacement | 42 | 100 | 1000 repetitions | Monte Carlo | -0.0355 | 1.4398 | 1.4402 |
| Methods at n = 100 | Baseline | Systematic | Chronological order; interval k = 100; starts 1–100 | Exact | 100 | 100 starts | Exact | 0.0000 | 6.9567 | 6.9567 |
| Methods at n = 100 | Baseline | Weekday-stratified | Weekday; 20 per weekday; population weights 0.2 each | 42 | 100 | 1000 repetitions | Monte Carlo | -0.0314 | 1.3952 | 1.3955 |
| Sample size | Baseline | Simple random | Without replacement | 42 | 1 | 1000 repetitions | Monte Carlo | 0.2218 | 13.9674 | 13.9691 |
| Sample size | Baseline | Simple random | Without replacement | 42 | 10 | 1000 repetitions | Monte Carlo | 0.0315 | 4.5941 | 4.5942 |
| Sample size | Baseline | Simple random | Without replacement; same result as Experiment A | 42 | 100 | 1000 repetitions | Monte Carlo | -0.0355 | 1.4398 | 1.4402 |
| Challenge | Baseline chronological order | Systematic | Original order; k = 100; all starts 1–100 | Exact | 100 | 100 starts | Exact | 0.0000 | 6.9567 | 6.9567 |
| Challenge | Shuffled order | Systematic | Shuffle seed 42; k = 100; all starts 1–100 | Exact | 100 | 100 starts | Exact | -0.0000 | 1.4752 | 1.4752 |
| Challenge | Baseline population; SRS alternative | Simple random | Without replacement; simulation seed 20261105 | 20261105 | 100 | 1000 repetitions | Monte Carlo | 0.0863 | 1.4572 | 1.4597 |
| Challenge | Baseline chronological order | Weekday-stratified | Weekday; 20 per weekday; weights 0.2 each; without replacement; simulation seed 20261105 | 20261105 | 100 | 1000 repetitions | Monte Carlo | -0.0409 | 1.4291 | 1.4297 |
| Challenge | Shuffled order | Weekday-stratified | Shuffle seed 42; weekday; 20 per weekday; weights 0.2 each; reused baseline stratified draws; simulation seed 20261105 | 20261105 | 100 | 1000 repetitions | Monte Carlo | -0.0409 | 1.4291 | 1.4297 |
| Challenge | Shuffled order | Simple random | Shuffle seed 42; without replacement; reused baseline SRS alternative draws; simulation seed 20261105 | 20261105 | 100 | 1000 repetitions | Monte Carlo | 0.0863 | 1.4572 | 1.4597 |

All bias, SD, and RMSE values are in minutes. The shuffled SRS and weekday-stratified rows reuse the matching baseline samples and estimates: no additional repetitions are generated. Reordering preserves membership, weekday groups, population weights, and these sampling designs. These are paired condition results, not independent simulations.

## 4. Findings (in my own words, using my own numbers)

**(a) The three sampling methods compared at n = 100:**

For the baseline population of 10,000 clinic appointments, all three sampling methods had very little bias at a sample size of 100. Simple random sampling had a bias of -0.0355 minutes, an SD of 1.4398, and an RMSE of 1.4402. Weekday-stratified sampling performed slightly better, with a bias of -0.0314, an SD of 1.3952, and an RMSE of 1.3955. Systematic sampling is unbiased because every appointment has equal inclusion probability and the estimate is the sample mean. Evaluating all 100 possible starts measures its exact bias, rather than causing unbiasedness; its SD and RMSE were much higher at 6.9567. This shows that a sampling method can be unbiased but still have a lot of variability. Based on these results, weekday-stratified sampling had the lowest observed RMSE in this run for this population, although its advantage over simple random sampling was small and may vary with the Monte Carlo seed.

**(b) How sample size affects the spread of estimates and the estimation error, and what a larger sample cannot fix:**

For simple random sampling, increasing the sample size made the estimates much more consistent and reduced the typical estimation error. At n = 1, the SD was 13.9674 minutes and the RMSE was 13.9691. At n = 10, these decreased to 4.5941 and 4.5942, and at n = 100, they decreased further to 1.4398 and 1.4402. This shows that larger samples generally produce estimates closer to the true population mean, although an individual larger sample can still be less accurate than a smaller one. A larger sample also cannot automatically fix problems caused by the sampling method or patterns in the population's ordering, as shown by the high variability of systematic sampling at n = 100.

**(c) Appointment-order challenge:** The challenge finding and its numerical evidence are recorded in the post-test response in Section 5.

## 5. Challenge (hypothesis written independently before consulting AI)

Hypothesis, recorded before testing the challenge:

- **Date written:** 11/5/2026
- **Method I chose to challenge:** Systematic sampling.
- **The change to the population or its ordering:** I will compare the original chronological ordering of the 10,000 clinic appointments with a randomly shuffled ordering of the same appointments. The waiting times and population membership will remain unchanged.
- **Why the selection rule would interact with that change:** Systematic sampling selects appointments at fixed intervals. In the original chronological order, repeating patterns in the clinic schedule may cause certain starting positions to consistently select appointments with unusually high or low waiting times. Shuffling the order should reduce this problem by breaking up those patterns.
- **Evidence I expect across repeated samples:** At n = 100, I expect systematic sampling to have much lower SD and RMSE after shuffling the appointments. I expect its bias to remain approximately zero when all possible starting positions are evaluated.
- **Evidence that would contradict my hypothesis:** If systematic sampling has similar or higher SD and RMSE after shuffling, that would contradict my prediction that the original ordering is responsible for its high variability.

After I test it:

- **Test settings (conditions, methods, alternative method or correction, n, seeds); results are in the table above:** I compared systematic sampling using the original chronological ordering against systematic sampling using a shuffled ordering of the same 10,000 appointments. I used a sample size of 100, a systematic interval of 100, and all 100 possible starting positions for both conditions. The shuffled condition used seed 42. I also compared simple random sampling without replacement using 1,000 repetitions and simulation seed 20261105. I tested shuffle seed 43 and then returned to 42 to verify reproducibility.

- **Did the evidence support my hypothesis? Bias versus variability, other explanations, what the alternative or correction showed, and any dated revision (keep the original above):** Yes, the results supported my hypothesis. Systematic sampling had an SD and RMSE of 6.9567 minutes with the original chronological ordering, but both decreased to 1.4752 for the tested ordering with shuffle seed 42, a reduction of approximately 79%. Both systematic conditions had essentially zero bias, showing that the main problem was variability rather than systematic overestimation or underestimation. This suggests that repeating patterns in the original appointment ordering interacted with the fixed sampling interval. Simple random sampling performed similarly to shuffled systematic sampling, with an SD of 1.4572 and an RMSE of 1.4597. These results show that the tested shuffle improved the reliability of systematic sampling without changing the population or its true mean; they do not establish the outcome for every possible ordering.

## 6. AI use

I used ChatGPT to help understand the assignment instructions, organize the project, and revise documentation. I used Codex in Visual Studio Code to help implement the JavaScript app, including the population visualization, sampling methods, and repeated-sampling experiments. I independently developed and recorded my Stage 5 hypothesis before consulting AI about its implementation. I reviewed the results, tested the app, compared results across different seeds and repetition counts, and checked the systematic sampling calculations against the assignment requirements.## 5. Challenge (hypothesis developed with AI assistance before implementation)
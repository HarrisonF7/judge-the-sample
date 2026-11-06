# Evidence

Save the evidence for your submission here: screenshots or exported tables from your own app.
Name each file by what it shows. In it or beside it, note the population or condition, method, settings, seed (if the result is random), n, and the number of repetitions or exact-enumeration starts. Keep results from different conditions in separate files. For example:

- `method-comparison-n100.png` (or `.csv`)
- `sample-size-comparison.png`
- `challenge-baseline-vs-modified.png`

One screenshot or export per experiment is enough. Your app does not need to keep a history of runs; the key numbers also go in the results table in `DECISIONS.md`.

## Saved evidence index

All results use the unchanged 10,000-appointment clinic population and a true mean of 22.6842 minutes. Captures show different portions of the app and should be read together. New distribution captures and the replacement stage5_comparison.png were saved directly from the running application without image editing.

| Files | Conditions and settings |
|---|---|
| stage4_methods.png; stage4_methods_distributions.png | Baseline; SRS, systematic, weekday-stratified; n = 100. Monte Carlo seed 42, 1,000 repetitions; systematic all 100 exact starts, k = 100. Weekday allocation 20 each, population weights 0.2. |
| stage4_sample_sizes.png; stage4_sample_size_distributions.png | Baseline SRS; n = 1, 10, 100; seed 42; 1,000 repetitions per size. SRS n = 100 reused from Experiment A. |
| stage5_comparison.png; stage5_original_distributions.png | Baseline chronological and modified shuffled systematic order (shuffle seed 42), n = 100, k = 100, 100 exact starts each; baseline SRS alternative at n = 100, simulation seed 20261105, 1,000 repetitions. |
| stage5_additional_distributions.png; stage5_additional_metrics.png | Baseline and shuffled weekday-stratified, plus shuffled SRS; n = 100; simulation seed 20261105; shuffle seed 42; 1,000 repetitions per Monte Carlo method. Stratified allocation 20 per weekday with weights 0.2; weighted estimator. Shuffled Monte Carlo panels reuse matching baseline draws, not independent simulations. |

The original Stage 4 images capture metrics tables. Companion captures add estimate distributions and true-mean lines. The Stage 5 captures collectively cover all six method–condition combinations.

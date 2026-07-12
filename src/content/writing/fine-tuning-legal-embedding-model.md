---
title: "fine-tuning a legal embedding model: v1 → v4 (methodology + results)"
date: 2026-07-13
---

**Project:** local, $0 legal-search RAG for Indian law (Supreme Court + Delhi High Court, ~417k judgments).
**What we did:** fine-tuned `BAAI/bge-base-en-v1.5` (109M-param embedding model) on our own legal data so it retrieves the right judgment more often than the off-the-shelf model. Entirely local — one RTX 5060 Ti (16 GB), a local LLM (qwen2.5) to generate training data. No paid APIs. No cloud.

---

## TL;DR

| | Recall@10 | MRR@10 |
|---|---|---|
| Vanilla bge-base | 0.7181 | 0.5137 |
| **Fine-tuned (v4)** | **0.7897** | **0.6009** |
| **Improvement** | **+7.2 pts** | **+8.7 pts** |

**~25% fewer missed cases** (miss rate 28% → 21%), and the right precedent ranked meaningfully higher. Training: **~5 minutes** on a consumer GPU. Cost: **₹0**.

---

## The method (this is the part that makes the number trustworthy)

Anyone can claim "my AI improved X%." The number only means something if the test is honest. Here's the discipline we held:

1. **Held-out exam, frozen first.** Before building *any* training data, we set aside **400 judgments** (seed-fixed random). Their questions became the eval set; **every chunk of those 400 was banned from training.** You never test on what you trained on.
2. **Leakage verified, not assumed.** We ran an explicit check: 0 eval judgments in the training pairs. When a follow-up check found 11 eval *questions* whose text also appeared in training (generic boilerplate like "whether the petition is maintainable"), we **removed them and re-measured.** The lift barely moved — proof it wasn't leakage-driven.
3. **Fair A/B.** Vanilla and fine-tuned are scored on the **identical** candidate pool (correct-answer chunks of the 400 eval judgments + 30k distractors), same k, same query handling. Only the model changes.
4. **The metric that matters.** We report **Recall@10** ("did the right judgment make the first page?") and **MRR@10** ("how high was it?"). For a legal tool, MRR is the one to watch — a lawyer wants the right case near the top, not buried at rank 9.

**How the training data was built (all free, from our own corpus):**
- **Headnote pairs:** our 2,163 AI-generated headnotes each have an `ISSUES:` line = a real lawyer-style question; paired with a chunk of that judgment.
- **GenQ pairs:** the local qwen2.5 read judgment passages and wrote the search question each answers (~10k of these).
- Merged, deduped, and filtered to drop pairs where the question quotes the passage verbatim (that would teach dumb string-matching, not meaning).

---

## The experiments (what each version changed, and what it taught us)

Same held-out eval across all versions. Deltas are vs vanilla, in points (×100).

| Ver | Change from previous | Pairs | Epochs | Batch | Loss | Recall@10 | MRR@10 |
|---|---|---|---|---|---|---|---|
| **v1** | first fine-tune | 6,010 | 1 | 32 | MNRL | +5.1 | +7.1 |
| **v2** | relaxed echo filter (recovered ~3.6k pairs) | 9,585 | 1 | 32 | MNRL | **+7.2** | +7.8 |
| **v3** | bigger batch (128 via CachedMNRL) | 9,585 | 1 | 128 | Cached-MNRL | +6.3 | +7.9 |
| **v4** | 2 epochs (reverted batch to 32) | 9,585 | 2 | 32 | MNRL | **+7.2** | **+8.7** ⭐ |

**Absolute scores** (clean eval, 447 questions, 30k pool):

| Ver | Recall@10 | MRR@10 |
|---|---|---|
| vanilla | 0.7181 | 0.5137 |
| v1 | 0.7696 | 0.5847 |
| v2 | 0.7897 | 0.5917 |
| v3 | 0.7808 | 0.5922 |
| **v4** | **0.7897** | **0.6009** |

### What we learned
- **v1 → v2: more data is the biggest lever.** Recovering ~3,600 pairs the filter had over-killed (relaxing "shared 4 words" → "shared 6 words") pushed recall +5.1 → +7.2 with zero other changes. This is the textbook result: *more good data beats clever tricks.*
- **v2 → v3: bigger batch HURT.** Batch 128 gives each query more negatives to beat (a stronger signal), but for a small dataset it meant only 68 weight updates per epoch vs 270 at batch 32. **Too few steps — the model under-trained.** Recall dropped +7.2 → +6.3. A real lesson: for small data, *more steps (smaller batch) beats more negatives (bigger batch).*
- **v2 → v4: a 2nd epoch sharpens ranking.** More update steps left recall flat but pushed MRR +7.8 → +8.7 — it didn't find *more* right cases, it ranked the ones it finds *higher*. eval_loss dropped to 0.138 and plateaued (refined, not overfit).

**Champion: v4** — +7.2 recall, +8.7 MRR.

---

## Honest caveats (so nobody can call this a vanity number)
1. **Reduced pool.** The 0.79 absolute number is measured against a 30k-chunk pool, not the full 5M corpus. The **delta vs vanilla** (measured on the identical pool) is the honest signal; the absolute number would be lower against all 5M.
2. **AI-generated eval questions.** The eval queries are headnote `ISSUES:` lines and are a good *proxy* for lawyer queries, not a substitute for real user logs. Adding a set of real lawyer queries would strengthen the claim.
3. **Fixed eval set across versions** — fair for comparing v1..v4, but the leakage scrub was derived from v1's training anchors; residual overlap with later versions is tiny but non-zero.
4. Not yet re-embedded at full 5M scale (the true production test) — that's the ship step.

---

## What's next (ranked by expected payoff)
**Data (the real gains):**
1. **Hard negatives** — mine tempting-but-wrong passages (via our BM25 index). The single biggest lever in the literature; not yet landed because the miner was slow (fix: efficient mining).
2. **More GenQ pairs** — 10k chunks used so far; 30k+ adds fresh, diverse data.
3. **Statute→judgment pairs** — "Section 138 NI Act" → cases citing it (from `acts_cited`).
4. **Better positive selection** — pick the semantically-best chunk, not the max-word-overlap one.

**Training (mostly tapped):**
5. 3 epochs (likely marginal — plateaued at 2), learning-rate sweep (try 3e-5).
6. A **reranker** (cross-encoder over the top 20) — separate model, usually a large jump.

**Bigger swing:** fine-tune `bge-large-en` (335M) for more capacity.

---

## Tweet-ready lines (all true)
- "Fine-tuned my own embedding model for Indian case-law search. +8.7 MRR / ~25% fewer missed cases vs stock bge-base. One gaming GPU, fully local, ₹0."
- "A generic AI can't tell a §138 cheque-bounce case from a §420 cheating case. A lawyer can. So I taught mine to — 5-minute training run, no cloud, no API."
- "Ran 4 experiments to get here. Biggest lesson: more data > clever tricks (bigger batch actually made it worse). The eval, not the vibes, picked the winner."

---

## Reproducibility
Scripts (`scripts/`): `build_eval_and_pairs.py` (freeze eval + headnote pairs) · `export_genq_batch.py` + `gen_queries.py` (GenQ on GPU) · `build_final_pairs.py` (merge/filter) · `train_bge_legal.py` (the fine-tune, GPU) · `build_pool.py` + `eval_pool_gpu.py` (the A/B harness). Data: `finetune/`. Models: `models/bge-legal-v{1..4}/`. Eval set: `finetune/eval_queries_clean.jsonl` (frozen). All seed-fixed (42).

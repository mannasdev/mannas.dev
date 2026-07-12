---
title: "i fine-tuned an embedding model on indian case law and it actually worked"
date: 2026-07-13
---

i made this in 2 days: a fully local, zero-rupee legal search engine for Indian law, a RAG system over roughly 417k judgments from the Supreme Court and the Delhi High Court. The retrieval layer was `BAAI/bge-base-en-v1.5`, a 109M-parameter embedding model, straight off the shelf. It was fine. But legal search is full of distinctions that generic embeddings blur together: a cheque-bounce case under Section 138 of the Negotiable Instruments Act is not a cheating charge under Section 420 IPC, and anticipatory bail is not regular bail. A model trained on the general internet doesn't really know that. A model trained on my corpus might.

So I fine-tuned it. Entirely on my own machine, one RTX 5060 Ti with 16 GB of VRAM, a local qwen2.5 to generate training data, no paid APIs, no cloud. Total cost: ₹0. Training time for the winning run: about 5 minutes.

The headline: vanilla bge-base scored 0.7181 Recall@10 and 0.5137 MRR@10 on my eval. The fine-tuned v4 scored 0.7897 and 0.6009. That's +7.2 points of recall and +8.7 points of MRR. The miss rate dropped from 28% to 21%, so roughly 25% fewer cases where the right judgment doesn't even make the first page, and when it does make the page, it ranks meaningfully higher.

## building an exam you can't cheat on

The number is only interesting if it's trustworthy, so most of the actual work went into the evaluation, not the training.

Before generating any training data, I set aside 400 judgments (seed-fixed random selection) as a held-out exam. Their questions became the eval set, and every chunk of those 400 judgments was banned from training. You never test on what you trained on, obvious in principle, easy to fumble in practice.

I also didn't just assume there was no leakage; I checked. An explicit scan confirmed zero eval judgments appeared in the training pairs. A second pass found 11 eval questions whose *text* also showed up in training, generic boilerplate like "whether the petition is maintainable." I removed those and re-measured. The lift barely moved, which is exactly what you want to see: the improvement isn't leakage in disguise.

The A/B itself is as fair as I could make it. Vanilla and fine-tuned models are scored on the identical candidate pool (the correct-answer chunks of the 400 eval judgments plus 30k distractors), with the same k and the same query handling. The only thing that changes between runs is the model.

On metrics: Recall@10 answers "did the right judgment make the first page?" and MRR@10 answers "how high was it?" For a legal tool, MRR is the one I actually care about. A lawyer wants the right precedent near the top, not buried at rank 9.

## training data for free

All the training pairs came from my own corpus, generated locally. Two sources: 2,163 AI-generated headnotes, each with an `ISSUES:` line that reads like a real lawyer's question, paired with a chunk of that judgment. And about 10k "GenQ" pairs, where a local qwen2.5 read judgment passages and wrote the search question each one answers.

I merged and deduped these, then filtered out pairs where the question quotes the passage verbatim, since those would teach the model dumb string-matching instead of meaning.

## four experiments, three lessons

I ran four versions, all scored against the same frozen eval so the deltas are directly comparable:

| version | pairs | epochs | batch | Δ recall | Δ MRR |
|---|---|---|---|---|---|
| v1 | 6,010 | 1 | 32 | +5.1 | +7.1 |
| v2 | 9,585 | 1 | 32 | +7.2 | +7.8 |
| v3 | 9,585 | 1 | 128 | +6.3 | +7.9 |
| v4 | 9,585 | 2 | 32 | **+7.2** | **+8.7** |

(Absolute scores, clean eval, 447 questions, 30k pool: vanilla 0.7181/0.5137, v1 0.7696/0.5847, v2 0.7897/0.5917, v3 0.7808/0.5922, v4 0.7897/0.6009.)

**v1 → v2: more data is the biggest lever.** My echo filter was over-aggressive, it dropped any pair sharing 4 words between question and passage. Relaxing that to 6 words recovered about 3,600 good pairs, and recall jumped from +5.1 to +7.2 with zero other changes. Textbook result: more good data beats clever tricks.

**v2 → v3: bigger batch hurt.** Batch 128 (via CachedMNRL) gives each query more in-batch negatives to beat, which should be a stronger training signal. But on a dataset this small, it meant only 68 weight updates per epoch instead of 270 at batch 32. Too few steps, the model under-trained and recall dropped to +6.3. For small data, more steps beats more negatives.

**v2 → v4: a second epoch sharpens ranking.** Going back to batch 32 and training for 2 epochs left recall flat but pushed MRR from +7.8 to +8.7. It didn't find more right cases; it ranked the ones it finds higher. Eval loss dropped to 0.138 and plateaued, refined, not overfit. v4 is the champion.

## the caveats, before anyone else finds them

A few things keep this from being a vanity number, and I'd rather say them myself.

First, the 0.79 absolute recall is measured against a 30k-chunk pool, not the full 5M-judgment corpus. The delta vs vanilla, measured on an identical pool, is the honest signal; the absolute number would be lower against all 5M. Second, the eval questions are AI-generated headnote `ISSUES:` lines. They're a good proxy for lawyer queries but not a substitute for real user logs. Third, the eval set is fixed across all four versions, which is fair for comparing v1 through v4, but the leakage scrub was derived from v1's training anchors, so residual overlap with later versions is tiny but non-zero. And fourth, I haven't re-embedded the full 5M-scale corpus with v4 yet. That's the real production test, and it's the ship step.

## what's next

Ranked by expected payoff, and the biggest wins are all on the data side. Hard negatives first: mining tempting-but-wrong passages via a BM25 index is the single biggest lever in the literature, and I haven't landed it yet only because my miner was slow. Then more GenQ pairs (I've used 10k chunks; 30k+ would add fresh diversity), statute-to-judgment pairs ("Section 138 NI Act" → cases citing it, straight from the acts_cited data), and smarter positive selection, picking the semantically best chunk instead of the max-word-overlap one.

Training itself feels mostly tapped. A third epoch is probably marginal given the plateau, a learning-rate sweep (3e-5) is worth a look, and a cross-encoder reranker over the top 20 is a separate model but usually a large jump. The bigger swing would be fine-tuning bge-large-en at 335M parameters for more raw capacity.

Five minutes of training on a consumer GPU, ₹0 spent, and a quarter fewer missed cases. The gap between off-the-shelf and domain-tuned is real, and you don't need a cluster to close it.

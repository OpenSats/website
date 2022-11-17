---
title: 'C++ Programming for Reduction of Statistical Attack Risk'
summary: "Thwarting probabalistic transaction tracing through analysis of the statistical breadcrumbs of Monero's ring signatures and fee calculation procedures."
nym: 'mj-xmr'
website: 'https://github.com/mj-xmr/'
coverImage: '/img/project/Statistical-Monero-Logo.gif'
git: 'https://github.com/mj-xmr'
twitter: 'monero'
personalTwitter: 'monero'
type: 'Other Free and Open Source Project'
goal: 19200
isFunded: false
---
### Goal: 19,200 USD

Currently, every Monero transactions input is signed by one of 16 ring members that appear on the blockchain. One of the 16 is the truly spent output. The remaining 15 are "decoys" that mislead anyone attempting to trace Monero transactions. Ideally, the probability of guessing the truly spent output from the ring is only 1/16 (6.25%). However, certain statistical techniques can be used to increase the correct guess rate. 

It is believed that blockchain surveillance companies use statistical techniques in their attempts to trace Monero. In [their own words](https://ciphertrace.com/ciphertrace-files-two-monero-cryptocurrency-tracing-patents/), CipherTrace's Monero "tracing" involves:
 
> - Statistical and probabilistic methods for scoring transaction and clustering likely owners.
> - Monero decoy reduction.
> - Probabilistic approaches to risk-based Monero money laundering controls.

The purpose of this project is to enable research on ways to reduce the risk of statistical attack on the Monero privacy model. The task list is focused on supporting [OSPEAD](https://ccs.getmonero.org/proposals/Rucknium-OSPEAD-Fortifying-Monero-Against-Statistical-Attack.html) with C++ programming work. Once this project is funded, mj-xmr will:

1) Develop a method to identify which Monero transactions were created by the MyMonero wallet software, [based on differences in the way that MyMonero calculates transaction fees](https://github.com/mymonero/mymonero-core-cpp/pull/36). Isolation of these transactions will help reveal ["anonymity puddles"](https://www.youtube.com/watch?v=XIrqyxU3k5Q) in the blockchain and improve understanding of the ecosystem of decoy selection algorithms.

2) Create a formal specification of the MyMonero decoy selection algorithm as a [probability density function](https://en.wikipedia.org/wiki/Probability_density_function). A [similar analysis](https://github.com/mj-xmr/monero-mrl-mj/tree/decoy/decoy) has already been performed for the `wallet2` C++ code, which most wallet software use to create Monero transactions.

3) Program a fast C++ implementation of a statistical procedure that estimates Monero's real spend age distribution. The estimate will be used to set a new decoy selection algorithm so that real spends and decoys are harder to distinguish.

4) Adaptation of [tsqsim](https://github.com/mj-xmr/tsqsim) time series forecast analyzer software for performance evaluation of alternative decoy selection algorithms. The real spend age distribution is a constantly moving target.



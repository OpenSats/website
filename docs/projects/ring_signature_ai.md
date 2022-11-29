---
title: 'Ring Signature Resiliency to AI Analysis'
summary: "A test of machine learning attacks on Monero's untraceability."
nym: 'ACK-J'
website: 'https://magicgrants.org/Monero-Tracing-Research/'
coverImage: '/img/project/ring_sig.png'
git: 'https://github.com/ACK-J'
twitter: 'G666g1e'
personalTwitter: 'G666g1e'
personalWebsite: 'https://github.com/ACK-J'
type: 'Other Free and Open Source Project'
goal: 12000
isFunded: true
numdonationsxmr: 1
totaldonationsinfiatxmr: 12000
totaldonationsxmr: 80
numdonationsbtc: 0
totaldonationsinfiatbtc: 0
totaldonationsbtc: 0
fiatnumdonations: 0
fiattotaldonationsinfiat: 0
fiattotaldonations: 0
---
### Funded Goal: 12,000 USD

ACK-J created a series of Monero transactions using different spend patterns and applied artificial intelligence models to determine the resiliency of ring signatures against these models, absent external information. The MAGIC Monero Fund approved the research grant from its general fund.

The full paper "Lord of the Rings: An Empirical Analysis of Monero's Ring Signature Resilience to Artifically Intelligent Attacks" is available [on the author's GitHub](https://raw.githubusercontent.com/ACK-J/Monero-Dataset-Pipeline/main/Lord_of_the_Rings__An_Empirical_Analysis_of_Monero_s_Ring_Signature_Resilience_to_Artificially_Intelligent_Attacks.pdf), along with [the accompanying dataset pipeline](https://github.com/ACK-J/Monero-Dataset-Pipeline).

The transcript of a short inverview with ACK-J discussing the results is [here](https://magicgrants.org/Monero-Tracing-Research/).

## Main results

With 11 ring members, public information on the Monero blockchain could aid an attacker in predicting the true spend of a transaction greater than the random guessing probability of 9% (1/11). With this model, the likelihood of a correct guess grew to 13.3%, a modest increase. Since the data was collected, Monero increased its ring size to 16; thus, the accuracy should now be lower, but we do not have numbers for this.




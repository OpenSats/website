---
fund: firo
title: 'Firo Example Campaign'
summary: "The EAE attack is one of Monero's privacy weak points. Churning may be a solution."
nym: 'Dr. Nathan Borggren'
website: 'https://github.com/nborggren'
coverImage: '/img/project/EAE_diagram.png'
git: 'https://github.com/nborggren'
twitter: 'magicgrants'
personalTwitter: 'magicgrants'
personalWebsite: 'https://github.com/nborggren'
type: 'Other Free and Open Source Project'
date: '2023-06-08'
staticXMRaddress: '87LZA8XLDvhVKLi974MaxUANcvkWdL6n986R7WNgKLXY16y31t69Z8228EWcg8THQq3tuAWfQ7Np35Tt3AhPrjzcNbm8Jr5'
goal: 29260
isFunded: false
numdonationsxmr: 27
totaldonationsinfiatxmr: 29260
totaldonationsxmr: 220
numdonationsbtc: 0
totaldonationsinfiatbtc: 0
totaldonationsbtc: 0
fiatnumdonations: 0
fiattotaldonationsinfiat: 0
fiattotaldonations: 0
---

### Funded Goal: 220 XMR (86 XMR contributed from MAGIC Monero Fund general fund)

### Start: June 2023

### End: September 2023

### Result: [Research paper](/pdf/Borggren-Sept-2023-Probing-the-Attacks-on-the-Privacy-of-the-Monero-Blockchain.pdf)

The EAE (Eve-Alice-Eve) attack is a threat to Monero user privacy. When a Monero user sends and/or receives funds repeatedly with an entity (Eve) that aims to trace funds, enough information in the local transaction graph and ring signatures may be available to make a probabalistic guess about the true destination or source of funds. There are different names for this attack and related attacks, which mostly differ in how many colluding entities are involved and how much information they may possess: EABE, poisoned outputs, Overseer, Flashlight, Tainted Dust, and Knacc attacks. One of the videos of the Breaking Monero series [discusses the EAE attack in detail](https://www.monerooutreach.org/breaking-monero/poisoned-outputs.html).

The EAE attack has been a concern of the Monero Research Lab for years, but rigorous measurement of the possible risk of this attack and possible defenses against it have not been successfully researched. "Churning", the practice of users sending funds to themselves, has been suggested as a possible defense, but neither its effectiveness nor details about best churning procedures have been determined by research to date.

Dr. Nathan Borggren has stepped up to investigate these important research questions about how to best protect Monero user privacy. Dr. Borggren is lead author of two papers about possible statistical threats to Monero user privacy: Borggren & Yao (2020) ["Correlations of Multi-input Monero Transactions"](https://moneroresearch.info/index.php?action=resource_RESOURCEVIEW_CORE&id=57) and Borggren et al. (2020) ["Simulated Blockchains for Machine Learning Traceability and Transaction Values in the Monero Network"](https://moneroresearch.info/index.php?action=resource_RESOURCEVIEW_CORE&id=58). His work analyzing transparent blockchains includes Borggren et al. (2017) "Deanonymizing Shapeshift: Linking Transactions Across Multiple Blockchains" and Borggren (2017) "Deep Learning of Entity Behavior in the Bitcoin Economy".

Dr. Borggren has proposed using Topological Data Analysis and Bayesian statistical methods to analyze the EAE attack and related attacks on Monero user privacy. The false positive and false negative rate of the EAE attack will be investigated through simulations and possibly analysis of Monero's mainnet blockchain. The full details of the plan are in [the research proposal](https://github.com/MAGICGrants/Monero-Fund/blob/main/projects/borggren_research-MAGIC-submission.pdf).

> "I think that the EAE attack is one of Monero's biggest _practical_ attack surfaces currently, and I see value in quantification plus real world data-informed best practices."

&mdash; [isthmus](https://github.com/Mitchellpkt), Monero Research Lab researcher and lead author of ["Fingerprinting a flood: Forensic statistical analysis of the mid-2021 Monero transaction volume anomaly"](https://mitchellpkt.medium.com/fingerprinting-a-flood-forensic-statistical-analysis-of-the-mid-2021-monero-transaction-volume-a19cbf41ce60)

> "Borggren has previously released fascinating papers quantifying Monero privacy pitfalls and I'm excited he is looking to continue."

&mdash; [ACK-J](https://github.com/ACK-J), author of ["Lord of the Rings: An Empirical Analysis of Monero's Ring Signature Resilience to Artifically Intelligent Attacks"](https://raw.githubusercontent.com/ACK-J/Monero-Dataset-Pipeline/main/Lord_of_the_Rings__An_Empirical_Analysis_of_Monero_s_Ring_Signature_Resilience_to_Artificially_Intelligent_Attacks.pdf)

---
title: 'Sapio'
summary: 'Sapio is a tool for defining such smart contracts in an easy way and exporting easy to integrate APIs for managing open contracts.'
nym: 'Jeremy Rubin'
website: 'https://judica.org'
coverImage: '/static/images/projects/sapio.jpg'
git: 'https://github.com/sapio-lang/sapio'
twitter: 'jeremyrubin'
personalTwitter: 'JeremyRubin'
type: 'Smart Contracts'
zaprite: 'P9j4XyrCOFAgCXkHHV5s'
---

## About this project

Sapio helps you build payment protocol specifiers that oblivious third parties can participate in being none the wiser.

For example, with Sapio you can generate an address that represents a lightning channel between you and friend and give that address to a third party service like an exchange and have them create the channel without requiring any signature interaction from you or your friend, zero trusted parties, and an inability to differentiate your address from any other.
That’s the tip of the iceberg of what Sapio lets you accomplish.

Before Sapio, most Bitcoin smart contracts primarily focused on who can redeem coins when and what unlocking conditions were required (see Ivy, Policy/Miniscript, etc). A few languages, such as BitML, placed emphasis on multi-transaction and multi-party use cases.
Sapio in particular focuses on transactions using BIP-119 OP_CHECKTEMPLATEVERIFY. OP_CHECKTEMPLATEVERIFY enables Bitcoin Script to support complex multi-step smart contracts without a trusted setup.

Sapio is a tool for defining such smart contracts in an easy way and exporting easy to integrate APIs for managing open contracts. With Sapio you can turn what previously would require months or years of careful tinkering with Bitcoin internals into a 20 minute project and get a fully functional Bitcoin application.

Sapio has intelligent built in features which help developers design safe smart contracts and limit risk of losing funds.

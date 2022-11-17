---
title: 'ETH<>XMR Atomic Swap Continued Development'
summary: "A trustless way to exchange Monero and Ethereum."
nym: 'noot'
website: 'https://github.com/AthanorLabs/atomic-swap'
coverImage: '/img/project/Ethereum_logo.png'
git: 'https://github.com/noot'
twitter: 'elizabethereum'
personalTwitter: 'elizabethereum'
type: 'Other Free and Open Source Project'
goal: 24000
isFunded: true
numdonationsxmr: 66
totaldonationsinfiatxmr: 18861
totaldonationsxmr: 125.74
numdonationsbtc: 0
totaldonationsinfiatbtc: 0
totaldonationsbtc: 0
fiatnumdonations: 8
fiattotaldonationsinfiat: 5139
fiattotaldonations: 5139
---

### Funded Goal: 24,000 USD

The MAGIC Monero Fund raised funds for noot to continue development on ETH-XMR atomic swaps. View [the campaign here](https://www.gofundme.com/f/noot-ethxmr-atomic-swap-development-4-months).

This proposal covers 4 months of work focused on the following:

### Relayer support

The current implementation of the protocol requires the ETH-recipient to have some ETH in their claiming account to pay for the transaction fees to claim the swap ETH. However, this is bad for UX and privacy, as users cannot withdraw to fresh ETH accounts.

To allow for users to claim ETH into a fresh account, integration with a relayer service can be implemented. This will allow users to withdraw to a fresh account by paying a small fee to a relayer to submit the transaction on their behalf.

### Ethereum privacy improvements

On the ETH side of the swap, there is no privacy, and which accounts and amounts participating in the swap are visible.

### ERC20 support

To support swaps for ERC20s without hurting liquidity, the swap contract can be integrated with a DEX such as Uniswap to automat-ically swap received ETH for the desired ERC20 token.

### Disk permanence

The current implementation of the swap does not store anything to disk apart from information needed for recovery of swap funds in case of failure. However, there are other components that should be stored to disk and restored upon reload, such as current swap of-fers made, historic swap information, and peer information. This will require a simple key-value database implementation.

### General maintenance and bugfixes

See https://github.com/noot/atomic-swap/issues for open issues on the repo. Issues not covered by the above work are part of this sec-tion. This includes RPC calls and documentation, codebase maintenance, testing, and fixes of any bugs found during testing.




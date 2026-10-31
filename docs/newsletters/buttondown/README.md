# Buttondown newsletter editions

These Markdown/HTML files are the email editions of the newsletters in `data/newsletter/`. Paste the contents of an edition into Buttondown’s Markdown editor, then check the rendered email and send a test draft before sending to subscribers.

## Previous editions

- [2026-Q1 — Cypherpunks Write Code](2026-Q1.md): original Buttondown Markdown supplied by Gigi, including its historical lifetime totals ($34,241,243 allocated, approximately 39.5 billion sats, 400 grantees, and 40+ countries) and Buttondown-hosted images. Preserved as supplied, including original formatting and typos.
- [2026-Q2 — Territory of Freedom](2026-Q2.md): converted from the published website in the supplied Q2 Buttondown format, retaining the supplied historical lifetime totals ($35,305,610 allocated, approximately 41.9 billion sats, 415 grantees, and 40+ countries). This is a normalized edition, not a byte-for-byte copy of the Buttondown export.

## 2026-Q3

- Subject/headline: **Anti-Fragile by Design**
- Edition: [2026-Q3.md](2026-Q3.md)
- Website: https://opensats.org/newsletter/2026-Q3
- Publication tracking: https://github.com/OpenSats/content/issues/314

The email follows Q2’s Buttondown formatting: an opening blockquote for the founder’s letter, linked images, emphasized links, and dividers between spotlights. Website components are replaced with static images or links. All image and link URLs are absolute.

The lifetime totals were captured on October 31, 2026: $37,813,621 allocated, approximately 44.3 billion sats sent, 446 grantees, and 50 countries. These are lifetime figures, separate from the Q3 payout totals.

The donation and Heartbeat buttons reuse the Buttondown-hosted assets from Q2. The map and other illustrations use hosted OpenSats images. The Bitchat screenshot is cropped to the top four apps in `public/static/images/newsletter/2026-Q3/bitchat-top-four.png`; its production URL becomes available once this PR is merged and deployed. Before then, upload the cropped image to Buttondown and substitute its uploaded URL if you need to test the draft.

The HTML/Markdown conversion does not send or schedule an email. Preserve Buttondown’s unsubscribe footer and check the actual test email, including images, quotes, and mobile layout.

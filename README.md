# OpenSats.org

This is the codebase behind [OpenSats.org](https://opensats.org).

## Getting started

This website was bootstrapped with [`tailwind-nextjs-starter-blog`](https://github.com/timlrx/tailwind-nextjs-starter-blog).

To run a development environment locally, run:

- `npm install` to install dependencies
- `npm run dev` to run the local development version

Please refer to their [Quick Start Guide](https://github.com/timlrx/tailwind-nextjs-starter-blog#quick-start-guide) for further details.

## Social preview images

`npm run build` generates social cards and checks that every card is exactly
1200×630 and under 1 MB. To regenerate blog cards locally after changing artwork,
run `npx contentlayer build` followed by `npm run generate:blog-og`.
`npm run check:og` validates all generated card families after a full build.

Blog OG and Twitter images use compressed JPEG copies; the original article
artwork stays in place. Cards fill the frame without padding or stretching.
Spotlight crop adjustments live in `scripts/generate-blog-og.mjs`. Review both
the featured and alternate card individually when adding or replacing artwork,
especially text near the edges and portrait headroom.

## Contributing to the project

PRs are welcome! Fork the repository on your GitHub account, push changes to a new feature branch and then [open a new pull request](https://github.com/OpenSats/website/pulls). Feel free to look at [existing pull requests](https://github.com/OpenSats/website/pulls) if you want to help review upcoming announcements, or create new PRs in case you've spotted a typo or similar in our [past announcements](https://opensats.org/blog).

Please [contact us](https://opensats.org/contact) if you have any questions.

Thank you for [supporting OpenSats](https://opensats.org/donate)!

## Contributors

<a align="center" href="https://github.com/OpenSats/website/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=OpenSats/website" />
</a>

---

We've got [badges](https://gist.github.com/dskvr/e160d8d465c2e7ed9a0e437081e7fe31) too!

[![opensats.org](<https://img.shields.io/badge/%3E__-OpenSats-rgb(249,115,22)>)](https://opensats.org)

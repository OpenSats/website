# Human writing badges

Blog posts and newsletter issues show the human slop badge and “Written by humans”
footer when their cached Pangram human-written percentage is at least 85.
Scores are not rounded before comparison. AI-assisted text does not count as
human-written. Unscored articles receive neither the badge nor the footer label.

At the start of `npm run build`, `npm run dev`, or `npm start`, the website fetches
`https://slop.opensats.org/api/scores` once. This read-only endpoint returns cached
scores and never starts a paid Pangram check. The website writes the response to
an ignored file at `.cache/human-writing-scores.json`; `getStaticProps` uses it to
render each article. Visitors make no detector requests. Updated scores appear
on the next build, rather than changing live on an already deployed site.

The request has a ten-second timeout. HTTP/network errors, invalid JSON, and
invalid score data log a build warning and leave an empty snapshot. The build
continues without article badges or human-written labels. The previous snapshot
is cleared before fetching, so a failed refresh never reuses stale scores.

`HUMAN_WRITING_SCORES_URL` can override the endpoint for local development or a
preview deployment. Run `npm run fetch:human-writing-scores` to refresh it manually
before invoking lower-level build commands. If the snapshot is missing or invalid,
article rendering also defaults to no badge.

Scores describe the text last checked by the slop detector. Recheck edited prose
there before rebuilding the website. The build does not submit text for analysis.
The badge artwork and explanatory copy on `/slop` are unchanged.

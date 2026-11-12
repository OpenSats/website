import { refreshHumanWritingScores } from '../lib/humanWritingScores.ts'

const count = await refreshHumanWritingScores({
  url: process.env.HUMAN_WRITING_SCORES_URL,
})
console.log(`[human-writing] Loaded ${count} cached article scores.`)

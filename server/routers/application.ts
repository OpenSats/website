import { FundSlug } from '@prisma/client'
import { z } from 'zod'
import escapeHTML from 'escape-html'

import { publicProcedure, router } from '../trpc'
import { funds, fundSlugs, fundSlugToRecipientEmail } from '../../utils/funds'
import { transporter } from '../services'
import { env } from '../../env.mjs'

export const applicationRouter = router({
  submitApplication: publicProcedure
    .input(
      z.object({
        fundSlug: z.enum(fundSlugs),
        formData: z.record(z.union([z.string(), z.boolean()])),
      })
    )
    .mutation(({ input }) => {
      let html = ''

      for (const [key, value] of Object.entries(input.formData)) {
        html += `<h3>${escapeHTML(key)}</h3><p>${escapeHTML(value.toString())}</p>`
      }

      transporter.sendMail({
        from: env.SES_VERIFIED_SENDER,
        to: fundSlugToRecipientEmail[input.fundSlug],
        subject: `MAGIC ${funds[input.fundSlug].title} application for ${input.formData.project_name}`,
        html,
      })
    }),
})

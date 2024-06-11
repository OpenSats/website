import { z } from 'zod'
import { TRPCError } from '@trpc/server'

import { publicProcedure, router } from '../trpc'
import { authenticateKeycloakClient } from '../utils/keycloak'
import { keycloak } from '../services'

export const authRouter = router({
  register: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input }) => {
      await authenticateKeycloakClient()

      try {
        const user = await keycloak.users.create({
          realm: 'monerofund',
          email: input.email,
          credentials: [
            { type: 'password', value: input.password, temporary: false },
          ],
          requiredActions: ['VERIFY_EMAIL'],
          enabled: true,
        })

        await keycloak.users.executeActionsEmail({
          id: user.id,
          actions: ['VERIFY_EMAIL'],
        })
      } catch (error) {
        if (
          (error as any).responseData.errorMessage ===
          'User exists with same email'
        ) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'EMAIL_TAKEN' })
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'UNKNOWN_ERROR',
        })
      }
    }),
})

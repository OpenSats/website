import { FundSlug } from '@prisma/client'
import { prisma } from '../services'

export async function getUserPointBalance(
  userId: string,
  fundSlug: FundSlug,
  projectSlug: string | null = null
): Promise<number> {
  const lastPointHistory = await prisma.pointHistory.findFirst({
    where: {
      userId,
      fundSlug,
      projectSlug,
      pointsAdded: { gt: 0 },
    },
    orderBy: { createdAt: 'desc' },
  })

  const currentBalance = lastPointHistory ? lastPointHistory.pointsBalance : 0

  return currentBalance
}

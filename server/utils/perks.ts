import { prisma } from '../services'

export async function getUserPointBalance(userId: string): Promise<number> {
  const lastPointHistory = await prisma.pointHistory.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  const currentBalance = lastPointHistory ? lastPointHistory.pointsBalance : 0

  return currentBalance
}

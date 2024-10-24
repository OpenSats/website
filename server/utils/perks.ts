import { prisma, strapiApi } from '../services'
import { StrapiGetPointsPopulatedRes } from '../types'

export async function getUserPointBalance(userId: string): Promise<number> {
  const {
    data: { data: pointHistory },
  } = await strapiApi.get<StrapiGetPointsPopulatedRes>(
    `/points?filters[userId][$eq]=${userId}&sort=createdAt:desc&populate=*`
  )

  const lastPointHistory = pointHistory[0]
  const currentBalance = lastPointHistory ? Number(lastPointHistory.balance) : 0

  return currentBalance
}

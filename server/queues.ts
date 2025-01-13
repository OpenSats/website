import { Queue } from 'bullmq'
import { PerkPurchaseWorkerData } from './workers/perk'
import { redisConnection as connection } from '../config/redis'

import './workers/perk'
import './workers/membership-check'

export const perkPurchaseQueue = new Queue<PerkPurchaseWorkerData>('PerkPurchase', {
  connection,
})

export const membershipCheckQueue = new Queue('MembershipCheck', { connection })

membershipCheckQueue.upsertJobScheduler(
  'MembershipCheckScheduler',
  { pattern: '0 * * * *' },
  { name: 'MembershipCheck' }
)

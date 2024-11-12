import { Queue } from 'bullmq'
import { PerkPurchaseWorkerData } from './workers/perk'

export const perkPurchaseQueue = new Queue<PerkPurchaseWorkerData>('PerkPurchase', {
  connection: { host: 'redis' },
})

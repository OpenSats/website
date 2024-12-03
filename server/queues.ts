import { Queue } from 'bullmq'
import { PerkPurchaseWorkerData } from './workers/perk'
import { redisConnection } from '../config/redis'
import './workers/perk'

export const perkPurchaseQueue = new Queue<PerkPurchaseWorkerData>('PerkPurchase', {
  connection: redisConnection,
})

import {UnrecoverableError} from 'bullmq'
import {format, logger} from 'logger'
import {symmetric} from 'secure-webhooks'
import {v4 as uuidv4} from 'uuid'
import {env} from '~/utils/env.server'
import {prisma} from '~/utils/prisma.server'
import {QueueLog} from '~/utils/queue-log'
import {createQueue} from '~/utils/queue.server'

type Event = 'payment_intent.succeeded'

type QueueData = {
  paymentIntentId: string
  events: Event[]
}

const QUEUE_ID = 'webhook'

/**
 * This queue checks if the wallet has a new transaction and updates the database accordingly.
 * It also triggers a webhook if the payment was successful.
 */
export const queue = createQueue<QueueData>(QUEUE_ID, async job => {
  const {data: payload} = job
  const {paymentIntentId} = payload

  const log = QueueLog(QUEUE_ID, paymentIntentId)
  log('started')

  const paymentIntent = await prisma.paymentIntent.findFirst({
    where: {id: paymentIntentId},
    include: {
      transactions: true,
    },
  })

  if (!paymentIntent) {
    throw new UnrecoverableError(
      `Payment intent not found: ${format.red(paymentIntentId)}`,
    )
  }

  const body = {
    id: uuidv4(),
    idempotenceKey: job.id!,
    event: 'payment_intent.succeeded',
    data: {
      paymentIntent,
    },
  }

  const bodyString = JSON.stringify(
    body,
    (key, value) => (typeof value === 'bigint' ? value.toString() : value), // return everything else unchanged
  )
  const signature = symmetric.sign(bodyString, env.CASHIER_SECRET)

  const result = await fetch(env.CASHIER_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'x-webhook-signature': signature,
    },
    body: bodyString,
  })

  logger.debug(
    `⚑ Sending webhook to ${format.magenta(env.CASHIER_WEBHOOK_URL)}}: ${
      result.ok ? format.green('OK') : format.red('FAILED')
    }`,
  )

  if (!result.ok) {
    throw new Error(
      `Webhook failed: ${format.red(await result.text())} ${format.magenta(
        bodyString,
      )}`,
    )
  }

  log('completed')
})
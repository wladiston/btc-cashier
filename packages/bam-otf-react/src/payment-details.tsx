import React from 'react'
import {currency as currencyUtil} from '@bam-otf/utils'

import type {CurrencyCode} from '../../../config/currency'
import {Copyable} from './copyable'
import {QRCode, type QRCodeProps} from './qr-code'

// TODO: there are duplicate types of this
export const paymentIntentStatus = {
  pending: 'pending',
  processing: 'processing',
  succeeded: 'succeeded',
  canceled: 'canceled',
}

export type PaymentIntentStatus = keyof typeof paymentIntentStatus

export interface PaymentDetailsProps
  extends Pick<QRCodeProps, 'label' | 'message' | 'redirectUrl'> {
  /** Address where the payment should be sent */
  address: string
  /** Amount of the payment returned from the server */
  amount: bigint
  /** Currency code */
  currency: CurrencyCode
  /**
   * The current price of the bitcoin
   */
  price: number

  /**
   * The environment where the payment is being made
   * @default 'development'
   */
  environment?: 'development' | 'preview' | 'production'
}

export function PaymentDetails({
  address,
  amount,
  currency,
  price,
  label,
  message,
  redirectUrl,
  environment = 'development',
}: PaymentDetailsProps) {
  let amountInBTC = currencyUtil.toFraction({amount, currency})

  if (currency !== 'BTC') {
    // TODO: this should be probably getting the price from the endpoint instead of
    // receiving it as a prop
    const converted = currencyUtil.convertToSats({
      amount,
      currency,
      price,
    })
    amountInBTC = currencyUtil.toFraction({
      amount: converted,
      currency: 'BTC',
    })
  }

  return (
    <div
      className={`payment-details ${
        environment === 'development'
          ? 'environment-development'
          : environment === 'preview'
          ? 'environment-preview'
          : ''
      }`}
    >
      <div className="payment-details-title">
        <h3>Payment Details</h3>

        {environment === 'development' ? (
          <button
            onClick={() => {
              window.open(
                `http://localhost:3000/simulate?amount=${amountInBTC}&address=${address}`,
              )
            }}
            className="environment-action"
          >
            Simulate Payment
          </button>
        ) : environment === 'preview' ? (
          <span className="environment-action">testnet</span>
        ) : null}
      </div>

      <QRCode
        address={address}
        amount={amountInBTC}
        label={label}
        message={message}
        redirectUrl={redirectUrl}
      />

      <div className="copyable-field">
        <label>Address</label>
        <Copyable text={address} />
      </div>

      <div className="copyable-field">
        <label>Amount</label>
        <Copyable prefix="BTC" text={amountInBTC.toString()} />
      </div>
    </div>
  )
}

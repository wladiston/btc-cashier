import React, {useEffect, useState} from 'react'
import type {PaymentIntentStatus} from '@bam-otf/node'
import {QRCodeSVG} from 'qrcode.react'

interface CopyButtonProps {
  text: string
}

function CopyButton({text}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 5000)
  }

  return (
    <span onClick={handleCopy} className="cursor-pointer">
      {copied ? 'Copied! ✅' : 'Copy'}
    </span>
  )
}

interface PaymentIntentProps {
  intent: {
    amount: number
    currency: string
    status: PaymentIntentStatus
    address: string
    label?: string
    message?: string
    redirectUrl: string
  }
  price: number
}

export function PaymentIntent({intent, price}: PaymentIntentProps) {
  const {amount, currency, status, address, label, message, redirectUrl} =
    intent

  const [btcAmount, setBtcAmount] = useState(0)

  useEffect(() => {
    async function fetchBtcAmount() {
      const response = await fetch(
        `http://localhost:3000/api/price/${currency}`,
      )
      const {price} = await response.json()
      const btcAmount = Math.ceil((amount / price) * 1e8) / 1e8 // Convert satoshis to BTC with 8 decimal places
      setBtcAmount(btcAmount)
    }

    fetchBtcAmount()
  }, [amount, currency])

  const urlParams = new URLSearchParams({
    amount: btcAmount.toString(),
    label: label ? encodeURIComponent(label) : '',
    message: message ? encodeURIComponent(message) : '',
  })

  const qrCodeValue = `bitcoin:${address}?${urlParams.toString()}&r=${redirectUrl}/success`

  return (
    <>
      <div className="">
        Donating: {amount} {currency}
      </div>
      <div className="">BTC PRICE: {price}</div>
      <div className="">Amount to pay: {btcAmount}</div>

      <QRCodeSVG bgColor="#FFFFFF00" fgColor="#FFFFFFF0" value={qrCodeValue} />

      <div className="">
        Address:
        <div>
          {address} <CopyButton text={address} />
        </div>
      </div>

      <div className="">
        Amount in BTC:
        <div>
          {btcAmount} <CopyButton text={btcAmount.toString()} />
        </div>
      </div>
    </>
  )
}
import axios, {type AxiosInstance} from 'axios'

import type {BamOtfConfig} from './config'
import {UnauthorizedError} from './errors'
import {parse} from './parse'
import {PaymentIntents} from './payment-intents'

/**
 * *bamotf* client class.
 * @param apiKey - API key.
 * @param config - Client configuration.
 */

export class BamOtf {
  public paymentIntents: PaymentIntents
  private config: BamOtfConfig
  private client: AxiosInstance

  constructor(apiKey: string, config?: BamOtfConfig) {
    const {
      baseURL = 'http://localhost:3000',
      // maxNetworkRetries = 3,
      timeout = 60000,
    } = config || {}

    this.config = {
      baseURL,
      timeout,
    }

    if (!apiKey) {
      throw new UnauthorizedError('bamotf API key is required.')
    }

    this.client = axios.create({
      baseURL: `${baseURL}/api`,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      timeout,
    })

    this.client.interceptors.response.use(
      response => {
        // Parse the __meta__ fields from the response
        response.data = parse(response.data)
        return response
      },
      error => {
        if (error.response.status === 401) {
          throw new UnauthorizedError('bamotf API key is invalid.')
        }

        return Promise.reject(error)
      },
    )

    this.paymentIntents = new PaymentIntents(this.client)
  }
}

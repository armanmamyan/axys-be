import { Injectable } from '@nestjs/common'
import type {
  OpenseaAccount,
  OpenseaSingleCollectionResult,
  OpenseaSingleContractResult,
} from './opensea-results.interface'

interface OpenseaNetworks {
  [id: number]: {
    value: string
    default: boolean
  }
}

const OPENSEA_NETWORKS: OpenseaNetworks = {
  1: {
    value: 'ethereum',
    default: true,
  },
  137: {
    value: 'matic',
    default: false,
  },
}

@Injectable()
export class OpenseaService {
  API_KEY

  constructor() {
    this.API_KEY = process.env.OPENSEA_API_KEY
  }

  #fetchFactory(route: string, network: number | null = 1) {
    const url = `https://api.opensea.io/v2${network ? '/chain/' + OPENSEA_NETWORKS[network].value : ''}/${route}`
    return fetch(url, {
      headers: {
        'X-API-KEY': this.API_KEY,
      },
    }).then((response) => response.json())
  }

  async getNFT(address: string, tokenId: string | number, chain = 1) {
    try {
      const nfts: any = await this.#fetchFactory(`contract/${address}/nfts/${tokenId}`, chain)
      return nfts
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async getSingleContract(address: string) {
    try {
      const options = { method: 'GET', headers: { 'X-API-KEY': this.API_KEY } }
      const res = await fetch(`https://api.opensea.io/api/v2/asset_contract/${address}`, options)
      const contract: OpenseaSingleContractResult = await res.json()
      return contract
    } catch (error) {
      console.log(error)
      return null
    }
  }
  async getSingleCollection(slug: string) {
    try {
      const options = { method: 'GET', headers: { 'X-API-KEY': this.API_KEY } }
      const res = await fetch(`https://api.opensea.io/api/v1/collection/${slug}`, options)
      const collection: OpenseaSingleCollectionResult = await res.json()
      return collection
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async getOpenseaAccount(address: string): Promise<OpenseaAccount> {
    try {
      const res = await fetch(`https://api.opensea.io/api/v2/accounts/${address}`, {
        method: 'GET',
        headers: { 'X-API-KEY': this.API_KEY },
      })

      const account: OpenseaAccount = await res.json()
      return account
    } catch (error) {
      console.log(error)
      return null
    }
  }
}

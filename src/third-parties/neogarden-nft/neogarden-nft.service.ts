import { Injectable } from '@nestjs/common';

@Injectable()
export class NeogardenNftService {
  async getNftsByWallet(walletAddress: string, pageNo: number, limit: number) {
    const url = 'https://api.neogarden.io/transaction/nfts-by-wallet';
    const data = {
      pageNo,
      walletAddress: walletAddress.toLowerCase(),
      limit,
    };
    const headers = {
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
      });

      if(response.status == 404) {
        return {
          message: 'Wallet has no NEOGARDE NFTs included'
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.log('error', error);
      throw new Error(`Failed to get Amulet NFT: ${error.message}`);
    }
  }
}

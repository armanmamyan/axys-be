import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class NeogardenNftService {
  constructor(private httpService: HttpService) {}

  async getNftsByWallet(walletAddress: string, pageNo: number, limit: number) {
    const url = "https://api.neogarden.io/transaction/nfts-by-wallet";
    const data = {
      pageNo,
      walletAddress: walletAddress.toLowerCase(),
      limit,
    };
    const headers = {
      "Content-Type": "application/json",
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, data, { headers }),
      );
      return response.data;
    } catch (error) {
      console.log("error", error);
      throw new Error(`Failed to get Amulet NFT: ${error.message}`);
    }
  }
}

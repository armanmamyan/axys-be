import { Injectable } from "@nestjs/common";
import { Fireblocks, BasePath } from "@fireblocks/ts-sdk";
import { readFileSync } from "fs";

@Injectable()
export class FireblocksSservice {
  fireblocksInstance;
  constructor() {
    this.fireblocksInstance = new Fireblocks({
      apiKey: "my-api-key",
      basePath: BasePath.Sandbox, // or assign directly to "https://sandbox-api.fireblocks.io/v1";
      secretKey: readFileSync(process.env.FIREBLOCKS_API_SECRET_PATH, "utf8"),
    });
  }

  async createVault(userId, userEmail) {
    try {
      const vault = await this.fireblocksInstance.vaults.createVaultAccount({
        createVaultAccountRequest: {
          name: `${userId}_${userEmail}`,
          hiddenOnUI: false,
          autoFuel: false,
        },
      });
      return vault;
    } catch (e) {
      console.log(e);
    }
  }
}

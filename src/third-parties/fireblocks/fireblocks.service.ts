import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  Fireblocks,
  BasePath,
  FireblocksResponse,
  VaultAccount,
  VaultAsset,
  TransferPeerPathType,
  TransactionResponse,
} from '@fireblocks/ts-sdk';
import { readFileSync } from 'fs';
import { ConfigService } from '@nestjs/config';
import { SUPPORTED_ASSETS_LIST_TESTNET } from '@/utils/fireblocks.assets.supported';
import { IwithdrawalDetails } from './types';
import { UsersService } from '@/users/users.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { downloadAndExtractFolder } from '@/utils/retrieve-s3-assets';

@Injectable()
export class FireblocksService {
  private fireblocksInstanceSigner;
  private fireblocksInstanceViewer;
  private fireblocksAssetList;

  constructor(
    private configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService
  ) {
    this.fireblocksAssetList = SUPPORTED_ASSETS_LIST_TESTNET;
  }

  async onModuleInit() {
    await this.processInstanceReading();
  }

  async processInstanceReading() {
    try {
      const files = await downloadAndExtractFolder();
      this.fireblocksInstanceSigner = new Fireblocks({
        apiKey: this.configService.get<string>('FIREBLOCKS_SIGNER_API'),
        basePath: BasePath.US,
        secretKey: files.signer,
      });
      this.fireblocksInstanceViewer = new Fireblocks({
        apiKey: this.configService.get<string>('FIREBLOCKS_VIEWER_API'),
        basePath: BasePath.US,
        secretKey: files.viewer,
      });
    } catch (error) {
      console.error('Error initializing Fireblocks instance:', error);
    }
  }

  async createFireblocksAccountWithAssets(
    userId: number,
    userEmail: string
  ): Promise<{ fireblocksId: string; assets: VaultAccount[] }> {
    try {
      const processVaultAccount = await this.createVault(userId, userEmail);
      await this.createUserAssets(processVaultAccount.data.id);
      const getAssetList = await this.getVaultAccountDetails(processVaultAccount.data.id);
      return {
        fireblocksId: processVaultAccount.data.id,
        assets: getAssetList.data.assets,
      };
    } catch (error) {
      console.log('Error During Creating Fireblocks Account For User', error);
      throw error;
    }
  }

  async createVault(userId, userEmail): Promise<FireblocksResponse<VaultAccount>> {
    try {
      const vault = await this.fireblocksInstanceSigner.vaults.createVaultAccount({
        createVaultAccountRequest: {
          name: `${userId}_${userEmail}`,
          hiddenOnUI: false,
          autoFuel: false,
        },
      });
      return vault || null;
    } catch (error) {
      console.log('Error During Creating Vault Account For User', error);
      throw error;
    }
  }

  async getVaultAccountDetails(vaultAccountId: string): Promise<FireblocksResponse<VaultAccount>> {
    try {
      if (!vaultAccountId) return null;
      const retrieveVault = await this.fireblocksInstanceViewer.vaults.getVaultAccount({
        vaultAccountId,
      });
      return retrieveVault || null;
    } catch (error) {
      console.error('Error during retrieving Vault Account', { error });
      throw error;
    }
  }

  async getSupportedListOfAssets() {
    try {
      const fetchAssetList =
        await this.fireblocksInstanceViewer.blockchainsAssets.getSupportedAssets();
      return JSON.stringify(fetchAssetList, null, 2);
    } catch (error) {
      console.error('Error During Fetching list of assets', { error });
      throw error;
    }
  }

  async activateVaultWallet(vaultAccountId: number, assetId: string) {
    try {
      await this.fireblocksInstanceSigner.vaults.activateAssetForVaultAccount({
        vaultAccountId,
        assetId,
      });
    } catch (error) {
      console.log('Error during wallet activation', { error });

      throw error;
    }
  }

  // FOR THE SAKE OF TESTING DURING THE SIGNUP, idempotencyKey will be optional
  async createUserAssets(vaultAccountId: string, idempotencyKey?: string) {
    try {
      return await Promise.all(
        this.fireblocksAssetList.map(async ({ id }) => {
          const data = await this.fireblocksInstanceSigner.vaults.createVaultAccountAsset({
            vaultAccountId,
            assetId: id,
            // string | A unique identifier for the request. If the request is sent multiple times with the same idempotency key,
            // the server will return the same response as the first request. The idempotency key is valid for 24 hours. (optional)
            // idempotencyKey MUST BE PASSED FROM FRONT END in order to properly trace data
            idempotencyKey,
          });
          // ACTIVATE WALLETS FOR USER
          // In Fireblocks, you need to activate a wallet in a vault account because some tokens require an on-chain transaction to "initialize" or "create" the wallet before it can store or interact with assets. This process is essential for certain tokens, like Stellar (XLM) and Solana (SOL),
          // which use unique mechanisms for account and wallet creation that involve a small transaction to initialize the wallet on their blockchain.
          await this.activateVaultWallet(Number(vaultAccountId), id);
          return {
            [id]: data,
          };
        })
      );
    } catch (error) {
      console.error('Error During Assets creation for Vault Account', { error });
      throw error;
    }
  }

  async getAccountBasedDepositAddress(
    vaultAccountId: string,
    assetId: string
  ): Promise<FireblocksResponse<VaultAsset>> {
    try {
      const retrieveAsset =
        await this.fireblocksInstanceViewer.vaults.getVaultAccountAssetAddressesPaginated({
          vaultAccountId,
          assetId,
        });

      return retrieveAsset?.data || null;
    } catch (error) {
      console.error('Error During retrieving asset details', { error });

      throw error;
    }
  }

  async updateVaultAccountAssetBalance(vaultAccountId: string) {
    try {
      return await Promise.all(
        this.fireblocksAssetList.map(async ({ id }) => {
          const updatedAsset =
            await this.fireblocksInstanceSigner.vaults.updateVaultAccountAssetBalance({
              vaultAccountId,
              assetId: id,
            });
          return {
            [id]: updatedAsset.data,
          };
        })
      );
    } catch (error) {
      console.error('Error During retrieving asset details', { error });
      throw error;
    }
  }

  async getTransactionFee(vaultAccountId: string, withdrawalDetails: IwithdrawalDetails) {
    try {
      const { amount, withdrawalAddress, assetId, type } = withdrawalDetails;
      const payload = {
        assetId,
        amount,
        source: {
          type: TransferPeerPathType.VaultAccount,
          id: String(vaultAccountId),
        },
        destination:
          type === 'external'
            ? {
                type: TransferPeerPathType.OneTimeAddress,
                oneTimeAddress: {
                  address: withdrawalAddress,
                },
              }
            : {
                type: TransferPeerPathType.VaultAccount,
                id: withdrawalAddress,
              },
      };
      const result = await this.fireblocksInstanceSigner.transactions.estimateTransactionFee({
        transactionRequest: payload,
      });
      return result?.data;
    } catch (error) {
      console.error('Error during transaction', { error });
      throw error;
    }
  }

  async processVaultAccountWithdraw(vaultAccountId: string, withdrawalDetails: IwithdrawalDetails) {
    try {
      const { amount, withdrawalAddress, assetId, type } = withdrawalDetails;

      const payload = {
        assetId,
        amount,
        source: {
          type: TransferPeerPathType.VaultAccount,
          id: String(vaultAccountId),
        },
        destination:
          type === 'external'
            ? {
                type: TransferPeerPathType.OneTimeAddress,
                oneTimeAddress: {
                  address: withdrawalAddress,
                },
              }
            : {
                type: TransferPeerPathType.VaultAccount,
                id: withdrawalAddress,
              },
      };
      const result = await this.fireblocksInstanceSigner.transactions.createTransaction({
        transactionRequest: payload,
      });

      if (result?.data?.id) {
        return await this.getTransactionById(result?.data?.id);
      }
      console.log(JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('Error during transaction', { error });
      throw error;
    }
  }

  async getTransactionById(
    transactionId: string
  ): Promise<FireblocksResponse<TransactionResponse>> {
    try {
      const process = await this.fireblocksInstanceViewer.transactions.getTransaction({
        txId: transactionId,
      });
      return process?.data;
    } catch (error) {
      console.log('Error during Transaction fetch');

      throw error;
    }
  }

  async getCustomerTransactions(
    vaultAccountId: string,
    limit: number,
    before?: number,
    after?: number
  ) {
    try {
      const fetchLimit = limit * 2; // Fetch extra transactions to ensure enough data

      const retrieveReceivedTransactions =
        await this.fireblocksInstanceViewer.transactions.getTransactions({
          destType: TransferPeerPathType.VaultAccount,
          destId: vaultAccountId,
          limit: fetchLimit || 56,
          before, // Optional parameter for pagination
          after, // Optional parameter for pagination,
          orderBy: 'createdAt',
          sort: 'DESC',
        });
      const retrieveSentTransactions =
        await this.fireblocksInstanceViewer.transactions.getTransactions({
          sourceId: vaultAccountId,
          sourceType: TransferPeerPathType.VaultAccount,
          limit: fetchLimit || 56,
          before, // Optional parameter for pagination
          after, // Optional parameter for pagination,
          orderBy: 'createdAt',
          sort: 'DESC',
        });

      // Combine, sort, and limit the transactions
      const combinedTransactions = [
        ...retrieveReceivedTransactions.data,
        ...retrieveSentTransactions.data,
      ];

      // TO avoid duplications
      const uniqueTransactionsMap = new Map();
      combinedTransactions.forEach((tx) => uniqueTransactionsMap.set(tx.id, tx));
      const uniqueTransactions = Array.from(uniqueTransactionsMap.values());

      // Sort by createdAt descending
      uniqueTransactions.sort((a, b) => b.createdAt - a.createdAt);

      const transactions = uniqueTransactions.slice(0, limit || 56);

      return {
        transactions,
        nextBeforeTimestamp: transactions.length
          ? transactions[transactions.length - 1].createdAt
          : null,
        nextAfterTimestamp: transactions.length
          ? transactions[transactions.length - 1].createdAt
          : null,
      };
    } catch (error) {
      console.log('Erro During Fetching User Transactions');
      throw error;
    }
  }

  async triggerEmailNotification(body: any) {
    try {
      const destination = body?.data?.destination;
      const source = body?.data?.source;

      // Source is External, then it is a Deposit Transaction
      if (source.name === 'External') {
        const findUserByVaultId = await this.userService.findUserByFireblocksId(destination?.id);

        if (findUserByVaultId.id) {
          this.eventEmitter.emit('fireblocks.depositted', body, findUserByVaultId.email);
        }
      } else {
        // If Source Name is not External, it means that this is Withdrawal transaction;
        const findUserByVaultId = await this.userService.findUserByFireblocksId(source?.id);
        if (findUserByVaultId.id) {
          this.eventEmitter.emit('fireblocks.withdrawed', body, findUserByVaultId.email);
        }
      }
    } catch (error) {
      console.error('Error During Fireblocks Notification');
      throw error;
    }
  }

  async manualUpdateVaultAccountAssetBalance(
    vaultAccountId: string,
    assetId: string,
    idempotencyKey: string
  ): Promise<FireblocksResponse<VaultAsset>> {
    try {
      const updateAsset = this.fireblocksInstanceSigner.vaults.updateVaultAccountAssetBalance({
        vaultAccountId,
        assetId,
        idempotencyKey,
      });
      return updateAsset?.data || null;
    } catch (error) {
      console.error('Error During manually updating asset details', { error });

      throw error;
    }
  }
}

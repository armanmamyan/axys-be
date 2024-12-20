import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ICardBalanceSP35,
  ICardTransaction,
  ICardViewDetailsResponse,
  IKycNewDocRequest,
  INewCardholder,
  INewCardResponse,
  INewTransRsp,
  IViewCardholder,
  IViewWallet,
} from './types';

// TODO Date Type might require revision based on 3rd party requirements

@Injectable()
export class VisaService {
  private readonly logger = new Logger(VisaService.name);
  VISA_API_URL;
  VISA_API_KEY;
  VISA_MASTER_ACCOUNT;
  VISA_MASTER_WALLET;
  constructor(private configService: ConfigService) {
    this.VISA_API_URL = configService.get<string>('VISA_API_URL');
    this.VISA_API_KEY = configService.get<string>('VISA_API_KEY');
    this.VISA_MASTER_ACCOUNT = configService.get<string>('VISA_MASTER_ACCOUNT');
    this.VISA_MASTER_WALLET = configService.get<string>('VISA_MASTER_WALLET');
  }

  /**
   * A generic request factory method that can handle all HTTP methods.
   *
   * @param method - The HTTP method (e.g., 'GET', 'POST', 'PUT', 'DELETE', ...)
   * @param route - The API route (relative to VISA_API_URL)
   * @param body - Optional body for POST/PUT requests
   * @returns A Promise resolving with the parsed JSON response (if any)
   */
  async #requestFactory<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    route: string,
    body?: any
  ): Promise<T> {
    const url = `${this.VISA_API_URL}/${route}`;
    const headers: Record<string, string> = {
      'X-API-KEY': this.VISA_API_KEY,
    };

    // For POST and PUT, we generally send JSON
    if (method === 'POST' || method === 'PUT') {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new InternalServerErrorException(
        `${method} ${url} failed with status ${response.status}: ${errorText}`
      );
    }

    // Some requests might return no content (e.g., DELETE).
    // Try to parse JSON if there's a response body.
    try {
      return (await response.json()) as T;
    } catch {
      // If no JSON returned, return something empty or null.
      return null as T;
    }
  }

  /**
   * Wrapper methods (optional for convenience):
   */
  #getRequest<T = any>(route: string): Promise<T> {
    return this.#requestFactory<T>('GET', route);
  }

  #postRequest<T = any>(route: string, body: unknown): Promise<T> {
    return this.#requestFactory<T>('POST', route, body);
  }

  #putRequest<T = any>(route: string, body: unknown): Promise<T> {
    return this.#requestFactory<T>('PUT', route, body);
  }

  #deleteRequest<T = any>(route: string): Promise<T> {
    return this.#requestFactory<T>('DELETE', route);
  }

  /**
   * Create a new cardholder with physical card.
   *
   * @param accountId - The account ID as per the route specification.
   * @param walletId - The wallet ID as per the route specification.
   * @param cardHolderData - The cardholder data to be sent in the request body.
   * @returns A promise resolving to the created cardholder response.
   */
  async createCardHolder<T = any>(
    accountId: string,
    walletId: string,
    cardHolderData: INewCardholder
  ): Promise<T> {
    const route = `CardHolderManagement/CardHolder_CreateNew/${accountId}/${walletId}`;
    return this.#postRequest<T>(route, cardHolderData);
  }

  /**
   * Update cardholder with physical card.
   *
   * @param accountId - The account ID as per the route specification.
   * @param walletId - The wallet ID as per the route specification.
   * @param cardHolderId - The wallet ID as per the route specification.
   * @param cardHolderData - The cardholder data to be sent in the request body.
   * @returns A promise resolving to the created cardholder response.
   */
  async udpatePhysicalCardHolder<T = any>(
    accountId: string,
    walletId: string,
    cardHolderId: string,
    cardHolderData: INewCardholder
  ): Promise<T> {
    const route = `CardHolderManagement/CardHolder_CreateNew/${accountId}/${walletId}/${cardHolderId}`;
    return this.#putRequest<T>(route, cardHolderData);
  }

  /**
   * View a cardholder's details. Actual for physical card.
   *
   * @param accountId - The Account ID from the API path parameter.
   * @param cardholderId - The Cardholder ID from the API path parameter.
   * @returns A Promise resolving to a typed `ViewCardholder` response.
   */
  async viewPhysicalCardHolder(accountId: string, cardholderId: string): Promise<IViewCardholder> {
    const route = `api/sp35/CardHolderManagement/CardHolder_View/${accountId}/${cardholderId}`;
    return this.#getRequest<IViewCardholder>(route);
  }

  /**
   * Add a KYC document for a cardholder.
   *
   * NOTE: A cardholder can only have 1 of each DocType.
   * To add a new KYC doc of the same type, you must delete the old one first.
   *
   * According to Service Provider 31 Requirements:
   * You need to add:
   * 1) Selfie of the cardholder (DocType=0)
   * 2) Driver's license (DocType=2) or Passport (DocType=1)
   * 3) Proof of address (DocType=3)
   *
   * @param accountId - The Account ID for the request
   * @param cardholderId - The Cardholder ID for whom the document is being added
   * @param docData - The KYC document details to be added
   */
  async addKycDoc<T = any>(
    accountId: string,
    cardholderId: string,
    docData: IKycNewDocRequest
  ): Promise<T> {
    const route = `api/sp35/CardHolderManagement/CardHolder_KycDoc_Add/${accountId}/${cardholderId}`;
    return this.#postRequest<T>(route, docData);
  }

  /**
   * Submit a Card Holder for Review
   *
   * @param accountId - The Account ID
   * @param cardholderId - The Cardholder ID
   */
  async submitForReview<T = any>(accountId: string, cardholderId: string): Promise<T> {
    const route = `api/sp35/CardHolderManagement/CardHolder_SubmitForReview/${accountId}/${cardholderId}`;
    return this.#putRequest<T>(route, {});
  }

  /**
   * Delete KYC documents from a cardholder.
   * If the endpoint needs docType or other parameters, adjust the route.
   */
  async deleteKycDocs<T = any>(accountId: string, cardholderId: string): Promise<T> {
    const route = `api/sp35/CardHolderManagement/CardHolder_KycDoc_Delete/${accountId}/${cardholderId}`;
    return this.#deleteRequest<T>(route);
  }

  /**
   * Create a new card for cardholder.
   *
   * @param accountId - The account ID as per the route specification.
   * @param walletId - The wallet ID as per the route specification.
   * @param cardHolderId - The cardholder ID as per the route specification.
   * @returns A promise resolving to the created cardholder response.
   */
  async createNewCard<T>(
    accountId: string,
    walletId: string,
    cardHolderId: string
  ): Promise<INewCardResponse> {
    const route = `api/sp35/ServiceProvider_35/CreateNewCard/${accountId}/${walletId}/${cardHolderId}`;
    return this.#postRequest<INewCardResponse>(route, {});
  }

  /**
   * Create a new card for cardholder.
   *
   * @param accountId - The account ID as per the route specification.
   * @param walletId - The wallet ID as per the route specification.
   * @param cardHolderId - The cardholder ID as per the route specification.
   * @returns A promise resolving to the created cardholder response.
   *
   * Based on last conversation with Matt, CreateNewCard_Reloadable is responsible for digital card creation
   */
  async createNewCardReloadable<T>(
    accountId: string,
    walletId: string,
    cardHolderId: string
  ): Promise<INewCardResponse> {
    const route = `api/sp35/ServiceProvider_35/CreateNewCard_Reloadable/${accountId}/${walletId}/${cardHolderId}`;
    return this.#postRequest<INewCardResponse>(route, {});
  }

  /**
   * View detailed card information associated with a given Account, Wallet, and Card ID.
   * @param accountId - The unique identifier of the account.
   * @param walletId - The unique identifier of the wallet.
   * @param cardId - The unique identifier of the card.
   * @returns An object containing card details such as cardNumber, expMonth, expYear, and cvv.
   */
  async viewCardDetails<T = ICardViewDetailsResponse>(
    accountId: string,
    walletId: string,
    cardId: string
  ): Promise<T> {
    const route = `api/sp35/ServiceProvider_35/ViewCardDetails/${accountId}/${walletId}/${cardId}`;
    return this.#getRequest<T>(route);
  }

  /**
   * Change the spending limit of a specific card.
   * Note: This will overwrite the previous limit.
   *
   * SpendLimit is expected as a decimal implied value, e.g.,
   * to set $10.00 as the new limit, pass 1000.
   *
   * @param accountId - The account ID associated with the card.
   * @param walletId - The wallet ID associated with the card.
   * @param cardId - The unique identifier of the card.
   * @param spendLimit - The new spend limit as a decimal implied integer.
   * @returns A Promise resolving to the API response.
   */
  async changeCardSpendLimit<T = any>(
    accountId: string,
    walletId: string,
    cardId: string,
    spendLimit: number
  ): Promise<T> {
    const route = `api/sp35/ServiceProvider_35/ChangeCardSpendLimit/${accountId}/${walletId}/${cardId}`;
    const body = { spendLimit };
    return this.#putRequest<T>(route, body);
  }

  /**
   * Retrieves transactions associated with a specific Card.
   * @param accountId - The account ID.
   * @param walletId - The wallet ID.
   * @param cardHolderId - The cardholder ID.
   * @param cardId - The card ID.
   * @returns An array of `CardTransaction` objects.
   */
  async viewCardTransactions(
    accountId: string,
    walletId: string,
    cardHolderId: string,
    cardId: string
  ): Promise<ICardTransaction[]> {
    const route = `api/sp35/ServiceProvider_35/ViewCardTransactions/${accountId}/${walletId}/${cardHolderId}/${cardId}`;
    return this.#getRequest<ICardTransaction[]>(route);
  }

  /**
   * Load the specified card with a given amount.
   *
   * The `AmountToLoad` field is a decimal implied value. For example,
   * to load $10.00, pass 1000.
   *
   * If the response is "Could not get the results",
   * you may need to use `ViewLoadUnloadTransStatus` to retrieve the final status.
   *
   * @param accountId - The unique identifier of the account.
   * @param walletId - The unique identifier of the wallet.
   * @param cardHolderId - The unique identifier of the cardholder.
   * @param cardId - The unique identifier of the card.
   * @param amountToLoad - Decimal implied amount (e.g., 1000 for $10.00).
   * @returns A Promise resolving to the API response.
   */
  async loadCard<T = any>(
    accountId: string,
    walletId: string,
    cardHolderId: string,
    cardId: string,
    amountToLoad: number
  ): Promise<T> {
    const route = `api/sp35/ServiceProvider_35/LoadCard/${accountId}/${walletId}/${cardHolderId}/${cardId}`;
    const body = { AmountToLoad: amountToLoad };
    return this.#postRequest<T>(route, body);
  }

  /**
   * Unload the specified card with a given amount.
   *
   * The `AmountToLoad` field is a decimal implied value. For example,
   * to load $10.00, pass 1000.
   *
   * If the response is "Could not get the results",
   * you may need to use `ViewLoadUnloadTransStatus` to retrieve the final status.
   *
   * @param accountId - The unique identifier of the account.
   * @param walletId - The unique identifier of the wallet.
   * @param cardHolderId - The unique identifier of the cardholder.
   * @param cardId - The unique identifier of the card.
   * @param amountToLoad - Decimal implied amount (e.g., 1000 for $10.00).
   * @returns A Promise resolving to the API response.
   */
  async unloadCard<T = any>(
    accountId: string,
    walletId: string,
    cardHolderId: string,
    cardId: string,
    amountToUnload: number
  ): Promise<T> {
    const route = `api/sp35/ServiceProvider_35/LoadCard/${accountId}/${walletId}/${cardHolderId}/${cardId}`;
    const body = { AmountToUnload: amountToUnload };
    return this.#postRequest<T>(route, body);
  }

  /**
   * Retrieve the current card balance details.
   *
   * The returned object includes:
   * - availableBalance: The current available balance on the card.
   * - spendBalance: The spendable balance portion.
   * - pendingBalance: The amount currently pending.
   * - balanceLastCheck: A string (timestamp or date) indicating when the balance was last checked.
   *
   * @param accountId - The unique identifier for the account.
   * @param walletId - The unique identifier for the wallet.
   * @param cardHolderId - The unique identifier for the cardholder.
   * @param cardId - The unique identifier for the card.
   * @returns A Promise resolving to the card balance details.
   */
  async viewCardBalance(
    accountId: string,
    walletId: string,
    cardHolderId: string,
    cardId: string
  ): Promise<ICardBalanceSP35> {
    const route = `api/sp35/ServiceProvider_35/ViewCardBalance/${accountId}/${walletId}/${cardHolderId}/${cardId}`;
    return this.#getRequest<ICardBalanceSP35>(route);
  }

  /**
   * Creates a new cardholder, adds KYC documents, submits them for review,
   * and finally creates a card for that cardholder.
   *
   * @param accountId - The master account ID.
   * @param walletId - The master wallet ID.
   * @param cardholderData - Data used to create the cardholder.
   * @param kycDocs - An array of KYC document details to attach to the cardholder.
   *
   * @returns The response from the card creation step.
   *
   * Throws errors if any step fails.
   */

  async createCardholderWithCard(
    accountId: string,
    walletId: string,
    cardholderData: INewCardholder,
    kycDocs: IKycNewDocRequest[]
  ): Promise<any> {
    this.logger.log('Starting process: createCardholderWithCard');

    try {
      // 1. Create the cardholder
      this.logger.log('Creating cardholder...');
      const createdCardholder = await this.createCardHolder(accountId, walletId, cardholderData);
      if (!createdCardholder || !createdCardholder.cardHolderId) {
        this.logger.error('Failed to create cardholder or cardHolderId not returned.');
        throw new Error('Cardholder creation failed: cardHolderId missing');
      }
      const { cardHolderId } = createdCardholder;
      this.logger.log(`Cardholder created with ID: ${cardHolderId}`);

      // 2. Add KYC documents
      for (const doc of kycDocs) {
        this.logger.log(`Adding KYC doc of type ${doc.docType} for cardholder ${cardHolderId}...`);
        await this.addKycDoc(accountId, cardHolderId, doc);
        this.logger.log(`KYC doc ${doc.docType} added successfully.`);
      }

      // 3. Submit KYC for review
      this.logger.log(`Submitting KYC for cardholder ${cardHolderId}...`);
      const reviewResponse = await this.submitForReview(accountId, cardHolderId);
      this.logger.log(`KYC submitted for review. Response: ${JSON.stringify(reviewResponse)}`);

      // TODO: we might want to check if the reviewResponse indicates success
      // For simplicity, assume success if no error thrown.

      // 4. Create the card
      this.logger.log(`Creating new card for cardholder ${cardHolderId}...`);
      const newCardResponse = await this.createNewCard(accountId, walletId, cardHolderId);

      this.logger.log(`Card created successfully: ${JSON.stringify(newCardResponse)}`);
      return newCardResponse;
    } catch (error) {
      this.logger.error(`Error in createCardholderWithCard: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieve the detailed view of a wallet, including balance, services, and subWallets.
   *
   * @param accountId - The unique identifier for the account.
   * @param walletId - The unique identifier for the wallet.
   * @returns A Promise resolving to a `ViewWallet` object containing wallet details.
   */
  async viewWallet(accountId: string, walletId: string): Promise<IViewWallet> {
    const route = `api/sp35/WalletManagement/Wallet_View/${accountId}/${walletId}`;

    try {
      const walletDetails = await this.#getRequest<IViewWallet>(route);

      if (!walletDetails || walletDetails.walletId === undefined) {
        this.logger.error(
          `Failed to retrieve wallet details for WalletId=${walletId}. Response is empty or invalid.`
        );
        throw new InternalServerErrorException('Invalid response received for wallet details.');
      }

      return walletDetails;
    } catch (error) {
      throw error;
    }
  }

  /**
   * View the transfer status for a given transaction.
   *
   * @param accountId - The ID of the account.
   * @param walletId - The ID of the wallet related to the transaction.
   * @param transId - The transaction ID whose status we want to retrieve.
   * @returns A Promise resolving to a `NewTransRsp` object with transaction details.
   */
  async viewTransferStatus(
    accountId: string,
    walletId: string,
    transId: string
  ): Promise<INewTransRsp> {
    this.logger.log(`Fetching transfer status for TransId=${transId}`);
    const route = `api/sp35/WalletManagement/ViewTransferStatus/${accountId}/${walletId}/${transId}`;
    const response = await this.#getRequest<INewTransRsp>(route);

    if (!response || response.transId === undefined) {
      this.logger.error(`No valid response retrieved for TransId=${transId}`);
      throw new InternalServerErrorException('Invalid response for transfer status.');
    }

    this.logger.log(`Retrieved transfer status for TransId=${transId}`);
    return response;
  }

  /**
   * Transfer funds from one wallet to another.
   *
   * `Amount` is a decimal implied value. For example,
   * if you want to transfer $10.00, send 1000 for Amount.
   *
   * If the response is "Could not get the results,"
   * you can use `viewTransferStatus` to retrieve the final result.
   *
   * @param accountId - The master account ID.
   * @param sourceWalletId - The wallet ID from which funds will be transferred out.
   * @param destinationWalletId - The wallet ID receiving the funds.
   * @param amount - Decimal implied amount to transfer (e.g., 1000 for $10.00).
   * @param description - An optional description for the transfer.
   * @returns A Promise resolving to `NewTransRsp`.
   */
  async walletTransfer(
    accountId: string,
    sourceWalletId: string,
    destinationWalletId: string,
    amount: number,
    description?: string
  ): Promise<INewTransRsp> {
    this.logger.log(
      `Initiating wallet transfer: AccountId=${accountId}, SourceWalletId=${sourceWalletId}, DestinationWalletId=${destinationWalletId}, Amount=${amount}`
    );

    const route = `api/sp35/WalletManagement/Wallet_Transfer/${accountId}/${sourceWalletId}/${destinationWalletId}`;

    // Body parameters instead of query parameters
    const body: Record<string, any> = { Amount: amount };
    if (description) {
      body.Description = description;
    }

    const response = await this.#postRequest<INewTransRsp>(route, body);

    if (!response) {
      this.logger.error('Wallet transfer returned no response.');
      throw new InternalServerErrorException('No response received from wallet transfer endpoint.');
    }

    // Check if we need to retrieve the status separately
    if (response.errorMessage && response.errorMessage.includes('Could not get the results')) {
      this.logger.warn(
        'Transfer response indicated "Could not get the results". Fetching status using viewTransferStatus...'
      );
      //  TODO
      // Use destinationWalletId (or sourceWalletId if required by the API) to get the status
      return this.viewTransferStatus(accountId, destinationWalletId, response.transId.toString());
    }

    this.logger.log(`Wallet transfer completed successfully with TransId=${response.transId}`);
    return response;
  }
}

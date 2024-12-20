export enum KycOccupation {
  Politicians = 1,
  Civil_servants = 2,
  Gas_station_owners = 3,
  Retail_business_owners = 4,
  Car_Dealerships = 5,
  Travel_Agencies = 6,
  Investment_Brokers = 7,
  Jewelry_dealers = 8,
  Lawyers = 9,
  Accountants = 10,
  Other = 11,
  Financial_Services = 12,
  Hospitality = 13,
  Banker = 14,
  Information_Technology_Financial_Services = 15,
  Entrepreneur = 16,
  Plumber = 17,
  Graphic_designer = 18,
  Photographer = 19,
  Journalist = 20,
  Brand_manager = 21,
  Event_planner = 22,
  Auto_mechanic = 23,
  Landscaper = 24,
  Groundskeeper = 25,
  Fisherman = 26,
}

export enum CardHolderGender {
  Male = 0,
  Female = 1,
  Other = 2,
}

export interface INewCardholder {
  firstName?: string;
  midName?: string;
  lastName?: string;
  gender?: CardHolderGender;
  dob?: string;
  adrLine1?: string;
  adrLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  phoneNum?: string;
  cellNum?: string;
  callingCode?: string;
  countryCallingCode?: string;
  emailAdr?: string;
  occupation?: KycOccupation;
  nationality?: string;
  placeOfBirth?: string;
  cardHolderFirstname?: string;
  cardHolderLastName?: string;
  employeeID?: string;
  sP32_IdNumber?: string;
}

export enum CardholderStatus {
  Pending = 0,
  Approved = 1,
  Declined = 2,
  In_Review = 3,
  Draft = 4,
  Deleted = 5,
  Error = 6,
}

export enum KycDocStatus {
  Draft = 0,
  Pending = 1,
  Approved = 2,
  Declined = 3,
  Error = 4,
}

export enum CardholderDocType {
  selfie = 0,
  passport = 1,
  dl = 2,
  other = 3,
}

export enum KycDocExt {
  PNG = 0,
  JPG = 1,
  PDF = 2,
}

export interface ICardholderContact {
  firstName?: string;
  midName?: string;
  lastName?: string;
  gender?: CardHolderGender;
  dob?: string;
  nationality?: string;
  adrLine1?: string;
  adrLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  phoneNum?: string;
  cellNum?: string;
  callingCode?: string;
  countryCallingCode?: string;
  emailAdr?: string;
  occupation?: KycOccupation;
  placeOfBirth?: string;
  cardHolderFirstname?: string;
  cardHolderLastName?: string;
  employeeID?: string;
}

export interface ICardholderDocs {
  kycDocID: number;
  status: KycDocStatus;
  docType: CardholderDocType;
  lang?: string;
  number?: string;
  issueBy?: string;
  issuerDate?: string;
  expireDate?: string;
  image_FrontExt?: KycDocExt;
  image_BackExt?: KycDocExt;
}

export interface IViewCardholder {
  cardHolderId: number;
  status: CardholderStatus;
  msg?: string;
  contact?: ICardholderContact;
  kycDocs?: ICardholderDocs[];
  walletId?: number;
  sysRes1?: string;
  sysRes2?: string;
  sysRes3?: string;
  sysRes4?: string;
  sysRes5?: string;
}

export interface IKycNewDocRequest {
  docType: CardholderDocType; // selfie=0, passport=1, dl=2, other=3
  language?: string;          // e.g., 'EN'
  docNumber?: string;
  issuedBy?: string;
  issueDate?: string;         // Format: YYYY-MM-DD
  expireDate?: string;        // Format: YYYY-MM-DD
  imageFront?: string;        // base64 encoded image
  imageFrontExt?: KycDocExt;  // PNG=0, JPG=1, PDF=2
  imageBack?: string;         // base64 encoded image
  imageBackExt?: KycDocExt;   // PNG=0, JPG=1, PDF=2
}

export interface INewCardResponse {
  cardId: string;
  maskedCardNumber: string;
}

export interface ICardViewDetailsResponse {
  cardNumber?: string | null;
  expMonth?: string | null;
  expYear?: string | null;
  cvv?: string | null;
}


export enum TransactionTypes {
  Authorization = 1,
  Authorization_Advice = 2,
  Authorization_Clearing = 3,
  Authorization_Clearing_Chargeback = 4,
  Authorization_Clearing_Chargeback_Completed = 5,
  Authorization_Clearing_Chargeback_Provisional_Credit = 6,
  Authorization_Clearing_Chargeback_Provisional_Debit = 7,
  Authorization_Clearing_Chargeback_Reversal = 8,
  Authorization_Clearing_Chargeback_Writeoff = 9,
  Authorization_Clearing_Representment = 10,
  Authorization_Incremental = 11,
  Authorization_Reversal = 12,
  Authorization_Reversal_Issuer_Expiration = 13,
  Authorization_Stand_in = 14,
  Fee_Charge = 15,
  Fee_Charge_Pending = 16,
  Fee_Charge_Reversal = 17,
  GPA_Credit = 18,
  GPA_Credit_Authorization = 19,
  GPA_Credit_Authorization_Reversal = 20,
  GPA_Credit_Issuer_Operator = 21,
  GPA_Credit_Network_Load = 22,
  GPA_Credit_Network_Load_Reversal = 23,
  GPA_Credit_Pending = 24,
  GPA_Credit_Pending_Reversal = 25,
  GPA_Credit_Reversal = 26,
  GPA_Debit = 27,
  GPA_Debit_Issuer_Operator = 28,
  GPA_Debit_Reversal = 29,
  MSA_Credit = 30,
  MSA_Credit_Pending = 31,
  MSA_Credit_Pending_Reversal = 32,
  MSA_Credit_Reversal = 33,
  MSA_Debit = 34,
  PIN_Debit = 35,
  PIN_Debit_ATM_Withdrawal = 36,
  PIN_Debit_Authorization = 37,
  PIN_Debit_Authorization_Clearing = 38,
  PIN_Debit_Authorization_Reversal_Issuer_Expiration = 39,
  PIN_Debit_Balance_Inquiry = 40,
  PIN_Debit_Cashback = 41,
  PIN_Debit_Chargeback = 42,
  PIN_Debit_Chargeback_Completed = 43,
  PIN_Debit_Chargeback_Provisional_Credit = 44,
  PIN_Debit_Chargeback_Provisional_Debit = 45,
  PIN_Debit_Chargeback_Reversal = 46,
  PIN_Debit_Chargeback_Writeoff = 47,
  PIN_Debit_Refund = 48,
  PIN_Debit_Refund_Reversal = 49,
  PIN_Debit_Reversal = 50,
  PIN_Debit_Transfer = 51,
  Program_Reserve_Credit = 52,
  Program_Reserve_Debit = 53,
  Refund = 54,
  Token_Activation_Request = 55,
  Token_Advice = 56,
  Transaction_Unknown = 57,
  Transfer_Peer = 58,
  Transfer_Program = 59,
  Activate_Account = 60,
  Adjustment_Advice = 61,
  Balance_Adjustment = 62,
  Balance_Reversal = 63,
  Clear_Negative_Balance = 64,
  Close_Account = 65,
  Create_Account = 66,
  Create_Purse = 67,
  Credit_Adjustment = 68,
  Embossing_Pending = 69,
  Foreign_Exchange_Fee = 70,
  Mark_Fraudulent = 71,
  Memo = 72,
  Overwrite_Card_Status = 73,
  PIN_Change = 74,
  PIN_Query = 75,
  Refund_Advice = 76,
  Authorization_Declined = 77,
  Remove_Fraud = 78,
  Authorization_Reversal_Advice = 79,
  Card_Load = 80,
  PIN_Debit_Cash_Withdrawal = 81,
  PIN_Debit_Pre_auth = 82,
  Authorization_Expiry = 83,
  Return_Reversal = 84,
  Balance_Inquiry = 85,
}

// Enum for transaction states
export enum TransactionStates {
  Pending = 1,
  Cleared = 2,
  Completion = 3,
  Declined = 4,
  Error = 5,
}

// Interface representing a single transaction
export interface ICardTransaction {
  transID?: string | null;
  authRefNum?: string | null;
  amount?: string | null;
  description?: string | null;
  dateCreated?: string;  // ISO 8601 format (e.g., "2024-12-20T11:53:09.316Z")
  dateSettled?: string;  // ISO 8601 format
  transType: TransactionTypes;
  transStatus: TransactionStates;
  merchantName?: string | null;
  merchantCurrency?: string | null;
  merchantAmount?: string | null;
}


export interface ICardBalanceSP35 {
  availableBalance: number;
  spendBalance: number;
  pendingBalance: number;
  balanceLastCheck?: string | null;
}


export enum WalletType {
  Master = 0,
  Parent = 1,
  Sub = 2,
}

export enum CurrencyType {
  USD = 0,
  CAD = 1,
  GBP = 2,
  EUR = 3,
}


export interface IService {
  id: number;
  tyepId: number;
  nameWl?: string | null;
  nameReseller?: string | null;
  nameAccount?: string | null;
  nameCh?: string | null;
  isActive: boolean;
  isDeleted: boolean;
  cardTypeId: number;
  binTypeId: number;
  currencyId: CurrencyType;
  isTokenizable: boolean;
  serviceProviderId: number;
  sP_F1?: string | null;
  sP_F2?: string | null;
  sP_F3?: string | null;
  sP_F4?: string | null;
  sP_F5?: string | null;
}


export interface IWalletServices {
  id: number;
  service: IService;
  walletId: number;
}


export interface IViewWallet {
  walletId: number;
  dateCreated: string; // ISO date-time
  dateLastModified: string; // ISO date-time
  lastModifiedUserId: number;
  isActive: boolean;
  isDeleted: boolean;
  name?: string | null;
  walletTypeId: WalletType; 
  walletServiceProvider: number;
  walletParentWalletId?: number | null;
  walletBalanceAvailable: number;
  walletBalanceSettled: number;
  walletCurrencyId: CurrencyType;
  accountName?: string | null;
  sP_F1?: string | null;
  sP_F2?: string | null;
  sP_F3?: string | null;
  sP_F4?: string | null;
  sP_F5?: string | null;
  subWallets?: IViewWallet[] | null;
  walletServices?: IWalletServices[] | null;
}


export enum ResultCodes {
  Success = 0,
  Failure = 1,
}

export enum TransactionStatusType {
  Pending = 0,
  Approved = 1,
  Declined = 2,
  Partial = 3,
  Error = 4,
}

export interface INewTransRsp {
  errorCode: ResultCodes;      // 0 = Success, 1 = Failure
  transId: number;
  transStatus: TransactionStatusType; 
  errorMessage?: string[] | null;
}

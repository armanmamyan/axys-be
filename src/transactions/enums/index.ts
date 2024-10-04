export enum PaymentType {
  CREDIT_CARD = "Credit Card",
  CRYPTO = "Crypto",
}

export enum TransactionPurpose {
  WITHDRAW = 'Withdraw',
  DEPOSIT = 'Deposit',
  SUBSCRIPTION = 'Subscription',
  TRANSFER = 'Transfer',
}

export enum TransactionStatus {
  Pending = 'pending',
  Completed = 'completed',
  Rejected = 'rejected',
  Cancelled = 'cancelled',
}
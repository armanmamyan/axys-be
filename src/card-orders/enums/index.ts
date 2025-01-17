export enum OrderStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FAILED = 'failed',
  CONFIRMING = 'confirming',
}

export enum CardCategory {
  STANDARD = 'Standard',
  PREMIUM = 'Premium',
  NFT = 'NFT',
}

export enum StandardCardType {
  PURE_WHITE = 'Pure White',
  TITAN_SILVER = 'Titan Silver',
  REGENT_GOLD = 'Regent Gold',
}

export enum PremiumCardType {
  BLACK_PEARL = 'Black Pearl',
  ROYAL_GOLD = 'Royal Gold (24K)',
}

export enum NftCardType {
  BLACK_PEARL = 'Black Pearl',
  ROYAL_GOLD = 'Royal Gold (24K)',
  DIAMOND = 'Diamond',
  CUSTOM = 'Custom',
}

export enum PaymentPlan {
  ANNUAL = 'Annual',
  MONTHLY = 'Monthly',
}

export enum PaymentType {
  CREDIT_CARD = 'Credit Card',
  CRYPTO = 'Crypto',
}

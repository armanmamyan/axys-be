
export enum TransferType {
    'external' = 'external',
    'friend2Friend' = 'friend2Friend',
}

export interface IwithdrawalDetails {
    amount: number | string;
    withdrawalAddress: string;
    assetId: string;
    type: TransferType
}
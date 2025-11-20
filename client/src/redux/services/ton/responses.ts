export interface TransactionResponse {
  validUntil: number;
  messages: {
    address: string;
    amount: string;
    payload: string;
  }[];
}

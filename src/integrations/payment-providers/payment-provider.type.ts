export type CreatePaymentRequest = {
  payment_id: string;
  sender: string;
  receiver: string;
  currency: string;
  amount: number;
};

export type CreatePaymentResponse = {
  status: string;
  payment_id: string;
  currency: string;
  amount: number;
};

export type QueryPaymentStatusResponse = {
  payment_id: string;
  status: string;
};

import { CreatePaymentRequest, CreatePaymentResponse, QueryPaymentStatusResponse } from "./payment-provider.type"

export interface PaymentProviderInterface {
    create(createPaymentRequest: CreatePaymentRequest): Promise<CreatePaymentResponse> 
    queryStatus(paymentId: string): Promise<QueryPaymentStatusResponse> 
}
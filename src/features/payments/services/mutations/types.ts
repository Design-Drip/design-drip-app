export interface ISetDefaultPaymentMethodPayload {
  paymentMethodId: string;
}

export interface IAttachPaymentMethodPayload {
  paymentMethodId: string;
  setAsDefault?: boolean;
}

export interface IDeletePaymentMethodPayload {
  paymentMethodId: string;
}

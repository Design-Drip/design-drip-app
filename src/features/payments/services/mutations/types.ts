import { OrderAddress } from "@/types/address";

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

export interface IProcessCheckoutPayload {
  paymentMethodId?: string;
  savePaymentMethod?: boolean;
  paymentIntent?: string;
  itemIds?: string[];
  return_url?: string;
  shipping?: OrderAddress;
}

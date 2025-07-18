export type OrderAddress = {
  name: string;
  phone?: string;
  address: {
    city: string;
    country: string;
    line1: string;
    line2?: string;
    postal_code: string;
    state: string;
  };
};

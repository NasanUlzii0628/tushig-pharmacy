import type { Nullish } from "./global";
import type { RegistrationType } from "./registration-form";

export type InvoiceType = {
  id: number;
  amount: number;
  invoiceId: string;
  tranResp: string;
  tranDesc: string;
  form: Nullish<RegistrationType>;
  card: Nullish<{
    cardNumber: string;
    embossName: string;
    creditLimit: number;
    product: {
      code: string;
      name: string;
      cardColor: string;
    };
    user: {
      phone: Nullish<string>;
    };
  }>;
  createdDate: string;
  paidDate: string;
  invoiceStatus: string;
  invoiceType: string;
  action: string;
};

export type TicketStatus = "approved" | "pending" | "rejected";

export type TruckType = "Internal" | "Marketer" | "Industrial";

export type Product = "PMS" | "AGO" | "DPK";

export interface LoadingTicket {
  id: string;
  customer: string;
  truckType: TruckType;
  truckNumber: string;
  product: Product;
  /** Quantity in litres. */
  quantity: number;
  destination: string;
  status: TicketStatus;
}

/** A single bar in the per-marketer charts. */
export interface MarketerDatum {
  marketer: string;
  value: number;
}

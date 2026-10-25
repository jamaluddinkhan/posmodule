export type OrderLine = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  number: string;
  customer: string;
  table: string;
  createdAt: string;
  status: "New" | "Preparing" | "Ready" | "Completed" | "Cancelled";
  paymentStatus: "Paid" | "Pending" | "Refunded";
  total: number;
  items: OrderLine[];
};

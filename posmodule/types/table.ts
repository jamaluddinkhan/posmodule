export type RestaurantTable = {
  id: string;
  name: string;
  branch: string;
  capacity: number;
  status: "Available" | "Occupied" | "Reserved" | "Inactive";
  qrCode?: string;
};

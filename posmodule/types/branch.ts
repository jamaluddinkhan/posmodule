export type Branch = {
  id: string;
  code: string;
  name: string;
  restaurantId: string;
  country?: string;
  state?: string;
  address: string;
  city: string;
  contact: string;
  status: "active" | "inactive";
  websiteUrl?: string;
};

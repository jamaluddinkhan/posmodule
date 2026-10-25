export type Restaurant = {
  id: string;
  code: string;
  name: string;
  city: string;
  branches: number;
  status: "active" | "inactive";
  registeredOn: string;
  websiteUrl?: string;
};

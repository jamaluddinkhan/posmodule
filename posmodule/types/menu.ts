export type MenuCategory = {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
};

export type MenuItem = {
  id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  status: "active" | "inactive";
  isVegetarian: boolean;
};

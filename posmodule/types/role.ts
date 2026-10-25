import type { StaffType } from "@/types/auth";

export type Permission = {
  module: string;
  subModule: string;
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
};

export type Role = {
  id: string;
  name: string;
  description?: string;
  staffType: StaffType;
  reportsTo?: string;
  permissions: Permission[];
};

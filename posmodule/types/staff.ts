import type { StaffType } from "@/types/auth";

export type StaffMember = {
  id: string;
  code?: string;
  name: string;
  email: string;
  contact?: string;
  staffType: StaffType;
  role: string;
  branchId?: string;
  status: "Active" | "Inactive" | "active" | "inactive";
};

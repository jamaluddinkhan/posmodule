export type StaffType = "POS Staff" | "User Staff";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  staffType: StaffType;
};

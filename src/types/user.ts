import type { Product } from "./product";
import type { Role } from "./role";

export type User = {
  id: string;
  username: string;
  name: string;
  role: Role;
};

export type Admin = User & {
  createdBy: string;
  modifiedBy: string;
  createdDate: string;
  modifiedDate: string;
  products: Product[];
  enabled: boolean;
  accountNonExpired: boolean;
  accountNonLocked: boolean;
};

export type AdminCreateForm = {
  username: string;
  name: string;
  roleId: number;
  products: string[];
  enabled?: boolean;
};

export type AdminUpdateForm = Required<AdminCreateForm>;

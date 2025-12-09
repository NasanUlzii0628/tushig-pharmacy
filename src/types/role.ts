import type { Nullish } from "./global";
import type { Menu } from "./menu";

export type Role = {
  id: number;
  name: string;
  permissions: Permission[];
};

export type RoleCreate = {
  name: string;
  permissions: PermissionCreate[];
};

export type RoleUpdate = {
  name: string;
  permissions: PermissionUpdate[];
};

type Permission = {
  id: number;
  authorities: string;
  menu: Menu;
  authorityCreate?: boolean;
  authorityRead?: boolean;
  authorityUpdate?: boolean;
  authorityDelete?: boolean;
  authorityApprove?: boolean;
};

type PermissionCreate = {
  authorities: string;
  menu: {
    id: Nullish<string | number>;
  };
};

type PermissionUpdate = {
  authorities: string;
  menu: {
    id: Nullish<string | number>;
  };
};

export type RoleFormValues = {
  name: string;
  permissions: PermissionFormValues[];
};

type PermissionFormValues = {
  menu: Menu;
  authorityCreate?: boolean;
  authorityRead?: boolean;
  authorityUpdate?: boolean;
  authorityDelete?: boolean;
  authorityApprove?: boolean;
};

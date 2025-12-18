import {
  PackagePlus,
  PackageSearch,
  ListOrdered,
  User,
  ShoppingBasket,
  type LucideIcon,
} from "lucide-react";
import { ROUTE_PERMISSIONS } from "@/lib/permissions";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
  allowedRoles?: string[]; // Add role restriction
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
  allowedRoles?: string[]; // Add role restriction
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    items: [
      {
        title: "Бүтээгдэхүүн",
        url: "/dashboard/default",
        icon: PackageSearch,
      },
      {
        title: "Хэрэглэгч",
        url: "/dashboard/user",
        icon: User,
        allowedRoles: ROUTE_PERMISSIONS['/dashboard/user'], // Use centralized config
      },
      {
        title: "Нийлүүлэгч",
        url: "/dashboard/supplier",
        icon: PackagePlus,
      },
      {
        title: "Захиалгын хүсэлт",
        url: "/dashboard/bucket",
        icon: ShoppingBasket,
      },
      {
        title: "Захиалга",
        url: "/dashboard/order",
        icon: ListOrdered,
      },
    ],
  },
];

// Helper function to filter menu items based on user role
export function filterMenuByRole(items: NavGroup[], userRole?: string): NavGroup[] {
  if (!userRole) return items;

  return items.map(group => ({
    ...group,
    items: group.items.filter(item => {
      // If no allowedRoles specified, show to everyone
      if (!item.allowedRoles || item.allowedRoles.length === 0) {
        return true;
      }
      // Check if user's role is in allowedRoles
      return item.allowedRoles.includes(userRole);
    }).map(item => ({
      ...item,
      // Also filter subItems if they exist
      subItems: item.subItems?.filter(subItem => {
        if (!subItem.allowedRoles || subItem.allowedRoles.length === 0) {
          return true;
        }
        return subItem.allowedRoles.includes(userRole);
      })
    }))
  })).filter(group => group.items.length > 0); // Remove empty groups
}
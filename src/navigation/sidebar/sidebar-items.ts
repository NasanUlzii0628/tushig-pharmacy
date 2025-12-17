import {
  Mail,
  PackagePlus,
  ChartBar,
  Banknote,
  PackageSearch,
  ListOrdered,
  User,
  ShoppingBasket,
  type LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
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
      // {
      //   title: "CRM",
      //   url: "/dashboard/crm",
      //   icon: ChartBar,
      // },
      // {
      //   title: "Finance",
      //   url: "/dashboard/finance",
      //   icon: Banknote,
      // },
    ],
  },
];

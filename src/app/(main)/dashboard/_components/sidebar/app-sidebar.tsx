"use client";

import Link from "next/link";

import { Settings, CircleHelp, Search, Database, ClipboardList, File, Command } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { APP_CONFIG } from "@/config/app-config";
import { sidebarItems, filterMenuByRole } from "@/navigation/sidebar/sidebar-items";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

const roleTranslations = {
  MANAGER: "Менежер",
  STAFF: "Ажилтан"
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: {
    username?: string;
    role?: string;
  } | null;
}) {

  const sidebarVariant = usePreferencesStore((s) => s.sidebarVariant);
  const sidebarCollapsible = usePreferencesStore((s) => s.sidebarCollapsible);

  // Filter menu items based on user role
  const filteredSidebarItems = filterMenuByRole(sidebarItems, user?.role);

  return (
    <Sidebar variant={sidebarVariant} collapsible={sidebarCollapsible} {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <Link prefetch={false} href="/dashboard/default">
                <Command />
                <span className="text-base font-semibold">{APP_CONFIG.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredSidebarItems} />
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          name: user?.username ?? "Unknown",
          email: roleTranslations[user?.role as keyof typeof roleTranslations] ?? user?.role ?? "No role",
          avatar: "",
        }} />
      </SidebarFooter>
    </Sidebar>
  );
}
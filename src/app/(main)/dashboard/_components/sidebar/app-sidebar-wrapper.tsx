import { getAuthUser } from "@/lib/auth-user";
import { AppSidebar } from "./app-sidebar";
import { Sidebar } from "@/components/ui/sidebar";

export async function AppSidebarWrapper(
  props: React.ComponentProps<typeof Sidebar>
) {
  const user = await getAuthUser();

  return <AppSidebar {...props} user={user} />;
}

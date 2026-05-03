'use server'

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {

  const cookieStore = await cookies();
  cookieStore.delete("tushig_pharmacy_token");
  cookieStore.delete("tushig_pharmacy_user");
  cookieStore.delete("tushig_pharmacy_user_role");

  redirect("/auth/login");
}

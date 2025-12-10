'use server'

import { cookies } from "next/headers";

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  cookieStore.delete("user");

  return true;
}

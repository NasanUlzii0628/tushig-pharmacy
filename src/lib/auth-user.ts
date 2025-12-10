import { cookies } from "next/headers";

export async function getAuthUser() {
  const cookieStore = await cookies();   // ✔ FIX HERE
  const userCookie = cookieStore.get("user")?.value;

  if (!userCookie) return null;

  try {
    return JSON.parse(userCookie);
  } catch {
    return null;
  }
}

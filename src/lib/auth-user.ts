import { cookies } from "next/headers";

export async function getAuthUser() {
  const cookieStore = await cookies();   
  const userCookie = cookieStore.get("user")?.value;

  if (!userCookie) return null;

  try {
    return JSON.parse(userCookie);
  } catch {
    return null;
  }
}

export async function getCurrentUserRole(): Promise<string | null> {
  const cookieStore = await cookies();
  const userRole = cookieStore.get("userRole")?.value;
  
  if (userRole) {
    return userRole;
  }

  const token = cookieStore.get("token")?.value;
  if (token) {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      return payload.role || null;
    } catch (error) {
      return null;
    }
  }

  return null;
}

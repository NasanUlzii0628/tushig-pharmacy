'use server'

import { cookies } from "next/headers"
import { login } from "@/services/actions/auth"  // your login service

export async function loginAction(username: string, password: string) {
  const res = await login({ username, password })

  if (!res.success || !res.data) {
    return res
  }

  const { accessToken } = res.data;

  // Save token in HTTP-only cookie
  (await
        // Save token in HTTP-only cookie
        cookies()).set("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  })

  return res
}

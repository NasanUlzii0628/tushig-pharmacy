'use server'

import { cookies } from "next/headers"
import { login } from "@/services/actions/auth"

export async function loginAction(username: string, password: string) {

  const res = await login({ username, password })


  if (!res.success || !res.data) {
    return res
  }

  const token = res.data.token
  const user = res.data.user;
  const cookieStore = await cookies()
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  })
  cookieStore.set("user", JSON.stringify(user), {
  httpOnly: false,        
  secure: false,
  sameSite: "lax",
  path: "/",
});


  return res
}

'use server'

import { makeApiRequest } from "@/services/handler/request-no-auth"
import type { ActionResult } from "@/services/handler/request-no-auth"

type LoginResponse = {
  message: string;
  token: string;
  user: {
    id: number;
    username: string;
    role: string;
  };
};

export async function login({
  username,
  password,
}: {
  username: string;
  password: string;
}): Promise<ActionResult<LoginResponse>> {

  const { response, data, errorData } = await makeApiRequest<LoginResponse>(
    "/auth/login",
    "POST",
    { body: { username, password } }
  );

  const status = response.status;

  if (!response.ok) {
    return {
      success: false,
      message: errorData?.message || "Login failed",
      status,
      errorData
    };
  }

  return {
    success: true,
    message: data?.message ?? "Амжилттай нэвтэрлээ",
    status,
    data,  // 🔥 now data is included!
  };
}

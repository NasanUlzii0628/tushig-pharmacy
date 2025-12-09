import type { Nullish } from "./global";

export type SessionType = {
  id: string;
  accessToken: string;
  refreshToken: string;
  device: string;
  userAgent: string;
  fcmToken: Nullish<string>;
  createdDate: string;
  refreshedDate: string;
};

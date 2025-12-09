import type { User } from "./user";

export type Token = {
  exp: number;
  token: string;
  credentials?: TokenCredentials;
};

export type TokenCredentials = {
  user: User;
  token: string;
};

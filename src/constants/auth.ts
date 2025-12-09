export const baseHeaderOptions = {
  Accept: "application/json",
  "Accept-Language": "mn",
  "Content-Type": "application/json",
};

export const formHeaderOptions = {
  ...baseHeaderOptions,
  Authorization: `Basic ${process.env.BASIC_AUTH}`,
};

export const invalidErrorCodes = [400, 401, 403, 404, 500];

export const ERROR_MESSAGE_MAP: Record<number, string> = {
  400: "",
  401: "Дахин нэвтэрнэ үү!",
  403: "Хандах эрх хүрэхгүй байна!",
  404: "Хүсэлт амжилтгүй! (404)",
  500: "Алдаа гарлаа! (500)",
};

"use server";

import { cookies } from "next/headers";

import { baseHeaderOptions, ERROR_MESSAGE_MAP, invalidErrorCodes } from "@/constants/auth";
import logger from "@/lib/logger";
import type { Nullish } from "@/types";

type RequestPayloadType = {
  path: string;
  payload: Record<string, unknown> | FormData;
  plainRequest?: boolean;
  token?: string; // ✅ Add optional token
};

type GetParams = { 
  path: string;
  token?: string; // ✅ Add optional token
};

type ResponseType<T> = {
  success: boolean;
  message: string;
  data: Nullish<T>;
  httpStatus: number;
};

// --- SMALL HELPERS ---

const buildHeaders = (token: string) => ({
  "Content-Type": baseHeaderOptions["Content-Type"],
  Accept: baseHeaderOptions.Accept,
  Authorization: `Bearer ${token}`,
});

const handleBadRequest = async <T>(response: Response): Promise<ResponseType<T>> => {
  try {
    const errorData = await response.json();
    logger.debug(`Bad request response: ${JSON.stringify(errorData)}`);
    return {
      data: errorData ?? null,
      httpStatus: 400,
      message: errorData.message,
      success: false,
    };
  } catch {
    return {
      data: null,
      httpStatus: 400,
      message: ERROR_MESSAGE_MAP[400] || "Bad request",
      success: false,
    };
  }
};

const handleSuccess = async <T>(response: Response, plain: boolean): Promise<ResponseType<T>> => {
  const status = response.status;

  if (status === 201) {
    try {
      const data = await response.json();
      logger.debug(`201 response data: ${JSON.stringify(data)}`);
      return {
        data,
        httpStatus: status,
        message: data.message || "Амжилттай",
        success: true
      };
    } catch (error) {
      logger.debug(`201 response has no body, returning null`);
      return {
        data: null,
        httpStatus: status,
        message: "Амжилттай",
        success: true
      };
    }
  }

  if (status === 204) {
    return { data: null, httpStatus: status, message: "Амжилттай", success: true };
  }

  if (plain) {
    return { data: null, httpStatus: status, message: "", success: true };
  }

  try {
    const data = await response.json();
    return { data, httpStatus: status, message: "", success: true };
  } catch {
    return { data: null, httpStatus: status, message: "", success: true };
  }
};

const handleResponse = async <T>(response: Response, plainRequest = false): Promise<ResponseType<T>> => {
  const status = response.status;

  if (invalidErrorCodes.includes(status)) {
    if (status === 400) return handleBadRequest(response);
    return {
      data: null,
      httpStatus: status,
      message: ERROR_MESSAGE_MAP[status],
      success: false,
    };
  }

  return handleSuccess<T>(response, plainRequest);
};

// ✅ Updated to accept optional token
const getAccessToken = async (providedToken?: string): Promise<string> => {
  if (providedToken) {
    return providedToken;
  }
  
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("tushig_pharmacy_token")?.value;
  
  if (!accessToken) {
    throw new Error("Authentication required");
  }
  
  return accessToken;
};

// --- API REQUESTS ---

export const GET = async <T>({ path, token }: GetParams): Promise<ResponseType<T>> => {
  const apiUrl = process.env.API_BASE_URL;
  const accessToken = await getAccessToken(token);
  const url = `${apiUrl}${path}`;
  
  logger.info(`GET request URL: ${url}`);

  try {
    const response = await fetch(url, { 
      method: "GET", 
      headers: buildHeaders(accessToken) 
    });
    return handleResponse<T>(response);
  } catch (error) {
    logger.error(`Error in GET request: ${error}`);
    return { data: null, httpStatus: 500, message: (error as Error).message, success: false };
  }
};

export const POST = async <T>({
  path,
  payload,
  plainRequest = false,
  token,
}: RequestPayloadType): Promise<ResponseType<T>> => {
  const apiUrl = process.env.API_BASE_URL;
  const accessToken = await getAccessToken(token);
  const url = `${apiUrl}${path}`;
  
  logger.info(`POST request URL: ${url}`);

  const isFormData = payload instanceof FormData;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: isFormData
        ? { Authorization: `Bearer ${accessToken}` }
        : buildHeaders(accessToken),
      body: isFormData ? payload : JSON.stringify(payload),
    });

    return handleResponse<T>(response, plainRequest);
  } catch (error) {
    logger.error(`POST request error: ${error}`);
    return {
      data: null,
      httpStatus: 500,
      message: (error as Error).message,
      success: false,
    };
  }
};

export const PUT = async <T>({ 
  path, 
  payload, 
  plainRequest = false,
  token,
}: RequestPayloadType): Promise<ResponseType<T>> => {
  const apiUrl = process.env.API_BASE_URL;
  const accessToken = await getAccessToken(token);
  const url = `${apiUrl}${path}`;
  
  logger.info(`PUT request URL: ${url}`);

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: buildHeaders(accessToken),
      body: JSON.stringify(payload),
    });

    return handleResponse<T>(response, plainRequest);
  } catch (error) {
    logger.error(`PUT request error: ${error}`);
    return { data: null, httpStatus: 500, message: (error as Error).message, success: false };
  }
};

export const DELETE = async <T>({ path, token }: GetParams): Promise<ResponseType<T>> => {
  const apiUrl = process.env.API_BASE_URL;
  const accessToken = await getAccessToken(token);
  const url = `${apiUrl}${path}`;
  
  logger.info(`DELETE request URL: ${url}`);

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: buildHeaders(accessToken),
    });

    if (response.status === 400) {
      return handleBadRequest(response);
    }

    return handleResponse<T>(response);
  } catch (error) {
    logger.error(`DELETE request error: ${error}`);
    return { data: null, httpStatus: 500, message: (error as Error).message, success: false };
  }
};

// ✅ Keep for backward compatibility (non-cached calls)
export const validateAndGetUrl = async (path: string) => {
  const apiUrl = process.env.API_BASE_URL;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("tushig_pharmacy_token")?.value;

  if (!accessToken) throw new Error("Authentication required");

  return {
    accessToken,
    url: `${apiUrl}${path}`,
  };
};
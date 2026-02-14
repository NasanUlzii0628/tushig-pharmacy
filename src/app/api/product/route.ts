// api/product/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GET as apiGet } from "@/services/handler";
import { getQueryString } from "@/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const queryString = getQueryString(Object.fromEntries(searchParams));

  const isSearch = searchParams.has("name") || searchParams.has("supplier_id");

  // ✅ Log to see when backend is called
  console.log(`API Route called: /api/product?${queryString} | isSearch: ${isSearch}`);

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  const path = `/product/list${queryString}`;

  const result = await apiGet<{
    data: any[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>({ path, token });

  return NextResponse.json(
    {
      data: result.data?.data ?? [],
      pagination: {
        total: result.data?.pagination?.total ?? 0,
        page: result.data?.pagination?.page ?? 1,
        limit: result.data?.pagination?.limit ?? 10,
        totalPages: result.data?.pagination?.totalPages ?? 1,
      },
    },
    {
      headers: {
        "Cache-Control": isSearch
          ? "no-store"
          : "private, max-age=30, stale-while-revalidate=60",
      },
    }
  );
}
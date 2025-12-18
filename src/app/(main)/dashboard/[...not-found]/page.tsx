"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Хуудас олдсонгүй</h1>
      </div>
      <Button asChild>
        <Link href="/dashboard/default">
          Буцах
        </Link>
      </Button>
    </div>
  );
}
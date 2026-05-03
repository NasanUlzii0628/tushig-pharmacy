"use client";

import * as React from "react";
import ExcelJS from "exceljs";
import { Loader2, Upload, FileSpreadsheet, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createProductsBulk } from "@/services/actions/product";

const ACCEPTED_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];
const ACCEPTED_EXTENSIONS = [".xlsx", ".xls"];
const NAME_COLUMN_HEADER = "Барааны нэр";

const HEADER_SCAN_ROWS = 10;
const MAX_ROWS = 1500;

function getCellText(cell: ExcelJS.Cell): string {
  const value = cell.value;
  if (value === null || value === undefined) return "";
  if (typeof value === "object" && "richText" in value && Array.isArray(value.richText)) {
    return value.richText.map((part) => part.text ?? "").join("").trim();
  }
  if (typeof value === "object" && "text" in value && typeof value.text === "string") {
    return value.text.trim();
  }
  if (typeof value === "object" && "result" in value) {
    return String(value.result ?? "").trim();
  }
  return String(value).trim();
}

async function extractNamesFromExcel(file: File): Promise<string[]> {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error("Excel файлд хүснэгт олдсонгүй");
  }

  let headerRowNumber = -1;
  let nameColIndex = -1;
  const target = NAME_COLUMN_HEADER.toLowerCase();

  const lastScanRow = Math.min(worksheet.rowCount, HEADER_SCAN_ROWS);
  for (let r = 1; r <= lastScanRow; r++) {
    const row = worksheet.getRow(r);
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      if (nameColIndex !== -1) return;
      const text = getCellText(cell).toLowerCase();
      if (text === target) {
        headerRowNumber = r;
        nameColIndex = colNumber;
      }
    });
    if (nameColIndex !== -1) break;
  }

  if (nameColIndex === -1) {
    throw new Error(`"${NAME_COLUMN_HEADER}" багана олдсонгүй`);
  }

  const names: string[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= headerRowNumber) return;
    const cell = row.getCell(nameColIndex);
    const value = getCellText(cell);
    if (value) names.push(value);
  });

  return names;
}

export function BulkCreateDialog({ refresh }: { refresh: () => Promise<void> | void }) {
  const [open, setOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [names, setNames] = React.useState<string[]>([]);
  const [isParsing, setIsParsing] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const reset = () => {
    setFile(null);
    setNames([]);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    e.target.value = "";
    if (!selected) return;

    const isAccepted =
      ACCEPTED_TYPES.includes(selected.type) ||
      ACCEPTED_EXTENSIONS.some((ext) => selected.name.toLowerCase().endsWith(ext));

    if (!isAccepted) {
      toast.error("Зөвхөн Excel файл (.xlsx, .xls) сонгоно уу");
      return;
    }

    setIsParsing(true);
    try {
      const parsed = await extractNamesFromExcel(selected);
      if (parsed.length === 0) {
        toast.error(`"${NAME_COLUMN_HEADER}" баганад утга олдсонгүй`);
        setFile(null);
        setNames([]);
        return;
      }
      if (parsed.length > MAX_ROWS) {
        toast.error(`Хамгийн ихдээ ${MAX_ROWS} мөр байх ёстой (${parsed.length} мөр илгээгдсэн)`);
        setFile(null);
        setNames([]);
        return;
      }
      setFile(selected);
      setNames(parsed);
    } catch (err) {
      toast.error((err as Error).message || "Excel уншихад алдаа гарлаа");
      setFile(null);
      setNames([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = async () => {
    if (names.length === 0) return;
    if (names.length > MAX_ROWS) {
      toast.error(`Хамгийн ихдээ ${MAX_ROWS} мөр байх ёстой`);
      return;
    }
    setIsSubmitting(true);

    try {
      await toast.promise(createProductsBulk(names), {
        richColors: true,
        loading: "Бүтээгдэхүүн бүртгэж байна...",
        success: async (res) => {
          if (!res.success) {
            throw new Error(res.message || "Алдаа гарлаа");
          }
          setOpen(false);
          reset();
          await refresh();
          return `${names.length} бүтээгдэхүүн амжилттай бүртгэгдлээ`;
        },
        error: (err) => err.message || "Серверийн алдаа",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (isSubmitting) return;
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Excel-ээр бүртгэх
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Excel-ээр бөөнөөр бүртгэх</DialogTitle>
          <DialogDescription>
            Excel файлын <span className="font-medium">&quot;{NAME_COLUMN_HEADER}&quot;</span> баганаас уншиж бөөнөөр бүртгэнэ.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {!file ? (
            <label className="hover:bg-accent flex h-32 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed transition-colors">
              {isParsing ? (
                <>
                  <Loader2 className="text-muted-foreground mb-2 h-6 w-6 animate-spin" />
                  <span className="text-muted-foreground text-xs">Уншиж байна...</span>
                </>
              ) : (
                <>
                  <Upload className="text-muted-foreground mb-2 h-6 w-6" />
                  <span className="text-muted-foreground text-xs">Excel файл сонгох</span>
                  <span className="text-muted-foreground text-xs">.xlsx, .xls</span>
                </>
              )}
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFile}
                disabled={isParsing || isSubmitting}
              />
            </label>
          ) : (
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileSpreadsheet className="h-5 w-5 shrink-0" />
                <div className="overflow-hidden">
                  <div className="truncate text-sm font-medium">{file.name}</div>
                  <div className="text-muted-foreground text-xs">{names.length} бүтээгдэхүүн уншигдсан</div>
                </div>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={reset}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {names.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded-md border p-3">
              <ul className="grid gap-1 text-sm">
                {names.map((n, i) => (
                  <li key={`${n}-${i}`} className="truncate">
                    {i + 1}. {n}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              Болих
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={names.length === 0 || isSubmitting || isParsing}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Бүртгэж байна...
              </>
            ) : (
              `Бүртгэх (${names.length})`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

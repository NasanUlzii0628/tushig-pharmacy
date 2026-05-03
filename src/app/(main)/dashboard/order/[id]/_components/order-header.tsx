// src/app/(main)/dashboard/order/[id]/_components/order-header.tsx
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, Download, Loader2, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { OrderDetailTypes } from "@/types/order";

type OrderHeaderProps = {
    orderId: number;
    orderDate: string;
    orderData: OrderDetailTypes;
};

/**
 * Resize and compress an image blob to a smaller JPEG via canvas.
 * Returns a base64 string (without the data:... prefix) for Excel,
 * or with prefix for PDF, depending on `withPrefix`.
 */
async function compressImage(
    blob: Blob,
    maxSize = 400,
    quality = 0.92,
    withPrefix = false
): Promise<string> {
    const bitmap = await createImageBitmap(blob);
    const scale = Math.min(maxSize / bitmap.width, maxSize / bitmap.height, 1);
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);

    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    const outBlob = await canvas.convertToBlob({ type: "image/jpeg", quality });
    const buf = await outBlob.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const b64 = btoa(binary);
    return withPrefix ? `data:image/jpeg;base64,${b64}` : b64;
}

export function OrderHeader({ orderId, orderDate, orderData }: OrderHeaderProps) {
    const router = useRouter();
    const [isDownloading, setIsDownloading] = useState(false);
    const [hidePrices, setHidePrices] = useState(false);

    // Prefetch images through the proxy on mount so they're browser-cached before download
    useEffect(() => {
        orderData.details?.forEach((item) => {
            if (item.product_image) {
                fetch(`/api/proxy-image?url=${encodeURIComponent(item.product_image)}`);
            }
        });
    }, [orderData.details]);

    const handleDownloadExcel = async () => {
        setIsDownloading(true);

        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Захиалга");

            const formatDate = (dateString: string) => {
                try {
                    const date = new Date(dateString);
                    if (isNaN(date.getTime())) return dateString;

                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');

                    return `${year}/${month}/${day} ${hours}:${minutes}`;
                } catch (error) {
                    return dateString;
                }
            };

            worksheet.columns = hidePrices ? [
                { width: 10 },
                { width: 30 },
                { width: 15 },
                { width: 12 },
            ] : [
                { width: 10 },
                { width: 30 },
                { width: 15 },
                { width: 12 },
                { width: 18 },
                { width: 18 }
            ];

            worksheet.mergeCells('A1:F1');
            worksheet.getCell('A1').value = `Захиалгын дугаар: ${orderData.order_number}`;
            worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'left' };
            worksheet.getCell('A1').font = { bold: true, size: 12 };

            worksheet.mergeCells('A2:F2');
            worksheet.getCell('A2').value = `Захиалагчийн нэр: Түшиг барилгын материал`;
            worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'left' };
            worksheet.getCell('A2').font = { bold: true, size: 12 };


            worksheet.mergeCells('A3:F3');
            worksheet.getCell('A3').value = `Огноо: ${formatDate(orderDate)}`;
            worksheet.getCell('A3').alignment = { vertical: 'middle', horizontal: 'left' };
            worksheet.getCell('A3').font = { bold: true, size: 12 };

            const headerRow = worksheet.getRow(6);
            headerRow.values = hidePrices
                ? ["Д/дугаар", "Барааны нэр", "Зураг", "Тоо ширхэг"]
                : ["Д/дугаар", "Барааны нэр", "Зураг", "Тоо ширхэг", `Нэгжийн үнэ /${orderData.currency === "MNT" ? "₮" : "₮"}/`, `Нийт үнэ /${orderData.currency === "MNT" ? "₮" : "₮"}/`];
            headerRow.height = 30;

            headerRow.eachCell((cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFD3D3D3' }
                };
                cell.font = { bold: true };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

            // Fetch all images in parallel first to avoid sequential waterfall
            const imageResults = await Promise.all(
                (orderData.details || []).map(async (item) => {
                    if (!item.product_image) return null;
                    try {
                        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(item.product_image)}`;
                        const response = await fetch(proxyUrl);
                        if (!response.ok) throw new Error("Image fetch failed");
                        const blob = await response.blob();
                        return await compressImage(blob);
                    } catch (err) {
                        console.error(`✗ Image error (${item.product_name})`, err);
                        return null;
                    }
                })
            );

            let currentRow = 7;
            for (let index = 0; index < (orderData.details?.length || 0); index++) {
                const item = orderData.details[index];
                const row = worksheet.getRow(currentRow);
                row.height = 60;

                row.values = hidePrices ? [
                    index + 1,
                    item.product_name || "",
                    "",
                    item.quantity || 0,
                ] : [
                    index + 1,
                    item.product_name || "",
                    "",
                    item.quantity || 0,
                    parseFloat(item.unit_price || "0"),
                    parseFloat(item.total_price || "0")
                ];

                row.eachCell((cell, colNumber) => {
                    cell.alignment = {
                        vertical: 'middle',
                        horizontal: colNumber === 2 ? 'left' : 'center'
                    };
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });

                const base64 = imageResults[index];
                if (base64) {
                    const imageId = workbook.addImage({
                        base64,
                        extension: "jpeg",
                    });

                    worksheet.addImage(imageId, {
                        tl: { col: 2, row: currentRow - 1 },
                        ext: { width: 80, height: 80 },
                    });
                }

                currentRow++;
            }

            const MIN_TABLE_ROWS = 3;

            const itemCount = orderData.details?.length || 0;
            const rowsToFill = Math.max(MIN_TABLE_ROWS - itemCount, 0);

            // Add only needed empty rows
            for (let i = 0; i < rowsToFill; i++) {
                const row = worksheet.getRow(currentRow);
                row.values = hidePrices
                    ? [itemCount + i + 1, "", "", ""]
                    : [itemCount + i + 1, "", "", "", "", ""];

                row.eachCell((cell) => {
                    cell.alignment = { vertical: "middle", horizontal: "center" };
                    cell.border = {
                        top: { style: "thin" },
                        left: { style: "thin" },
                        bottom: { style: "thin" },
                        right: { style: "thin" },
                    };
                });

                currentRow++;
            }

            if (!hidePrices) {
                const totalRow = worksheet.getRow(currentRow);
                totalRow.values = ["Нийт", "", "", "", "", Number(orderData.amount || 0)];

                worksheet.mergeCells(`A${currentRow}:E${currentRow}`);

                totalRow.eachCell((cell, colNumber) => {
                    cell.font = { bold: true };
                    cell.alignment = {
                        vertical: "middle",
                        horizontal: colNumber === 1 ? "right" : "center",
                    };
                    cell.border = {
                        top: { style: "thin" },
                        left: { style: "thin" },
                        bottom: { style: "thin" },
                        right: { style: "thin" },
                    };
                });
            }


            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `order_${orderData.order_number}_${new Date().toISOString().slice(0, 10)}.xlsx`;
            link.click();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Download error:", error);
            alert("Татаж авахад алдаа гарлаа");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownloadPDF = async () => {
        setIsDownloading(true);

        try {
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            /* ================= FONT LOADER ================= */
            const loadFont = async () => {
                const load = async (name: string, path: string) => {
                    const res = await fetch(path);
                    if (!res.ok) throw new Error(`${path} not found`);

                    const blob = await res.blob();
                    const base64 = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () =>
                            resolve((reader.result as string).split(",")[1]);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });

                    doc.addFileToVFS(name, base64);
                };

                await load("Roboto-Regular.ttf", "/fonts/Roboto-Regular.ttf");
                await load("Roboto-Bold.ttf", "/fonts/Roboto-Bold.ttf");

                doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
                doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
                doc.setFont("Roboto", "normal");
            };

            await loadFont();

            /* ================= HEADER ================= */
            const formatDate = (dateString: string) => {
                try {
                    const date = new Date(dateString);
                    if (isNaN(date.getTime())) return dateString;

                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');

                    return `${year}/${month}/${day} ${hours}:${minutes}`;
                } catch (error) {
                    return dateString;
                }
            };

            doc.setFontSize(12);
            doc.text(`Захиалгын дугаар: ${orderData.order_number}`, 14, 15);

            doc.setFontSize(12);
            doc.text(`Захиалагчийн нэр: Түшиг барилгын материал`, 14, 22);
            doc.text(`Захиалга хийсэн огноо: ${formatDate(orderDate)}`, 14, 28);

            /* ================= TABLE DATA ================= */
            const tableData: any[] = [];
            const rowImages: Record<number, string> = {};

            // Fetch all images in parallel first
            const pdfImageResults = await Promise.all(
                (orderData.details || []).map(async (item) => {
                    if (!item.product_image) return null;
                    try {
                        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(item.product_image)}`;
                        const response = await fetch(proxyUrl);
                        if (!response.ok) return null;
                        const blob = await response.blob();
                        return await compressImage(blob, 400, 0.92, true);
                    } catch (err) {
                        console.error(`✗ Image error for PDF (${item.product_name})`, err);
                        return null;
                    }
                })
            );

            for (let i = 0; i < (orderData.details?.length || 0); i++) {
                const item = orderData.details[i];

                const img = pdfImageResults[i];
                if (img) {
                    rowImages[i] = img;
                }

                const row = [
                    i + 1,
                    item.product_name || "",
                    "", // image column placeholder
                    item.quantity || 0,
                ];

                if (!hidePrices) {
                    row.push(
                        Number(item.unit_price || 0).toFixed(2),
                        Number(item.total_price || 0).toFixed(2)
                    );
                }
                tableData.push(row);
            }


            /* ================= MINIMUM EMPTY ROWS ================= */
            while (tableData.length < 3) {
                const emptyRow = [tableData.length + 1, "", "", ""];
                if (!hidePrices) emptyRow.push("", "");
                tableData.push(emptyRow);
            }

            /* ================= TOTAL ROW (INSIDE TABLE) ================= */
            if (!hidePrices) {
                tableData.push([
                    {
                        content: "Нийт",
                        colSpan: 5,
                        styles: {
                            halign: "right",
                            fontStyle: "bold",
                        },
                    },
                    {
                        content: Number(orderData.amount || 0).toFixed(2),
                        styles: {
                            halign: "right",
                            fontStyle: "bold",
                        },
                    },
                ]);
            }

            /* ================= TABLE ================= */
            autoTable(doc, {
                startY: 35,
                margin: { left: 14, right: 14 },
                tableWidth: "auto",

                head: [hidePrices ? [
                    "#",
                    "Барааны нэр",
                    "Зураг",
                    "Тоо ширхэг",
                ] : [
                    "#",
                    "Барааны нэр",
                    "Зураг",
                    "Тоо ширхэг",
                    `Нэгжийн үнэ /${orderData.currency === "MNT" ? "₮" : "MNT"}/`,
                    `Нийт үнэ /${orderData.currency === "MNT" ? "₮" : "MNT"}/`,
                ]],

                body: tableData,

                theme: "grid",

                styles: {
                    font: "Roboto",
                    fontSize: 9,
                    valign: "middle",
                    cellPadding: 3,
                    minCellHeight: 26,
                },

                headStyles: {
                    fillColor: [211, 211, 211],
                    textColor: [0, 0, 0],
                    halign: "center",
                    fontStyle: "bold",
                },

                columnStyles: hidePrices ? {
                    0: { cellWidth: 15, halign: "center" },
                    1: { cellWidth: 80, halign: "left" },
                    2: { cellWidth: 48, halign: "center" },
                    3: { cellWidth: 38, halign: "center" },
                } : {
                    0: { cellWidth: 12, halign: "center" },
                    1: { cellWidth: 48, halign: "left" },
                    2: { cellWidth: 28, halign: "center" },
                    3: { cellWidth: 22, halign: "center" },
                    4: { cellWidth: 36, halign: "center" },
                    5: { cellWidth: 36, halign: "right" },
                },

                didDrawCell: (data) => {
                    if (data.cell.section !== "body") return;
                    if (data.column.index !== 2) return;

                    const img = rowImages[data.row.index];
                    if (!img) return;

                    const size = Math.min(data.cell.width, data.cell.height) - 4;

                    doc.addImage(
                        img,
                        "JPEG",
                        data.cell.x + (data.cell.width - size) / 2,
                        data.cell.y + (data.cell.height - size) / 2,
                        size,
                        size
                    );
                },
            });

            doc.save(`order_${orderData.order_number}.pdf`);
        } catch (err) {
            console.error("PDF generation error:", err);
            alert("PDF үүсгэхэд алдаа гарлаа");
        } finally {
            setIsDownloading(false);
        }
    };


    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');

            return `${year}/${month}/${day} ${hours}:${minutes}`;
        } catch (error) {
            return dateString;
        }
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-lg font-bold">Захиалга #{orderData.order_number}</h1>
                    <p className="text-sm text-muted-foreground">{formatDate(orderDate)}</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center space-x-2 mr-2">
                    <Checkbox
                        id="hide-prices"
                        checked={hidePrices}
                        onCheckedChange={(checked) => setHidePrices(checked as boolean)}
                    />
                    <Label
                        htmlFor="hide-prices"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Үнэ харуулахгүй байх
                    </Label>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="sm" disabled={isDownloading} className="bg-[#245cb5] text-white hover:bg-[#245cb5]/90">

                            {isDownloading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Татаж байна...
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4 mr-2" />
                                    Татах
                                </>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleDownloadExcel} disabled={isDownloading}>
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Excel файл татах
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDownloadPDF} disabled={isDownloading}>
                            <FileText className="h-4 w-4 mr-2" />
                            PDF файл татах
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
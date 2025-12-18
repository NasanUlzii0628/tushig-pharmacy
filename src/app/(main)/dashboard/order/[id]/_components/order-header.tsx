// src/app/(main)/dashboard/order/[id]/_components/order-header.tsx
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ExcelJS from "exceljs";
import type { OrderDetailTypes } from "@/types/order";
import { getImageUrl } from "@/utils/image";

type OrderHeaderProps = {
    orderId: number;
    orderDate: string;
    orderData: OrderDetailTypes;
};

export function OrderHeader({ orderId, orderDate, orderData }: OrderHeaderProps) {
    const router = useRouter();
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);

        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Захиалга");

            const formatDate = (dateString: string) => {
                try {
                    const date = new Date(dateString);
                    if (isNaN(date.getTime())) return dateString;
                    return date.toLocaleDateString('mn-MN');
                } catch {
                    return dateString;
                }
            };

            // Set column widths
            worksheet.columns = [
                { width: 10 },  // Д/дугаар
                { width: 30 },  // Барааны нэр
                { width: 15 },  // Зураг
                { width: 12 },  // Тоо ширхэг
                { width: 18 },  // Нэгжийн үнэ
                { width: 18 }   // Нийт үнэ
            ];

            // Add header information
            worksheet.mergeCells('A1:F1');
            worksheet.getCell('A1').value = `Захиалгын дугаар: ${orderData.order_number}`;
            worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'left' };
            worksheet.getCell('A1').font = { bold: true, size: 12 };

            worksheet.mergeCells('A2:F2');
            worksheet.getCell('A2').value = `Захиалагчийн нэр: Түшиг барилгын материал`;
            worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'left' };

            worksheet.mergeCells('A3:F3');
            worksheet.getCell('A3').value = `Огноо: ${formatDate(orderDate)}`;
            worksheet.getCell('A3').alignment = { vertical: 'middle', horizontal: 'left' };

            // Add table headers (row 6)
            const headerRow = worksheet.getRow(6);
            headerRow.values = ["Д/дугаар", "Барааны нэр", "Зураг", "Тоо ширхэг", "Нэгжийн үнэ /¥/", "Нийт үнэ /¥/"];
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

            // Add data rows with images
            let currentRow = 7;
            for (let index = 0; index < (orderData.details?.length || 0); index++) {
                const item = orderData.details[index];
                const row = worksheet.getRow(currentRow);
                row.height = 60; // Increased height for images

                row.values = [
                    index + 1,
                    item.product_name || "",
                    "", // Image placeholder
                    item.quantity || 0,
                    parseFloat(item.unit_price || "0"),
                    parseFloat(item.total_price || "0")
                ];

                // Style data cells
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

                // Add image if available
                if (item.product_image) {
                    try {
                        const imageUrl = getImageUrl(item.product_image);

                        // 1. fetch image
                        const response = await fetch(imageUrl);
                        if (!response.ok) throw new Error("Image fetch failed");

                        const blob = await response.blob();

                        // 2. blob → base64
                        const base64 = await new Promise<string>((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                const result = reader.result as string;
                                resolve(result.split(",")[1]); // remove data:image/...;base64,
                            };
                            reader.onerror = reject;
                            reader.readAsDataURL(blob);
                        });

                        // 3. add image to workbook
                        const imageId = workbook.addImage({
                            base64,
                            extension: "jpeg", // эсвэл png
                        });

                        // 4. add image to worksheet (C column)
                        worksheet.addImage(imageId, {
                            tl: { col: 2, row: currentRow - 1 }, // C column (0-based)
                            ext: { width: 80, height: 80 },
                        });

                        console.log(`✓ Image added: ${item.product_name}`);
                    } catch (err) {
                        console.error(`✗ Image error (${item.product_name})`, err);
                    }
                }


                currentRow++;
            }

            const emptyRows = Math.max(3 - (orderData.details?.length || 0), 0);
            for (let i = 0; i < emptyRows; i++) {
                const row = worksheet.getRow(currentRow);
                row.values = [
                    (orderData.details?.length || 0) + i + 1,
                    "", "", "", "", ""
                ];

                row.eachCell((cell) => {
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });

                currentRow++;
            }

            const totalRow = worksheet.getRow(currentRow);
            totalRow.values = ["Нийт", "", "", "", "", parseFloat(orderData.amount || "0")];
            totalRow.eachCell((cell, colNumber) => {
                cell.font = { bold: true };
                cell.alignment = {
                    vertical: 'middle',
                    horizontal: colNumber === 1 ? 'left' : 'center'
                };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

            // Generate and download file
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

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleString('mn-MN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
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
                    <h1 className="text-2xl font-bold">Захиалга #{orderData.order_number}</h1>
                    <p className="text-sm text-muted-foreground">{formatDate(orderDate)}</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <Printer className="h-4 w-4 mr-2" />
                    Хэвлэх
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} disabled={isDownloading}>
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
            </div>
        </div>
    );
}
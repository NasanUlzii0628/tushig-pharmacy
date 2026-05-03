"use client";

import * as React from "react";
import { ImageOff, ImageIcon } from "lucide-react";

type Props = {
    src: string | null;
    alt: string;
};

export function OrderItemImage({ src, alt }: Props) {
    const [hasError, setHasError] = React.useState(false);

    if (!src) {
        return (
            <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-md border">
                <ImageOff className="text-muted-foreground h-5 w-5" />
            </div>
        );
    }

    if (hasError) {
        return (
            <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-md border">
                <ImageIcon className="text-muted-foreground h-5 w-5" />
            </div>
        );
    }

    return (
        <img
            src={`https://cdn.tushig.online/${src}`}
            alt={alt}
            className="h-12 w-12 rounded-md border object-cover"
            onError={() => setHasError(true)}
        />
    );
}

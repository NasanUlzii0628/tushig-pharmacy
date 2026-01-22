import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const imageUrl = request.nextUrl.searchParams.get('url');

    if (!imageUrl) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        const response = await fetch(`https://cdn.tushig.online/${imageUrl}`);

        if (!response.ok) {
            throw new Error('Failed to fetch image');
        }

        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();

        return new NextResponse(arrayBuffer, {
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000',
            },
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to proxy image' }, { status: 500 });
    }
}
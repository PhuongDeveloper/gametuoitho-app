import { NextRequest, NextResponse } from 'next/server';
import { uploadToImgBB } from '@/lib/imgbb';

/**
 * Image Upload Proxy API
 * Proxies image uploads to ImgBB to keep API key server-side.
 * Accepts base64 image data in request body.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      );
    }

    const url = await uploadToImgBB(image);

    return NextResponse.json({ url, success: true });
  } catch (error: any) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

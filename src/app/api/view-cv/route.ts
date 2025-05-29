import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/lib/auth";

// Cloudflare R2 configuration
const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  throw new Error("Missing Cloudflare R2 configuration environment variables");
}

// Initialize R2 client
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get file parameter from URL
    const searchParams = request.nextUrl.searchParams;
    const fileKey = searchParams.get("file");

    if (!fileKey) {
      return new NextResponse("File parameter is required", { status: 400 });
    }

    // Security check: Verify the file belongs to the current user
    if (!fileKey.includes(session.user.id)) {
      return new NextResponse("Unauthorized to access this file", { status: 403 });
    }

    // Get file from R2
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileKey,
    });

    const response = await r2Client.send(command);

    if (!response.Body) {
      return new NextResponse("File not found", { status: 404 });
    }

    // Convert the stream to buffer
    const chunks: Uint8Array[] = [];
    const reader = response.Body.transformToWebStream().getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const buffer = Buffer.concat(chunks);

    // Determine content type
    const contentType = response.ContentType || 'application/octet-stream';
    
    // Get original filename from metadata or file key
    const originalName = response.Metadata?.originalName || fileKey.split('/').pop() || 'document';

    // Return the file with appropriate headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${originalName}"`,
        'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error("Error serving CV file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 
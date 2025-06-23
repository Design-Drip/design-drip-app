import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function POST(req: Request) {
  try {
    const { fileKey } = await req.json();
    
    if (!fileKey) {
      return NextResponse.json({ success: false, error: "File key is required" }, { status: 400 });
    }
    
    // Log file deletion request
    console.log(`Deleting UploadThing file with key: ${fileKey}`);
    
    // Delete the file
    await utapi.deleteFiles(fileKey);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file from UploadThing:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: ExpoRequest): Promise<ExpoResponse> {
  try {
    const formData = await request.formData();

    const totalFiles = formData.get("totalFiles") as string;
    const uploadTime = formData.get("uploadTime") as string;
    const source = formData.get("source") as string;

    const files: {
      name: string;
      type: string;
      size: number;
    }[] = [];

    for (const [key, value] of formData.entries()) {
      if (key.startsWith("file") || key === "generatedFile") {
        if (value instanceof File) {
          files.push({
            name: value.name,
            type: value.type,
            size: value.size,
          });
        } else if (typeof value === "object" && value !== null) {
          const fileData = value as any;
          files.push({
            name: fileData.name || "unknown",
            type: fileData.type || "application/octet-stream",
            size: fileData.size || 0,
          });
        }
      }
    }

    console.log("Upload received:", {
      totalFiles,
      uploadTime,
      source,
      filesCount: files.length,
      files: files.map((f) => ({ name: f.name, type: f.type, size: f.size })),
    });

    return Response.json({
      success: true,
      message: "Files uploaded successfully",
      uploadTime,
      totalFiles: parseInt(totalFiles) || files.length,
      files,
      source,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json(
      {
        success: false,
        message: "Upload failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

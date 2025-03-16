"use server";

import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface UploadResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function uploadImage(formData: FormData): Promise<UploadResponse> {
  const file = formData.get("file") as File | null;
  const title = formData.get("title") as string | null;

  if (!file || !title) {
    return { success: false, message: "File and title are required." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileKey = `uploads/${randomUUID()}-${file.name}`;
  const uploadDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const params: PutObjectCommandInput = {
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: fileKey,
    Body: buffer,
    ContentType: file.type,
    Tagging: `title=${encodeURIComponent(title)}&date=${uploadDate}`, // Store title & date
  };

  try {
    await s3.send(new PutObjectCommand(params));
    return { success: true };
  } catch (error) {
    console.error("S3 Upload Error:", error);
    return { success: false, error: "Failed to upload image." };
  }
}

export async function deleteImage(key: string) {
  try {
    const bucketName = process.env.AWS_S3_BUCKET_NAME!;

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key, // File path in S3
    });

    await s3.send(command);

    return { success: true, message: "Image deleted successfully" };
  } catch (error) {
    console.error("Error deleting image:", error);
    return { success: false, message: "Failed to delete image" };
  }
}

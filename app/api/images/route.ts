import {
  S3Client,
  ListObjectsV2Command,
  GetObjectTaggingCommand,
  _Object,
} from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface ImageData {
  key: string;
  url: string;
  title: string;
  uploadDate: string;
}

export async function GET() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
    });

    const { Contents } = await s3.send(command);

    if (!Contents || Contents.length === 0) {
      return NextResponse.json({ images: [] });
    }

    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

    const imageData: ImageData[] = await Promise.all(
      Contents.filter(
        (file: _Object) =>
          file.Key &&
          imageExtensions.some((ext) => file.Key!.toLowerCase().endsWith(ext))
      ).map(async (file: _Object) => {
        if (!file.Key) return null;

        const tagsCommand = new GetObjectTaggingCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME!,
          Key: file.Key,
        });

        let title = "Untitled";
        let date = "Unknown";

        try {
          const { TagSet } = await s3.send(tagsCommand);
          title =
            TagSet?.find((tag) => tag.Key === "title")?.Value || "Untitled";
          date = TagSet?.find((tag) => tag.Key === "date")?.Value || "Unknown";
        } catch (error) {
          console.error(`Failed to fetch tags for ${file.Key}:`, error);
        }

        return {
          key: file.Key,
          url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.Key}`,
          title,
          uploadDate: date,
        };
      })
    ).then((images) =>
      images.filter((image): image is ImageData => image !== null)
    );
    console.log(imageData);
    return NextResponse.json([...imageData]);
  } catch (error) {
    console.error("S3 ListObjects Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch images from S3" },
      { status: 500 }
    );
  }
}

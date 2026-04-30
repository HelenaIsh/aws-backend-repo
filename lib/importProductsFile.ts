import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ResponseBuilder } from "./utils/responseBuilder";

const s3Client = new S3Client({});

export async function main(event: any) {
  console.log("GET /import", JSON.stringify(event));

  try {
    const name = event.queryStringParameters?.name;

    if (!name) {
      return ResponseBuilder.badRequest(
        "Missing required query parameter: name",
      );
    }

    const bucketName = process.env.IMPORT_BUCKET_NAME!;
    const key = `uploaded/${name}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: "text/csv",
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    return ResponseBuilder.success(signedUrl);
  } catch (error) {
    console.error("Error creating signed URL:", error);
    return ResponseBuilder.internalServerError("Internal server error");
  }
}

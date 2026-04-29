import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { S3Event } from "aws-lambda";

const s3Client = new S3Client({});

export async function main(event: S3Event) {
  console.log("S3 Event:", JSON.stringify(event));

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    console.log(`Processing file: ${key} from bucket: ${bucket}`);

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3Client.send(command);

    const body = await response.Body!.transformToString();
    const lines = body.split("\n").filter((line) => line.trim());

    if (lines.length === 0) {
      console.log("Empty CSV file, skipping");
      continue;
    }

    const headers = lines[0].split(",").map((h) => h.trim());

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      const record: Record<string, string> = {};
      headers.forEach((header, index) => {
        record[header] = values[index] ?? "";
      });
      console.log("Parsed record:", JSON.stringify(record));
    }

    console.log(`Finished parsing file: ${key}`);

    const newKey = key.replace("uploaded/", "parsed/");

    await s3Client.send(
      new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `${bucket}/${key}`,
        Key: newKey,
      }),
    );

    await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));

    console.log(`Moved file from ${key} to ${newKey}`);
  }
}

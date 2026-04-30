import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { S3Event } from "aws-lambda";
import csv = require("csv-parser");
import { Readable } from "stream";

const s3Client = new S3Client({});

export async function main(event: S3Event) {
  console.log("S3 Event:", JSON.stringify(event));

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    console.log(`Processing file: ${key} from bucket: ${bucket}`);

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3Client.send(command);

    const stream = response.Body as Readable;

    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(csv())
        .on("data", (data: Record<string, string>) => {
          console.log("Parsed record:", JSON.stringify(data));
        })
        .on("error", (error: Error) => {
          console.error("Error parsing CSV:", error);
          reject(error);
        })
        .on("end", () => {
          console.log(`Finished parsing file: ${key}`);
          resolve();
        });
    });

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

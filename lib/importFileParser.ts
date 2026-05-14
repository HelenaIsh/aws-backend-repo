import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { S3Event } from "aws-lambda";
import csv = require("csv-parser");
import { Readable } from "stream";

const s3Client = new S3Client({});
const sqsClient = new SQSClient({});
const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL!;

export async function main(event: S3Event) {
  console.log("S3 Event:", JSON.stringify(event));

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    console.log(`Processing file: ${key} from bucket: ${bucket}`);

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3Client.send(command);

    const stream = response.Body as Readable;

    const records: Record<string, string>[] = [];

    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(csv())
        .on("data", (data: Record<string, string>) => {
          records.push(data);
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

    for (const record of records) {
      await sqsClient.send(
        new SendMessageCommand({
          QueueUrl: SQS_QUEUE_URL,
          MessageBody: JSON.stringify(record),
        }),
      );
    }

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

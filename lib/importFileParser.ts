import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { S3Event } from "aws-lambda";
import { Readable, Transform, TransformCallback } from "stream";
import { pipeline } from "stream/promises";

const s3Client = new S3Client({});

class CsvParser extends Transform {
  private buffer = "";
  private headers: string[] = [];

  constructor() {
    super({ objectMode: true });
  }

  _transform(chunk: Buffer, _encoding: string, callback: TransformCallback) {
    this.buffer += chunk.toString();
    const lines = this.buffer.split("\n");
    this.buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (this.headers.length === 0) {
        this.headers = trimmed.split(",").map((h) => h.trim());
      } else {
        const values = trimmed.split(",").map((v) => v.trim());
        const record: Record<string, string> = {};
        this.headers.forEach((header, index) => {
          record[header] = values[index] ?? "";
        });
        this.push(record);
      }
    }
    callback();
  }

  _flush(callback: TransformCallback) {
    const trimmed = this.buffer.trim();
    if (trimmed && this.headers.length > 0) {
      const values = trimmed.split(",").map((v) => v.trim());
      const record: Record<string, string> = {};
      this.headers.forEach((header, index) => {
        record[header] = values[index] ?? "";
      });
      this.push(record);
    }
    callback();
  }
}

export async function main(event: S3Event) {
  console.log("S3 Event:", JSON.stringify(event));

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    console.log(`Processing file: ${key} from bucket: ${bucket}`);

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3Client.send(command);

    const stream = response.Body as Readable;
    const csvParser = new CsvParser();

    const logger = new Transform({
      objectMode: true,
      transform(data, _encoding, callback) {
        console.log("Parsed record:", JSON.stringify(data));
        callback();
      },
    });

    await pipeline(stream, csvParser, logger);

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

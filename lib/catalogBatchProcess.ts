import { SQSEvent } from "aws-lambda";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { ProductService } from "./services/productService";

const snsClient = new SNSClient({});
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN!;

export async function main(event: SQSEvent) {
  console.log("catalogBatchProcess event:", JSON.stringify(event));

  const productService = new ProductService();
  const createdProducts = [];

  for (const record of event.Records) {
    try {
      const body =
        typeof record.body === "string" ? JSON.parse(record.body) : record.body;

      const { title, description, price, count } = body;

      if (!title || price === undefined || count === undefined) {
        console.error("Invalid product data, missing required fields:", body);
        continue;
      }

      const product = await productService.createProduct({
        title,
        description: description || "",
        price: Number(price),
        count: Number(count),
      });

      console.log("Created product:", product);
      createdProducts.push(product);
    } catch (error) {
      console.error("Error processing SQS message:", error);
    }
  }

  if (createdProducts.length > 0) {
    await snsClient.send(
      new PublishCommand({
        TopicArn: SNS_TOPIC_ARN,
        Subject: `${createdProducts.length} product(s) created`,
        Message: JSON.stringify(createdProducts, null, 2),
      }),
    );
    console.log(`Published ${createdProducts.length} products to SNS`);
  }
}

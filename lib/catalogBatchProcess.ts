import { SQSEvent } from "aws-lambda";
import { ProductService } from "./services/productService";

export async function main(event: SQSEvent) {
  console.log("catalogBatchProcess event:", JSON.stringify(event));

  const productService = new ProductService();

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
    } catch (error) {
      console.error("Error processing SQS message:", error);
    }
  }
}

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { products } from "../lib/products/products";

const client = new DynamoDBClient({ region: "eu-north-1" });
const docClient = DynamoDBDocumentClient.from(client);

async function seed() {
  const productItems = products.map(({ id, title, description, price }) => ({
    PutRequest: {
      Item: { id, title, description, price },
    },
  }));

  const stockItems = products.map(({ id, count }) => ({
    PutRequest: {
      Item: { product_id: id, count },
    },
  }));

  // BatchWrite supports max 25 items per request
  const batchWrite = async (tableName: string, items: any[]) => {
    for (let i = 0; i < items.length; i += 25) {
      const batch = items.slice(i, i + 25);
      await docClient.send(
        new BatchWriteCommand({
          RequestItems: {
            [tableName]: batch,
          },
        }),
      );
      console.log(
        `Wrote ${batch.length} items to ${tableName} (batch ${Math.floor(i / 25) + 1})`,
      );
    }
  };

  await batchWrite("products", productItems);
  await batchWrite("stocks", stockItems);

  console.log("Seed complete!");
}

seed().catch(console.error);

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { Product } from "../products/products";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE_NAME!;
const STOCKS_TABLE = process.env.STOCKS_TABLE_NAME!;

export class ProductService {
  async getAllProducts(): Promise<Product[]> {
    const [productsResult, stocksResult] = await Promise.all([
      docClient.send(new ScanCommand({ TableName: PRODUCTS_TABLE })),
      docClient.send(new ScanCommand({ TableName: STOCKS_TABLE })),
    ]);

    const products = productsResult.Items || [];
    const stocks = stocksResult.Items || [];

    const stockMap = new Map(stocks.map((s) => [s.product_id, s.count ?? 0]));

    return products.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      price: p.price,
      count: stockMap.get(p.id) ?? 0,
    }));
  }

  async getProductById(productId: string): Promise<Product | undefined> {
    const [productsResult, stocksResult] = await Promise.all([
      docClient.send(new ScanCommand({ TableName: PRODUCTS_TABLE })),
      docClient.send(new ScanCommand({ TableName: STOCKS_TABLE })),
    ]);

    const product = (productsResult.Items || []).find(
      (p) => p.id === productId,
    );
    if (!product) return undefined;

    const stock = (stocksResult.Items || []).find(
      (s) => s.product_id === productId,
    );

    return {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      count: stock?.count ?? 0,
    };
  }

  async createProduct(input: {
    title: string;
    description: string;
    price: number;
    count: number;
  }): Promise<Product> {
    const id = randomUUID();

    await docClient.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: PRODUCTS_TABLE,
              Item: {
                id,
                title: input.title,
                description: input.description,
                price: input.price,
              },
            },
          },
          {
            Put: {
              TableName: STOCKS_TABLE,
              Item: {
                product_id: id,
                count: input.count,
              },
            },
          },
        ],
      }),
    );

    return {
      id,
      title: input.title,
      description: input.description,
      price: input.price,
      count: input.count,
    };
  }
}

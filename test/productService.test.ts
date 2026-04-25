import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

process.env.PRODUCTS_TABLE_NAME = "products";
process.env.STOCKS_TABLE_NAME = "stocks";

const ddbMock = mockClient(DynamoDBDocumentClient);

import { ProductService } from "../lib/services/productService";

const mockProducts = [
  {
    id: "id-1",
    title: "Wireless Headphones",
    description: "Desc 1",
    price: 199.99,
  },
  { id: "id-2", title: "Smart Watch", description: "Desc 2", price: 299.99 },
];

const mockStocks = [
  { product_id: "id-1", count: 15 },
  { product_id: "id-2", count: 25 },
];

describe("ProductService", () => {
  let productService: ProductService;

  beforeEach(() => {
    ddbMock.reset();
    productService = new ProductService();
    ddbMock
      .on(ScanCommand, { TableName: "products" })
      .resolves({ Items: mockProducts });
    ddbMock
      .on(ScanCommand, { TableName: "stocks" })
      .resolves({ Items: mockStocks });
  });

  describe("getAllProducts", () => {
    it("should return all products joined with stock", async () => {
      const result = await productService.getAllProducts();

      expect(result.length).toBe(2);
      expect(result[0]).toEqual({
        id: "id-1",
        title: "Wireless Headphones",
        description: "Desc 1",
        price: 199.99,
        count: 15,
      });
    });

    it("should return count 0 when stock is missing", async () => {
      ddbMock.reset();
      ddbMock
        .on(ScanCommand, { TableName: "products" })
        .resolves({ Items: mockProducts });
      ddbMock.on(ScanCommand, { TableName: "stocks" }).resolves({ Items: [] });

      const result = await productService.getAllProducts();

      result.forEach((product) => {
        expect(product.count).toBe(0);
      });
    });
  });

  describe("getProductById", () => {
    it("should return a product when valid ID is provided", async () => {
      const result = await productService.getProductById("id-1");

      expect(result).toBeDefined();
      expect(result?.id).toBe("id-1");
      expect(result?.title).toBe("Wireless Headphones");
      expect(result?.count).toBe(15);
    });

    it("should return undefined when product ID does not exist", async () => {
      const result = await productService.getProductById("non-existent-id");

      expect(result).toBeUndefined();
    });
  });
});

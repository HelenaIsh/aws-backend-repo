import { ProductService } from "../lib/services/productService";
import { products } from "../lib/products/products";

describe("ProductService", () => {
  let productService: ProductService;

  beforeEach(() => {
    productService = new ProductService();
  });

  describe("getAllProducts", () => {
    it("should return all products", () => {
      const result = productService.getAllProducts();

      expect(result).toEqual(products);
      expect(result.length).toBe(8);
    });

    it("should return an array of products with correct properties", () => {
      const result = productService.getAllProducts();

      result.forEach((product) => {
        expect(product).toHaveProperty("id");
        expect(product).toHaveProperty("title");
        expect(product).toHaveProperty("description");
        expect(product).toHaveProperty("price");
        expect(product).toHaveProperty("count");
      });
    });
  });

  describe("getProductById", () => {
    it("should return a product when valid ID is provided", () => {
      const productId = "7567ec4b-b10c-48c5-9345-fc73c48a80aa";

      const result = productService.getProductById(productId);

      expect(result).toBeDefined();
      expect(result?.id).toBe(productId);
      expect(result?.title).toBe("Wireless Headphones");
    });

    it("should return undefined when product ID does not exist", () => {
      const productId = "non-existent-id";

      const result = productService.getProductById(productId);

      expect(result).toBeUndefined();
    });

    it("should return correct product for each valid ID", () => {
      const testCases = [
        { id: "7567ec4b-b10c-48c5-9345-fc73c48a80a1", title: "Smart Watch" },
        { id: "7567ec4b-b10c-48c5-9345-fc73c48a80a2", title: "Laptop Stand" },
        { id: "7567ec4b-b10c-48c5-9345-fc73c48a80a3", title: "USB-C Hub" },
      ];

      testCases.forEach((testCase) => {
        const result = productService.getProductById(testCase.id);
        expect(result?.title).toBe(testCase.title);
      });
    });
  });
});

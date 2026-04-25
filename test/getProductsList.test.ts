import { ProductService } from "../lib/services/productService";

const getAllProductsSpy = jest.spyOn(
  ProductService.prototype,
  "getAllProducts",
);

import { main } from "../lib/getProductsList";

describe("getProductsList Lambda Handler", () => {
  beforeEach(() => {
    getAllProductsSpy.mockReset();
  });

  it("should return 200 with all products on success", async () => {
    const mockProducts = [
      {
        id: "1",
        title: "Test Product",
        description: "Test Description",
        price: 99.99,
        count: 10,
      },
    ];

    getAllProductsSpy.mockResolvedValue(mockProducts);

    const result = await main();

    expect(result.statusCode).toBe(200);
    expect(result.headers["Content-Type"]).toBe("application/json");
    expect(result.headers["Access-Control-Allow-Origin"]).toBe("*");
    expect(JSON.parse(result.body)).toEqual(mockProducts);
  });

  it("should return 500 on service error", async () => {
    getAllProductsSpy.mockRejectedValue(new Error("Service error"));

    const result = await main();

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      message: "Internal server error",
    });
  });

  it("should include CORS headers in response", async () => {
    getAllProductsSpy.mockResolvedValue([]);

    const result = await main();

    expect(result.headers).toHaveProperty("Access-Control-Allow-Origin");
    expect(result.headers).toHaveProperty("Access-Control-Allow-Methods");
    expect(result.headers).toHaveProperty("Access-Control-Allow-Headers");
  });
});

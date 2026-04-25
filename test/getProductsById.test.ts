import { ProductService } from "../lib/services/productService";

const getProductByIdSpy = jest.spyOn(
  ProductService.prototype,
  "getProductById",
);

import { main } from "../lib/getProductsById";

describe("getProductsById Lambda Handler", () => {
  beforeEach(() => {
    getProductByIdSpy.mockReset();
  });

  it("should return 200 with product when valid ID is provided", async () => {
    const mockProduct = {
      id: "test-id-123",
      title: "Test Product",
      description: "Test Description",
      price: 99.99,
      count: 10,
    };

    getProductByIdSpy.mockReturnValue(mockProduct);

    const event = {
      pathParameters: {
        productId: "test-id-123",
      },
    };

    const result = await main(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(mockProduct);
    expect(getProductByIdSpy).toHaveBeenCalledWith("test-id-123");
  });

  it("should return 404 when product is not found", async () => {
    getProductByIdSpy.mockReturnValue(undefined);

    const event = {
      pathParameters: {
        productId: "non-existent-id",
      },
    };

    const result = await main(event);

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body)).toEqual({
      message: "Product not found",
    });
  });

  it("should return 400 when productId is missing", async () => {
    const event = {
      pathParameters: {},
    };

    const result = await main(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      message: "Product ID is required",
    });
  });

  it("should return 400 when pathParameters is undefined", async () => {
    const event = {};

    const result = await main(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      message: "Product ID is required",
    });
  });

  it("should return 500 on service error", async () => {
    getProductByIdSpy.mockImplementation(() => {
      throw new Error("Service error");
    });

    const event = {
      pathParameters: {
        productId: "test-id",
      },
    };

    const result = await main(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      message: "Internal server error",
    });
  });

  it("should include CORS headers in all responses", async () => {
    getProductByIdSpy.mockReturnValue(undefined);

    const event = {
      pathParameters: {
        productId: "test-id",
      },
    };

    const result = await main(event);

    expect(result.headers).toHaveProperty("Access-Control-Allow-Origin");
    expect(result.headers).toHaveProperty("Access-Control-Allow-Methods");
    expect(result.headers).toHaveProperty("Access-Control-Allow-Headers");
  });
});

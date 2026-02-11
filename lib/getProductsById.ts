import { ProductService } from "./services/productService";
import { ResponseBuilder } from "./utils/responseBuilder";

export async function main(event: any) {
  try {
    const productService = new ProductService();
    const productId = event.pathParameters?.productId;

    if (!productId) {
      return ResponseBuilder.badRequest("Product ID is required");
    }

    const product = productService.getProductById(productId);

    if (!product) {
      return ResponseBuilder.notFound("Product not found");
    }

    return ResponseBuilder.success(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return ResponseBuilder.internalServerError("Internal server error");
  }
}

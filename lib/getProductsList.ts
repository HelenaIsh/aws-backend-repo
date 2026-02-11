import { ProductService } from "./services/productService";
import { ResponseBuilder } from "./utils/responseBuilder";

const productService = new ProductService();

export async function main() {
  try {
    const products = productService.getAllProducts();
    return ResponseBuilder.success(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return ResponseBuilder.internalServerError("Internal server error");
  }
}

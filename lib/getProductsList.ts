import { ProductService } from "./services/productService";
import { ResponseBuilder } from "./utils/responseBuilder";

export async function main(event: any) {
  console.log("GET /products", JSON.stringify(event));
  try {
    const productService = new ProductService();
    const products = await productService.getAllProducts();
    return ResponseBuilder.success(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return ResponseBuilder.internalServerError("Internal server error");
  }
}

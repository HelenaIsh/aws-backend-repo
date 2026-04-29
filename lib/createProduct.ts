import { ProductService } from "./services/productService";
import { ResponseBuilder } from "./utils/responseBuilder";

export async function main(event: any) {
  console.log("POST /products", JSON.stringify(event));
  try {
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    if (!body) {
      return ResponseBuilder.badRequest("Request body is required");
    }

    const { title, description, price, count } = body;

    if (!title || price === undefined || count === undefined) {
      return ResponseBuilder.badRequest(
        "Missing required fields: title, price, count",
      );
    }

    if (typeof price !== "number" || price < 0) {
      return ResponseBuilder.badRequest("Price must be a non-negative number");
    }

    if (typeof count !== "number" || count < 0 || !Number.isInteger(count)) {
      return ResponseBuilder.badRequest("Count must be a non-negative integer");
    }

    const productService = new ProductService();
    const product = await productService.createProduct({
      title,
      description: description || "",
      price,
      count,
    });

    return ResponseBuilder.created(product);
  } catch (error) {
    console.error("Error creating product:", error);
    return ResponseBuilder.internalServerError("Internal server error");
  }
}

import { products, Product } from "../products/products";

export class ProductService {
  getAllProducts(): Product[] {
    return products;
  }

  getProductById(productId: string): Product | undefined {
    return products.find((product) => product.id === productId);
  }
}

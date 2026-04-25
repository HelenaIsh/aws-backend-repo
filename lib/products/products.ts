export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  count: number;
}

export const products: Product[] = [
  {
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
    title: "Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 199.99,
    count: 15,
  },
  {
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a1",
    title: "Smart Watch",
    description: "Feature-rich smartwatch with fitness tracking",
    price: 299.99,
    count: 25,
  },
  {
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a2",
    title: "Laptop Stand",
    description: "Ergonomic aluminum laptop stand",
    price: 49.99,
    count: 50,
  },
  {
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a3",
    title: "USB-C Hub",
    description: "7-in-1 USB-C hub with HDMI and card reader",
    price: 79.99,
    count: 30,
  },
  {
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a4",
    title: "Mechanical Keyboard",
    description: "RGB mechanical keyboard with blue switches",
    price: 129.99,
    count: 20,
  },
  {
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a5",
    title: "Wireless Mouse",
    description: "Ergonomic wireless mouse with precision tracking",
    price: 39.99,
    count: 45,
  },
  {
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a6",
    title: "External SSD 1TB",
    description: "Portable external SSD with USB 3.2",
    price: 149.99,
    count: 18,
  },
  {
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a7",
    title: "Monitor 27 inch",
    description: "4K UHD monitor with HDR support",
    price: 449.99,
    count: 12,
  },
];

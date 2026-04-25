# Products API - Frontend Integration Guide

## Overview
This API provides endpoints to retrieve product information from the Products Service.

## Base URL
After deployment, the API Gateway URL will be available in the CloudFormation stack outputs:
```
https://{api-id}.execute-api.{region}.amazonaws.com/prod/
```

To get the API URL after deployment, run:
```bash
aws cloudformation describe-stacks --stack-name AwsBackendRepoStack --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" --output text
```

## CORS Configuration
The API has CORS enabled with the following settings:
- **Allowed Origins**: All origins (`*`)
- **Allowed Methods**: All methods (GET, POST, PUT, DELETE, etc.)
- **Allowed Headers**: `Content-Type`, `Authorization`

## Authentication
Currently, no authentication is required. The endpoints are publicly accessible.

---

## Endpoints

### 1. Get All Products

**Endpoint**: `GET /products`

**Description**: Retrieves a list of all available products in the catalog.

**Request Example**:
```javascript
// Using fetch
fetch('https://9l0z38k0u3.execute-api.eu-north-1.amazonaws.com/prod/products', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// Using axios
axios.get('https://9l0z38k0u3.execute-api.eu-north-1.amazonaws.com/prod/products')
  .then(response => console.log(response.data))
  .catch(error => console.error('Error:', error));
```

**Success Response (200)**:
```json
[
  {
    "id": "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
    "title": "Wireless Headphones",
    "description": "High-quality wireless headphones with noise cancellation",
    "price": 199.99,
    "count": 15
  },
  {
    "id": "7567ec4b-b10c-48c5-9345-fc73c48a80a1",
    "title": "Smart Watch",
    "description": "Feature-rich smartwatch with fitness tracking",
    "price": 299.99,
    "count": 25
  }
]
```

**Error Response (500)**:
```json
{
  "message": "Internal server error"
}
```

---

### 2. Get Product by ID

**Endpoint**: `GET /products/{productId}`

**Description**: Retrieves a single product by its unique identifier (UUID).

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| productId | string (UUID) | Yes | Unique identifier of the product |

**Request Example**:
```javascript
// Using fetch
const productId = '7567ec4b-b10c-48c5-9345-fc73c48a80aa';
fetch(`https://9l0z38k0u3.execute-api.eu-north-1.amazonaws.com/prod/products/${productId}`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// Using axios
axios.get(`https://9l0z38k0u3.execute-api.eu-north-1.amazonaws.com/prod/products/${productId}`)
  .then(response => console.log(response.data))
  .catch(error => {
    if (error.response) {
      console.error('Error:', error.response.data);
    }
  });
```

**Success Response (200)**:
```json
{
  "id": "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
  "title": "Wireless Headphones",
  "description": "High-quality wireless headphones with noise cancellation",
  "price": 199.99,
  "count": 15
}
```

**Error Response (400)** - Missing product ID:
```json
{
  "message": "Product ID is required"
}
```

**Error Response (404)** - Product not found:
```json
{
  "message": "Product not found"
}
```

**Error Response (500)** - Internal server error:
```json
{
  "message": "Internal server error"
}
```

---

## Data Schema

### Product Object
```typescript
interface Product {
  id: string;          // UUID format
  title: string;       // Product name
  description: string; // Product description
  price: number;       // Price in USD (decimal)
  count: number;       // Available quantity (integer)
}
```

---

## Sample Products Available
The API currently has the following products in the catalog:

| ID | Title | Price |
|----|-------|-------|
| 7567ec4b-b10c-48c5-9345-fc73c48a80aa | Wireless Headphones | $199.99 |
| 7567ec4b-b10c-48c5-9345-fc73c48a80a1 | Smart Watch | $299.99 |
| 7567ec4b-b10c-48c5-9345-fc73c48a80a2 | Laptop Stand | $49.99 |
| 7567ec4b-b10c-48c5-9345-fc73c48a80a3 | USB-C Hub | $79.99 |
| 7567ec4b-b10c-48c5-9345-fc73c48a80a4 | Mechanical Keyboard | $129.99 |
| 7567ec4b-b10c-48c5-9345-fc73c48a80a5 | Wireless Mouse | $39.99 |

---

## Complete React Example

```typescript
import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://9l0z38k0u3.execute-api.eu-north-1.amazonaws.com/prod';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  count: number;
}

// Get all products
function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/products`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        return response.json();
      })
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Products</h1>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            <h3>{product.title}</h3>
            <p>{product.description}</p>
            <p>Price: ${product.price}</p>
            <p>In stock: {product.count}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Get single product
function ProductDetail({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/products/${productId}`)
      .then(response => {
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Product not found');
          }
          throw new Error('Failed to fetch product');
        }
        return response.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [productId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div>
      <h1>{product.title}</h1>
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
      <p>In stock: {product.count}</p>
    </div>
  );
}

export { ProductList, ProductDetail };
```

---

## Error Handling Best Practices

Always implement proper error handling:

```javascript
async function fetchProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
}
```

---

## HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success - Request completed successfully |
| 400 | Bad Request - Missing or invalid product ID |
| 404 | Not Found - Product with specified ID doesn't exist |
| 500 | Internal Server Error - Server-side error occurred |

---

## Testing the API

You can test the API using curl:

```bash
# Get all products
curl https://9l0z38k0u3.execute-api.eu-north-1.amazonaws.com/prod/products

# Get specific product
curl https://9l0z38k0u3.execute-api.eu-north-1.amazonaws.com/prod/products/7567ec4b-b10c-48c5-9345-fc73c48a80aa
```

Or using Postman/Thunder Client with the provided Swagger specification in `swagger.yaml`.

---

## Notes
- All responses are in JSON format
- Product IDs are in UUID format
- Prices are in USD (decimal numbers)
- The `count` field represents available inventory
- Lambda functions have a 5-second timeout
- Lambda memory allocation: 1024 MB

## Support
For issues or questions, contact the backend team or refer to the Swagger documentation in `swagger.yaml`.

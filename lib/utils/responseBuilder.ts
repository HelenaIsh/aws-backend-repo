export interface ApiResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

const defaultHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET",
  "Access-Control-Allow-Headers": "Content-Type",
};

export class ResponseBuilder {
  static success<T>(data: T): ApiResponse {
    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: JSON.stringify(data),
    };
  }

  static badRequest(message: string): ApiResponse {
    return {
      statusCode: 400,
      headers: defaultHeaders,
      body: JSON.stringify({ message }),
    };
  }

  static notFound(message: string): ApiResponse {
    return {
      statusCode: 404,
      headers: defaultHeaders,
      body: JSON.stringify({ message }),
    };
  }

  static internalServerError(message: string): ApiResponse {
    return {
      statusCode: 500,
      headers: defaultHeaders,
      body: JSON.stringify({ message }),
    };
  }
}

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

jest.mock("@aws-sdk/client-s3");
jest.mock("@aws-sdk/s3-request-presigner");

const mockedGetSignedUrl = getSignedUrl as jest.MockedFunction<
  typeof getSignedUrl
>;

import { main } from "../lib/importProductsFile";

describe("importProductsFile Lambda Handler", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv, IMPORT_BUCKET_NAME: "test-bucket" };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should return 200 with a signed URL when name is provided", async () => {
    const mockUrl =
      "https://s3.amazonaws.com/test-bucket/uploaded/test.csv?signed";
    mockedGetSignedUrl.mockResolvedValue(mockUrl);

    const event = {
      queryStringParameters: { name: "test.csv" },
    };

    const result = await main(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toBe(mockUrl);
    expect(mockedGetSignedUrl).toHaveBeenCalledWith(
      expect.any(S3Client),
      expect.any(PutObjectCommand),
      { expiresIn: 300 },
    );
  });

  it("should return 400 when name query parameter is missing", async () => {
    const event = {
      queryStringParameters: null,
    };

    const result = await main(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      message: "Missing required query parameter: name",
    });
    expect(mockedGetSignedUrl).not.toHaveBeenCalled();
  });

  it("should return 400 when queryStringParameters is undefined", async () => {
    const event = {};

    const result = await main(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      message: "Missing required query parameter: name",
    });
  });

  it("should return 500 when getSignedUrl throws an error", async () => {
    mockedGetSignedUrl.mockRejectedValue(new Error("S3 error"));

    const event = {
      queryStringParameters: { name: "test.csv" },
    };

    const result = await main(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      message: "Internal server error",
    });
  });

  it("should use correct S3 key with uploaded/ prefix", async () => {
    mockedGetSignedUrl.mockResolvedValue("https://signed-url");

    const event = {
      queryStringParameters: { name: "products.csv" },
    };

    await main(event);

    const call = mockedGetSignedUrl.mock.calls[0];
    const command = call[1] as PutObjectCommand;
    expect(command).toBeInstanceOf(PutObjectCommand);
    expect(call[2]).toEqual({ expiresIn: 300 });
  });
});

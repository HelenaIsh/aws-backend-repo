import { SQSEvent } from "aws-lambda";
import { ProductService } from "../lib/services/productService";

const mockSend = jest.fn();
jest.mock("@aws-sdk/client-sns", () => {
  return {
    SNSClient: jest.fn(() => ({ send: mockSend })),
    PublishCommand: jest.fn((input) => input),
  };
});

process.env.SNS_TOPIC_ARN =
  "arn:aws:sns:us-east-1:000000000000:createProductTopic";

const createProductSpy = jest.spyOn(ProductService.prototype, "createProduct");

import { main } from "../lib/catalogBatchProcess";

const buildSQSEvent = (records: object[]): SQSEvent =>
  ({
    Records: records.map((body) => ({
      body: JSON.stringify(body),
      messageId: "test-id",
      receiptHandle: "test-handle",
      attributes: {} as any,
      messageAttributes: {},
      md5OfBody: "",
      eventSource: "aws:sqs",
      eventSourceARN: "arn:aws:sqs:us-east-1:000000000000:catalogItemsQueue",
      awsRegion: "us-east-1",
    })),
  }) as SQSEvent;

describe("catalogBatchProcess", () => {
  beforeEach(() => {
    createProductSpy.mockReset();
    mockSend.mockReset();
  });

  it("should create products for each valid SQS message", async () => {
    const products = [
      { title: "Product 1", description: "Desc 1", price: 10, count: 5 },
      { title: "Product 2", description: "Desc 2", price: 20, count: 3 },
    ];

    createProductSpy.mockImplementation(async (input) => ({
      id: "generated-id",
      ...input,
    }));
    mockSend.mockResolvedValue({});

    await main(buildSQSEvent(products));

    expect(createProductSpy).toHaveBeenCalledTimes(2);
    expect(createProductSpy).toHaveBeenCalledWith({
      title: "Product 1",
      description: "Desc 1",
      price: 10,
      count: 5,
    });
    expect(createProductSpy).toHaveBeenCalledWith({
      title: "Product 2",
      description: "Desc 2",
      price: 20,
      count: 3,
    });
  });

  it("should skip records with missing required fields", async () => {
    const records = [
      { description: "No title", price: 10, count: 5 },
      { title: "Valid", price: 10, count: 5 },
    ];

    createProductSpy.mockResolvedValue({
      id: "generated-id",
      title: "Valid",
      description: "",
      price: 10,
      count: 5,
    });
    mockSend.mockResolvedValue({});

    await main(buildSQSEvent(records));

    expect(createProductSpy).toHaveBeenCalledTimes(1);
    expect(createProductSpy).toHaveBeenCalledWith({
      title: "Valid",
      description: "",
      price: 10,
      count: 5,
    });
  });

  it("should publish to SNS after creating products", async () => {
    const product = { title: "Test", description: "Desc", price: 15, count: 2 };

    createProductSpy.mockResolvedValue({ id: "new-id", ...product });
    mockSend.mockResolvedValue({});

    await main(buildSQSEvent([product]));

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        TopicArn: process.env.SNS_TOPIC_ARN,
        Subject: "1 product(s) created",
      }),
    );
  });

  it("should not publish to SNS if no products were created", async () => {
    const invalidRecord = { description: "No title" };

    await main(buildSQSEvent([invalidRecord]));

    expect(mockSend).not.toHaveBeenCalled();
  });

  it("should continue processing if one record fails", async () => {
    const records = [
      { title: "Fail", description: "Desc", price: 10, count: 1 },
      { title: "Success", description: "Desc", price: 20, count: 2 },
    ];

    createProductSpy
      .mockRejectedValueOnce(new Error("DB error"))
      .mockResolvedValueOnce({
        id: "id-2",
        title: "Success",
        description: "Desc",
        price: 20,
        count: 2,
      });
    mockSend.mockResolvedValue({});

    await main(buildSQSEvent(records));

    expect(createProductSpy).toHaveBeenCalledTimes(2);
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        Subject: "1 product(s) created",
      }),
    );
  });

  it("should use default empty description if not provided", async () => {
    const product = { title: "No Desc", price: 30, count: 4 };

    createProductSpy.mockResolvedValue({
      id: "id",
      title: "No Desc",
      description: "",
      price: 30,
      count: 4,
    });
    mockSend.mockResolvedValue({});

    await main(buildSQSEvent([product]));

    expect(createProductSpy).toHaveBeenCalledWith({
      title: "No Desc",
      description: "",
      price: 30,
      count: 4,
    });
  });
});

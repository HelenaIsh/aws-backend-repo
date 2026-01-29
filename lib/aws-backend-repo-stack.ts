import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class AwsBackendRepoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProductsListLambda = new lambda.Function(
      this,
      "GetProductsListFunction",
      {
        runtime: lambda.Runtime.NODEJS_22_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: "getProductsList.main",
        code: lambda.Code.fromAsset(path.join(__dirname, "./")),
      },
    );

    const getProductsByIdLambda = new lambda.Function(
      this,
      "GetProductsByIdFunction",
      {
        runtime: lambda.Runtime.NODEJS_22_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: "getProductsById.main",
        code: lambda.Code.fromAsset(path.join(__dirname, "./")),
      },
    );

    const api = new apigateway.RestApi(this, "ProductsApi", {
      restApiName: "Products Service API",
      description: "API for Products Service",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ["Content-Type", "Authorization"],
      },
    });

    const productsFromLambdaIntegration = new apigateway.LambdaIntegration(
      getProductsListLambda,
      {
        proxy: true,
      },
    );

    const productsResource = api.root.addResource("products");
    productsResource.addMethod("GET", productsFromLambdaIntegration);

    const productByIdResource = productsResource.addResource("{productId}");
    const productByIdIntegration = new apigateway.LambdaIntegration(
      getProductsByIdLambda,
      {
        proxy: true,
      },
    );
    productByIdResource.addMethod("GET", productByIdIntegration);

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url,
      description: "API Gateway URL",
    });

    new cdk.CfnOutput(this, "ProductsEndpoint", {
      value: `${api.url}products`,
      description: "Products endpoint URL",
    });
  }
}

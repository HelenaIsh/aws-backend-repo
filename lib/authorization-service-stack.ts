import * as cdk from "aws-cdk-lib/core";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as dotenv from "dotenv";
import { Construct } from "constructs";

dotenv.config({ path: path.join(__dirname, "../.env") });

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const environment: Record<string, string> = {};

    // Load credentials from .env file
    for (const [key, value] of Object.entries(process.env)) {
      if (
        key &&
        value &&
        !key.startsWith("npm_") &&
        !key.startsWith("NODE_") &&
        !key.startsWith("PATH")
      ) {
        // Only include variables that look like username=password credentials
        if (/^[a-zA-Z0-9_]+$/.test(key) && value === "TEST_PASSWORD") {
          environment[key] = value;
        }
      }
    }

    const basicAuthorizerLambda = new lambda.Function(
      this,
      "BasicAuthorizerFunction",
      {
        runtime: lambda.Runtime.NODEJS_22_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: "basicAuthorizer.main",
        code: lambda.Code.fromAsset(path.join(__dirname, "./")),
        environment,
      },
    );

    new cdk.CfnOutput(this, "BasicAuthorizerArn", {
      value: basicAuthorizerLambda.functionArn,
      exportName: "BasicAuthorizerArn",
    });
  }
}

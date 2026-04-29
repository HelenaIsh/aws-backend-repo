import * as cdk from "aws-cdk-lib/core";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as path from "path";
import { Construct } from "constructs";

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const importBucket = new s3.Bucket(this, "ImportBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [
        {
          allowedHeaders: ["*"],
          allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.GET],
          allowedOrigins: ["*"],
        },
      ],
    });

    new s3deploy.BucketDeployment(this, "CreateUploadedFolder", {
      sources: [s3deploy.Source.data("uploaded/.gitkeep", "")],
      destinationBucket: importBucket,
    });

    const importProductsFileLambda = new lambda.Function(
      this,
      "ImportProductsFileFunction",
      {
        runtime: lambda.Runtime.NODEJS_22_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: "importProductsFile.main",
        code: lambda.Code.fromAsset(path.join(__dirname, "./")),
        environment: {
          IMPORT_BUCKET_NAME: importBucket.bucketName,
        },
      },
    );

    importBucket.grantReadWrite(importProductsFileLambda);

    const importFileParserLambda = new lambda.Function(
      this,
      "ImportFileParserFunction",
      {
        runtime: lambda.Runtime.NODEJS_22_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(30),
        handler: "importFileParser.main",
        code: lambda.Code.fromAsset(path.join(__dirname, "./")),
        environment: {
          IMPORT_BUCKET_NAME: importBucket.bucketName,
        },
      },
    );

    importBucket.grantReadWrite(importFileParserLambda);

    importBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(importFileParserLambda),
      { prefix: "uploaded/" },
    );

    const api = new apigateway.RestApi(this, "ImportApi", {
      restApiName: "Import Service",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ["*"],
      },
    });

    const importResource = api.root.addResource("import");
    importResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(importProductsFileLambda),
    );
  }
}

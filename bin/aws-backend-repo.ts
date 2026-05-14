#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import { AwsBackendRepoStack } from "../lib/aws-backend-repo-stack";
import { ImportServiceStack } from "../lib/import-service-stack";
import { AuthorizationServiceStack } from "../lib/authorization-service-stack";

const app = new cdk.App();
new AwsBackendRepoStack(app, "AwsBackendRepoStack");
new ImportServiceStack(app, "ImportServiceStack");
new AuthorizationServiceStack(app, "AuthorizationServiceStack");

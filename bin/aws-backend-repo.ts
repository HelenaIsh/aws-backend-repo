#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import { AwsBackendRepoStack } from "../lib/aws-backend-repo-stack";

const app = new cdk.App();
new AwsBackendRepoStack(app, "AwsBackendRepoStack");

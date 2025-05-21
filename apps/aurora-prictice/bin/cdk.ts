#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { AuroraPracticeStack } from "../lib/stack";

const app = new cdk.App();
new AuroraPracticeStack(app, "AuroraPracticeStack", {
  env: {
    account: "637423391958",
    region: "ap-northeast-1",
  },
});

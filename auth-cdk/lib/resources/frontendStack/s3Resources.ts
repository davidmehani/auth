import { RemovalPolicy } from "aws-cdk-lib";
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
} from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import * as dotenv from "dotenv";
dotenv.config();

export class S3Resources extends Construct {
  public readonly frontendAssets: Bucket;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.frontendAssets = new Bucket(this, "WebAppBucket", {
      bucketName: `${process.env.FRONTEND_BUCKET_NAME}`,
      websiteIndexDocument: "index.html",
      blockPublicAccess: BlockPublicAccess.BLOCK_ACLS_ONLY,
      encryption: BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY, // Not for production
      autoDeleteObjects: true, // Not for production
    });
  }
}

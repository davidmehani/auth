import { Duration } from "aws-cdk-lib";
import { Distribution, OriginAccessIdentity, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export interface CloudFrontResourcesProps {
    frontendBucket: Bucket;
}

export class CloudFrontResources extends Construct {
    public readonly distribution: Distribution;

    constructor(scope: Construct, id: string, props: CloudFrontResourcesProps) {
        super(scope, id);

        this.distribution = this.createCloudFrontDistribution(props);        
    }

    private createCloudFrontDistribution(props: CloudFrontResourcesProps): Distribution {
        const oai = new OriginAccessIdentity(this, 'OriginAccessIdentity');
        const distribution = new Distribution(this, 'Distribution', {
            defaultBehavior: {
                origin: S3BucketOrigin.withOriginAccessIdentity(props.frontendBucket, {
                    originAccessIdentity: oai
                }),
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
            defaultRootObject: 'index.html',
            errorResponses: [
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: Duration.minutes(0),
                },
            ],
        });

        props.frontendBucket.grantRead(oai);
        return distribution
    }
}
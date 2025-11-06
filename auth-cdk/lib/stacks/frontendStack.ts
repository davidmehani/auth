import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { CloudFrontResources } from "../resources/frontendStack/cloudFrontResources";
import { Construct } from "constructs";
import { S3Resources } from "../resources/frontendStack/s3Resources";

export interface FrontendStackProps extends StackProps {

}

/**
 * Stack to define frontend components
 */
export class FrontendStack extends Stack {
    public readonly cloudFrontResources: CloudFrontResources;
    public readonly s3Resources: S3Resources

    constructor(scope: Construct, id: string, props: FrontendStackProps) {
        super(scope, id, props);

        this.s3Resources = new S3Resources(this, 'S3Resources', {});

        this.cloudFrontResources = new CloudFrontResources(this, 'FrontendResources', {
            frontendBucket: this.s3Resources.frontendAssets,
        });

        new CfnOutput(this, 'DistributionDomainName', {
            value: this.cloudFrontResources.distribution.domainName,
            description: "CloudFront Distribution Domain Name"
        });
    }
}
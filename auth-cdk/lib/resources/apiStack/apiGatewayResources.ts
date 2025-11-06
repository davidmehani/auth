import {
  AuthorizationType,
  Cors,
  IdentitySource,
  LambdaIntegration,
  RequestAuthorizer,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { LambdaResources } from "./lambdaResources";

export interface ApiGatewayResourcesProps {
  readonly lambdaResources: LambdaResources;
}

export class ApiGatewayResources extends Construct {
  public readonly api: RestApi;

  constructor(scope: Construct, id: string, props: ApiGatewayResourcesProps) {
    super(scope, id);

    this.api = this.createApiGateway(props);
  }

  private createApiGateway(props: ApiGatewayResourcesProps): RestApi {
    const api = new RestApi(this, "HelloApi", {
      restApiName: "HelloApi",
      defaultCorsPreflightOptions: {
        allowOrigins: [`${process.env.CLOUDFRONT_DOMAIN!}`],
        allowMethods: Cors.ALL_METHODS,
        allowCredentials: true,
      },
    });

    const authorizer = new RequestAuthorizer(this, "RequestAuthorizer", {
      handler: props.lambdaResources.authorizerFunction,
      identitySources: [IdentitySource.header("Cookie")],
    });

    const resource = api.root.addResource("hello");
    const integration = new LambdaIntegration(
      props.lambdaResources.lambdaFunction,
      {
        proxy: true,
      },
    );
    resource.addMethod("GET", integration, {
      authorizer: authorizer,
      authorizationType: AuthorizationType.CUSTOM,
    });

    const codeExchangeResource = api.root.addResource("exchange-code");
    const codeExchangeIntegration = new LambdaIntegration(
      props.lambdaResources.codeExchangeFunction,
      {
        proxy: true,
      },
    );
    codeExchangeResource.addMethod("POST", codeExchangeIntegration, {
      authorizationType: AuthorizationType.NONE,
    });
    return api;
  }
}
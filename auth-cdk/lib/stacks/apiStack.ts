import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LambdaResources } from '../resources/apiStack/lambdaResources';
import { ApiGatewayResources } from '../resources/apiStack/apiGatewayResources';
import { BaseStack } from './baseStack';

export interface ApiStackProps extends StackProps {
  readonly baseStack: BaseStack;
}

/**
 * Stack to define API and Auth components
 */
export class ApiStack extends Stack {
  public readonly lambdaResources: LambdaResources;
  public readonly apiGatewayResources: ApiGatewayResources;
  
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    this.lambdaResources = new LambdaResources(this, 'LambdaResources', {
      userPool: props.baseStack.cognitoResources.userPool,
      userPoolClient: props.baseStack.cognitoResources.userPoolClient,
      userTable: props.baseStack.userTable,
    });

    this.apiGatewayResources = new ApiGatewayResources(this, 'ApiGatewayResources', {
      lambdaResources: this.lambdaResources,
    });
  }
}

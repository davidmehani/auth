import { Construct } from "constructs";
import { UserPool, UserPoolClient, UserPoolOperation } from 'aws-cdk-lib/aws-cognito';
import { AUTHORIZER_FUNCTION_PATH, HELLO_FUNCTION_PATH, POST_CONFIRMATION_FUNCTION_PATH } from '../../../config/lambdaPathsConfig';
import { DefaultNodejsFunction } from "../../constructs/defaultNodejsFunction";
import { Table } from "aws-cdk-lib/aws-dynamodb";


export interface LambdaResourcesProps {
    readonly userPool: UserPool;
    readonly userPoolClient: UserPoolClient;
    readonly userTable: Table;
}

export class LambdaResources extends Construct {
    public readonly lambdaFunction: DefaultNodejsFunction;
    public readonly authorizerFunction: DefaultNodejsFunction;

    constructor(scope: Construct, id: string, props: LambdaResourcesProps) {
        super(scope, id);

        this.lambdaFunction = new DefaultNodejsFunction(this, 'HelloWorldFunction', {
            functionName: 'HelloFunction',
            relativeEntry: HELLO_FUNCTION_PATH,
        });

        this.authorizerFunction = new DefaultNodejsFunction(this, 'AuthorizerFunction', {
            functionName: 'AuthorizerFunction',
            relativeEntry: AUTHORIZER_FUNCTION_PATH,
            environment: {
                USER_POOL_ID: props.userPool.userPoolId,
                USER_POOL_CLIENT_ID: props.userPoolClient.userPoolClientId,
            }
        });
        props.userTable.grantReadWriteData(this.authorizerFunction);
    }
}
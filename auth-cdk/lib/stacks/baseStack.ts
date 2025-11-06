import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { LambdaResources } from "../resources/baseStack/lambdaResources";
import { CognitoResources } from "../resources/baseStack/cognitoResources";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { table } from "console";

export interface BaseStackProps extends StackProps {

}

export class BaseStack extends Stack {
    public readonly userTable: Table;
    public readonly cognitoResources: CognitoResources;

    constructor(scope: Construct, id: string, props: BaseStackProps) {
        super(scope, id, props);

        const lambdaResources = new LambdaResources(this, 'CongitoLambdaResources', {});

        this.cognitoResources = new CognitoResources(this, 'CognitoResources', {
            postConfirmationFunction: lambdaResources.postConfirmationFunction,
        });

        this.userTable = new Table(this, 'UsersTable', {
            tableName: 'Users',
            partitionKey: { name: 'userId', type: AttributeType.STRING },
            removalPolicy: RemovalPolicy.DESTROY, // NOT for production
            billingMode: BillingMode.PAY_PER_REQUEST
        });
        this.userTable.grantReadWriteData(lambdaResources.postConfirmationFunction);
    }
}
import { Construct } from "constructs";
import {
  UserPool,
  UserPoolClient,
  UserPoolDomain,
} from "aws-cdk-lib/aws-cognito";
import {
  AUTHORIZER_FUNCTION_PATH,
  CODE_EXCHANGE_FUNCTION_PATH,
  HELLO_FUNCTION_PATH,
} from "../../../config/lambdaPathsConfig";
import { DefaultNodejsFunction } from "../../constructs/defaultNodejsFunction";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { ParameterTier, StringParameter } from "aws-cdk-lib/aws-ssm";
import * as dotenv from "dotenv";
dotenv.config();

export interface LambdaResourcesProps {
  readonly userPool: UserPool;
  readonly userPoolClient: UserPoolClient;
  readonly userPoolDomain: UserPoolDomain;
  readonly userTable: Table;
}

export class LambdaResources extends Construct {
  public readonly lambdaFunction: DefaultNodejsFunction;
  public readonly authorizerFunction: DefaultNodejsFunction;
  public readonly codeExchangeFunction: DefaultNodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaResourcesProps) {
    super(scope, id);

    const jwtAccessSecretParam = new StringParameter(
      this,
      "JwtAccessSecretParam",
      {
        parameterName: "/jwtAccessSecret",
        stringValue: `${process.env.JWT_ACCESS_SECRET}`,
        tier: ParameterTier.STANDARD,
      },
    );

    const jwtRefreshSecretParam = new StringParameter(
      this,
      "JwtRefreshSecretParam",
      {
        parameterName: "/jwtRefreshSecret",
        stringValue: `${process.env.JWT_REFRESH_SECRET}`,
        tier: ParameterTier.STANDARD,
      },
    );

    this.lambdaFunction = new DefaultNodejsFunction(
      this,
      "HelloWorldFunction",
      {
        functionName: "HelloFunction",
        relativeEntry: HELLO_FUNCTION_PATH,
      },
    );

    this.authorizerFunction = new DefaultNodejsFunction(
      this,
      "AuthorizerFunction",
      {
        functionName: "AuthorizerFunction",
        relativeEntry: AUTHORIZER_FUNCTION_PATH,
        environment: {
          USER_POOL_ID: props.userPool.userPoolId,
          USER_POOL_CLIENT_ID: props.userPoolClient.userPoolClientId,
          JWT_ACCESS_SECRET_PARAM: jwtAccessSecretParam.parameterName,
          JWT_REFRESH_SECRET_PARAM: jwtRefreshSecretParam.parameterName,
        },
      },
    );

    this.codeExchangeFunction = new DefaultNodejsFunction(
      this,
      "CodeExchangeFunction",
      {
        functionName: "CodeExchangeFunction",
        relativeEntry: CODE_EXCHANGE_FUNCTION_PATH,
        environment: {
          COGNITO_CLIENT_ID: props.userPoolClient.userPoolClientId,
          COGNITO_DOMAIN: `https://${props.userPoolDomain.domainName}`,
          JWT_ACCESS_SECRET_PARAM: jwtAccessSecretParam.parameterName,
          JWT_REFRESH_SECRET_PARAM: jwtRefreshSecretParam.parameterName,
        },
      },
    );

    jwtAccessSecretParam.grantRead(this.authorizerFunction);
    jwtAccessSecretParam.grantRead(this.codeExchangeFunction);

    jwtRefreshSecretParam.grantRead(this.authorizerFunction);
    jwtRefreshSecretParam.grantRead(this.codeExchangeFunction);

    props.userTable.grantReadWriteData(this.authorizerFunction);
    props.userTable.grantReadWriteData(this.codeExchangeFunction);
  }
}

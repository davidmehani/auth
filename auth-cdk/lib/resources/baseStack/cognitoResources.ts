import { CfnOutput, RemovalPolicy } from "aws-cdk-lib";
import {
  OAuthScope,
  ProviderAttribute,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
  UserPoolDomain,
  UserPoolIdentityProviderGoogle,
  UserPoolOperation,
} from "aws-cdk-lib/aws-cognito";
import { Function as LambdaFn } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export interface CognitoResourcesProps {
  postConfirmationFunction: LambdaFn;
}

export class CognitoResources extends Construct {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;
  public readonly userPoolDomain: UserPoolDomain;

  constructor(scope: Construct, id: string, props: CognitoResourcesProps) {
    super(scope, id);

    this.userPool = this.createUserPool(props);

    this.userPoolClient = this.createUserPoolClient(this.userPool);

    this.userPoolDomain = new UserPoolDomain(this, "UserPoolDomain", {
      userPool: this.userPool,
      cognitoDomain: {
        domainPrefix: `${process.env.COGNITO_DOMAIN!}`,
      },
    });

    new CfnOutput(this, "UserPoolId", {
      value: this.userPool.userPoolId,
      description: "UserPoolId",
    });
    new CfnOutput(this, "UserPoolClientId", {
      value: this.userPoolClient.userPoolClientId,
      description: "UserPoolClientId",
    });
  }

  private createUserPool(props: CognitoResourcesProps): UserPool {
    const userPool = new UserPool(this, "UserPool", {
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      userPoolName: "UserPool",
      removalPolicy: RemovalPolicy.DESTROY, // Not for production
    });

    userPool.addTrigger(
      UserPoolOperation.POST_CONFIRMATION,
      props.postConfirmationFunction,
    );

    return userPool;
  }

  private createUserPoolClient(userPool: UserPool) {
    const googleIdp = this.createGoogleIdp(userPool);

    return new UserPoolClient(this, "UserPoolClient", {
      userPool: userPool,
      generateSecret: false, // Usually false for web apps
      authFlows: { userPassword: true },
      oAuth: {
        flows: {
          authorizationCodeGrant: true, // Use code grant for secure apps
        },
        scopes: [OAuthScope.OPENID, OAuthScope.PROFILE, OAuthScope.EMAIL],
        callbackUrls: [
          `${process.env.CALLBACK_URL!}`
        ],
        logoutUrls: ["https://localhost:3000/logout"],
      },
      supportedIdentityProviders: [
        UserPoolClientIdentityProvider.COGNITO,
        UserPoolClientIdentityProvider.custom(googleIdp.providerName),
      ],
    });
  }

  private createGoogleIdp(userPool: UserPool): UserPoolIdentityProviderGoogle {
    return new UserPoolIdentityProviderGoogle(this, "Google", {
      userPool: userPool,
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      attributeMapping: {
        email: ProviderAttribute.GOOGLE_EMAIL,
        familyName: ProviderAttribute.GOOGLE_FAMILY_NAME,
        givenName: ProviderAttribute.GOOGLE_GIVEN_NAME,
        phoneNumber: ProviderAttribute.GOOGLE_PHONE_NUMBERS,
      },
      scopes: ["email", "openid", "profile"],
    });
  }
}

import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import jwt, { JwtHeader } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const db = new DynamoDBClient({});

// Cognito User Pool info from environment
const { USER_POOL_ID, USER_POOL_CLIENT_ID, AWS_REGION} = process.env!;

// JWKS client
const client = jwksClient({
  jwksUri: `https://cognito-idp.${AWS_REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
});

// Async helper to get signing key
async function getSigningKeyAsync(kid: string): Promise<string> {
  return new Promise((resolve, reject) => {
    client.getSigningKey(kid, (err, key) => {
      if (err) return reject(err);
      if (!key) return reject(new Error(`Signing key not found for kid: ${kid}`));
      resolve(key.getPublicKey());
    });
  });
}

export const handler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  const token = event.authorizationToken?.replace('Bearer ', '');
  if (!token) throw new Error('No token provided');

  let decodedToken: any;

  try {
    // Decode header first to get kid
    const decodedHeader = jwt.decode(token, { complete: true }) as { header: JwtHeader } | null;
    if (!decodedHeader) throw new Error('Invalid token');

    const kid = decodedHeader.header.kid;
    const signingKey = await getSigningKeyAsync(kid!);

    decodedToken = jwt.verify(token, signingKey, {
      audience: USER_POOL_CLIENT_ID,
      issuer: `https://cognito-idp.${AWS_REGION}.amazonaws.com/${USER_POOL_ID}`,
    });
  } catch (err) {
    console.error('JWT verification failed', err);
    throw new Error('Unauthorized');
  }

  const userId = (decodedToken as any)['cognito:username'];
  const methodArn = event.methodArn;

  // check if user exists in DynamoDB
  const result = await db.send(new GetItemCommand({
    TableName: 'Users',
    Key: { userId: { S: userId } },
  }));

  const effect = result.Item ? 'Allow' : 'Deny';
  return {
    principalId: userId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: methodArn,
        }
      ]
    },
    context: {
        role: result.Item?.role?.S,
        email: decodedToken.email,
    }
  };
};

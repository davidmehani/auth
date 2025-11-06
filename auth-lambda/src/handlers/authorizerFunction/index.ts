import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  APIGatewayAuthorizerResult,
  APIGatewayRequestAuthorizerEvent,
} from "aws-lambda";
import jwt from "jsonwebtoken";
import { Token } from "../../model/token";
import { UsersDao } from "../../dao/usersDao";
import {
  createAccessToken,
  createRefreshToken,
  getTokensFromCookies,
} from "../../util/jwtUtil";
import { SSMClient } from "@aws-sdk/client-ssm";
import { SsmDao } from "../../dao/ssmDao";

const ssm = new SsmDao(new SSMClient({}));

const db = new DynamoDBClient({});
const dao = new UsersDao(db);

export const handler = async (
  event: APIGatewayRequestAuthorizerEvent,
): Promise<APIGatewayAuthorizerResult> => {
  console.log(event);

  const { accessToken, refreshToken } = getTokensFromCookies(event);
  const { accessSecret, refreshSecret } = await ssm.getJwtSecrets();

  let userId: string;
  let email: string;
  let newAccessToken: string | undefined;
  let newRefreshToken: string | undefined;

  try {
    if (!accessToken) throw new Error("No access token provided");

    const decodedToken = jwt.verify(accessToken, accessSecret) as Token;
    userId = decodedToken.userId;
  } catch (err) {
    console.log(err);
    if (err instanceof jwt.TokenExpiredError) {
      // access token expired — check refresh token
      if (!refreshToken) throw new Error("No refresh token provided");

      // Verify refresh token
      try {
        const decodedRefresh = jwt.verify(refreshToken, refreshSecret) as Token;
        userId = decodedRefresh.userId;
        email = decodedRefresh.email;
      } catch (err) {
        console.log(err);
        throw new Error("Invalid refresh token");
      }

      // Check that the refresh token exists in DB and not revoked
      const user = await dao.getUser(userId);
      if (!user || user.refreshToken !== refreshToken) {
        throw new Error("Refresh token revoked");
      }

      // Generate new tokens
      newAccessToken = createAccessToken(userId, email, accessSecret);
      newRefreshToken = createRefreshToken(userId, email, refreshSecret);

      // Update refresh token in DB
      await dao.updateTokenForUser(userId, newRefreshToken);
    } else {
      throw new Error("Unauthorized");
    }
  }

  const methodArn = event.methodArn;

  // check if user exists in DynamoDB
  const result = await dao.getUser(userId);

  const effect = result ? "Allow" : "Deny";
  return {
    principalId: userId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: methodArn,
        },
      ],
    },
    context: {
      state: "Authorized",
      refreshedAccessToken: newAccessToken,
      refreshedRefreshToken: newRefreshToken,
    },
  };
};

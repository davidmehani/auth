import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import axios from "axios";
import { UsersDao } from "../../dao/usersDao";
import {
  createAccessToken,
  createAuthCookies,
  createRefreshToken,
} from "../../util/jwtUtil";
import { ResponseBuilder } from "../../util/responseBuilder";
import { SsmDao } from "../../dao/ssmDao";
import { SSMClient } from "@aws-sdk/client-ssm";

const db = new DynamoDBClient({});
const dao = new UsersDao(db);
const ssm = new SsmDao(new SSMClient({}));
const { COGNITO_DOMAIN, COGNITO_CLIENT_ID, AWS_REGION } = process.env!;

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const { accessSecret, refreshSecret } = await ssm.getJwtSecrets();

    const { code, redirect_uri } = JSON.parse(event.body || "{}");
    if (!code || !redirect_uri) {
      return ResponseBuilder.clientError("Missing auth parameters").build();
    }

    if (!COGNITO_DOMAIN! || !COGNITO_CLIENT_ID!) {
      console.error("Missing environment variables");
      return ResponseBuilder.error("Missing Environment variables").build();
    }

    // Exchange code for tokens
    const tokenUrl = `${COGNITO_DOMAIN}.auth.${AWS_REGION}.amazoncognito.com/oauth2/token`;

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: COGNITO_CLIENT_ID,
      redirect_uri: redirect_uri,
      code,
    });

    const authHeader = {};

    const tokenResponse = await axios.post(tokenUrl, body.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      ...authHeader,
    });

    const tokens = tokenResponse.data;
    const idTokenPayload = JSON.parse(
      Buffer.from(tokens.id_token.split(".")[1], "base64").toString("utf8"),
    );
    const userId = idTokenPayload["cognito:username"];

    const accessJwt = createAccessToken(
      userId,
      idTokenPayload.email,
      accessSecret,
    );

    const refreshJwt = createRefreshToken(
      userId,
      idTokenPayload.email,
      refreshSecret,
    );

    await dao.updateTokenForUser(userId, refreshJwt);

    return ResponseBuilder.success(null)
      .cookies(
        createAuthCookies({ accessToken: accessJwt, refreshToken: refreshJwt }),
      )
      .build();
  } catch (error) {
    console.error(error);
    return ResponseBuilder.error("Code exchange failed").build();
  }
};

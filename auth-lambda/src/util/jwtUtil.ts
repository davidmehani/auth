import { APIGatewayRequestAuthorizerEvent } from "aws-lambda";
import jwt from "jsonwebtoken";
import { Cookies } from "../model/cookies";

export const createAccessToken = (
  userId: string,
  email: string,
  secret: string,
): string =>
  jwt.sign(
    {
      userId,
      email: email,
    },
    secret,
    {
      expiresIn: "15m",
      issuer: "my-app",
    },
  );

export const createRefreshToken = (
  userId: string,
  email: string,
  secret: string,
): string =>
  jwt.sign(
    {
      userId,
      email: email,
    },
    secret,
    {
      expiresIn: "1h",
      issuer: "my-app",
    },
  );

export const createAuthCookies = (cookies: Cookies): string[] => {
  return [
    `myAppSession=${cookies.accessToken}; HttpOnly; Secure; Path=/; SameSite=None`, // not for prod
    `myAppSessionRefresh=${cookies.refreshToken}; HttpOnly; Secure; Path=/; SameSite=None`,
  ];
};

export const getTokensFromCookies = (
  event: APIGatewayRequestAuthorizerEvent,
): Cookies => {
  const cookieHeader = event.headers?.Cookie || event.headers?.cookie;

  const accessToken = cookieHeader
    ?.split(";")
    .find((c) => c.trim().startsWith("myAppSession="))
    ?.split("=")[1];

  const refreshToken = cookieHeader
    ?.split(";")
    .find((c) => c.trim().startsWith("myAppSessionRefresh="))
    ?.split("=")[1];

  return { accessToken, refreshToken };
};

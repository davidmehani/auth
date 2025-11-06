import {
  APIGatewayEventRequestContext,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import { DEFAULT_CORS_HEADERS } from "../constants";
import { createAuthCookies } from "./jwtUtil";

interface CustomRequestContext extends APIGatewayEventRequestContext {
  refreshedAccessToken?: string;
  refreshedRefreshToken?: string;
}

export class ResponseBuilder<T> {
  private _statusCode = 200;
  private _body!: T;
  private _headers: Record<string, string> = {};
  private _cookies: string[] = [];

  status(code: number): this {
    this._statusCode = code;
    return this;
  }

  body(body: T): this {
    this._body = body;
    return this;
  }

  header(key: string, value: string): this {
    this._headers[key] = value;
    return this;
  }

  headers(headers: Record<string, string>): this {
    this._headers = { ...this._headers, ...headers };
    return this;
  }

  cookie(cookie: string): this {
    this._cookies.push(cookie);
    return this;
  }

  cookies(cookies: string[]): this {
    this._cookies.push(...cookies);
    return this;
  }

  fromContext(event: APIGatewayProxyEvent): this {
    const context = event.requestContext as CustomRequestContext;

    if (context.refreshedAccessToken && context.refreshedRefreshToken) {
      this._cookies.push(
        ...createAuthCookies({
          accessToken: context.refreshedAccessToken,
          refreshToken: context.refreshedRefreshToken,
        }),
      );
    }
    return this;
  }

  build(): APIGatewayProxyResult {
    return {
      statusCode: this._statusCode,
      headers: { ...DEFAULT_CORS_HEADERS, ...this._headers },
      multiValueHeaders: this._cookies.length
        ? { "Set-Cookie": this._cookies }
        : undefined,
      body: JSON.stringify(this._body),
    };
  }

  static success<T>(body: T): ResponseBuilder<T> {
    return new ResponseBuilder<T>().body(body).status(200);
  }

  static error(
    message: string,
    status = 500,
  ): ResponseBuilder<{ error: string }> {
    return new ResponseBuilder<{ error: string }>()
      .body({ error: message })
      .status(status);
  }

  static clientError(
    message: string,
    status = 400,
  ): ResponseBuilder<{ error: string }> {
    return new ResponseBuilder<{ error: string }>()
      .body({ error: message })
      .status(status);
  }

  static unauhtorizedError(status = 403): ResponseBuilder<{ error: string }> {
    return new ResponseBuilder<{ error: string }>()
      .body({ error: "Unauthorized" })
      .status(status);
  }
}

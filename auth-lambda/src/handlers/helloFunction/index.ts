import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import { ResponseBuilder } from "../../util/responseBuilder";

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  console.log(event);

  const message = { message: "hello world" };

  return ResponseBuilder.success(message).fromContext(event).build();
};

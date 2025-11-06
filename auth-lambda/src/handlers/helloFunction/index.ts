import { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import * as responseUtil from '../../util/responseUtil';

export const handler: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
  console.log(event);
  const message = {message: 'hello world'};
  return responseUtil.success(message);
};

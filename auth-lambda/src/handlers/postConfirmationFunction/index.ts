import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Context, PostConfirmationTriggerEvent } from "aws-lambda";
import { UsersDao } from "../../dao/usersDao";

const db = new DynamoDBClient({});
const dao = new UsersDao(db);
export const handler = async (
  event: PostConfirmationTriggerEvent,
  context: Context,
) => {
  const userId = event.userName; // Cognito sub
  const email = event.request.userAttributes.email;
  console.log(event);
  console.log(context);
  await dao.createUser(userId, email);

  console.log(`Created user record for ${userId} in Users`);

  return event;
};

import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { PostConfirmationTriggerEvent, Context } from "aws-lambda";

const db = new DynamoDBClient({});

export const handler = async (event: PostConfirmationTriggerEvent, context: Context) => {
  const userId = event.userName; // Cognito sub
  const email = event.request.userAttributes.email;
  console.log(event);

  await db.send(new PutItemCommand({
    TableName: 'Users',
    Item: {
      userId: { S: userId },
      email: { S: email },
      createdAt: { N: Date.now().toString() },
    },
  }));

  console.log(`Created user record for ${userId} in Users`);

  return event;
};

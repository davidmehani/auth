import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { User } from "../model/user";

const TABLE_NAME = "Users";

export class UsersDao {
  private db: DynamoDBClient;
  constructor(db: DynamoDBClient) {
    this.db = db;
  }

  public async updateTokenForUser(userId: string, token: string) {
    await this.db.send(
      new UpdateItemCommand({
        TableName: TABLE_NAME,
        Key: { userId: { S: userId } },
        UpdateExpression: "SET refreshToken = :rt, updatedAt = :u",
        ExpressionAttributeValues: {
          ":rt": { S: token! },
          ":u": { N: Date.now().toString() },
        },
      }),
    );
  }

  public async getUser(userId: string): Promise<User | null> {
    const result = await this.db.send(
      new GetItemCommand({
        TableName: "Users",
        Key: { userId: { S: userId } },
      }),
    );

    if (!result.Item) {
      return null;
    }

    // Convert DynamoDB format to plain JS
    const user = unmarshall(result.Item) as User;
    return user;
  }

  public async createUser(userId: string, email: string) {
    await this.db.send(
      new PutItemCommand({
        TableName: "Users",
        Item: {
          userId: { S: userId },
          email: { S: email },
          createdAt: { N: Date.now().toString() },
          updatedAt: { N: Date.now().toString() },
        },
      }),
    );
  }
}

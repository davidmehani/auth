import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";

const JWT_ACCESS_SECRET_PARAM = process.env.JWT_ACCESS_SECRET_PARAM!;
const JWT_REFRESH_SECRET_PARAM = process.env.JWT_ACCESS_SECRET_PARAM!;

export class SsmDao {
  private client: SSMClient;
  constructor(client: SSMClient) {
    this.client = client;
  }

  public async getJwtSecrets(): Promise<{
    accessSecret: string;
    refreshSecret: string;
  }> {
    const accessSecretResponse = await this.client.send(
      new GetParameterCommand({
        Name: JWT_ACCESS_SECRET_PARAM,
        WithDecryption: true, // needed for SecureString
      }),
    );

    const refreshSecretResponse = await this.client.send(
      new GetParameterCommand({
        Name: JWT_REFRESH_SECRET_PARAM,
        WithDecryption: true, // needed for SecureString
      }),
    );

    const accessSecret = accessSecretResponse.Parameter?.Value;
    const refreshSecret = refreshSecretResponse.Parameter?.Value;
    if (!accessSecret || !refreshSecret) {
      console.error("Error getting secrets from ssm");
      return Promise.reject();
    }
    return { accessSecret, refreshSecret };
  }
}

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { env } from "src/env";

export const dbClient = new DynamoDBClient({
  region: env.DYNAMO_DB_REGION ?? "us-east-2",
  credentials: {
    accessKeyId: env.AMAZON_ACCESS_KEY_ID,
    secretAccessKey: env.AMAZON_SECRET_ACCESS_KEY,
  },
});

// This is a wrapper around the DynamoDBClient that makes it easier to work with documents
export const ddbDocClient = DynamoDBDocumentClient.from(dbClient);

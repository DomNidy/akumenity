import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { env } from "~/env";

export const dbClient = new DynamoDBClient({
  region: env.DYNAMO_DB_REGION ?? "us-east-2",
});

// This is a wrapper around the DynamoDBClient that makes it easier to work with documents
export const ddbDocClient = DynamoDBDocumentClient.from(dbClient);

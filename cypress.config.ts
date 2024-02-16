import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // https://docs.cypress.io/api/plugins/configuration-api
    setupNodeEvents(on, config) {
      // Tasks are a way to run code in the Node.js environment
      on("task", {
        async clearTestTable({
          dbRegion,
          accessKeyId,
          secretAccessKey,
          tableName,
        }: {
          dbRegion: string;
          accessKeyId: string;
          secretAccessKey: string;
          tableName: string;
        }) {
          console.log(
            "Clearing test table with vals",
            dbRegion,
            accessKeyId,
            secretAccessKey,
            tableName,
          );

          // Create dynamo db client
          const dbClient = new DynamoDBClient({
            region: dbRegion,
            credentials: {
              accessKeyId: accessKeyId,
              secretAccessKey: secretAccessKey,
            },
          });

          // This is a wrapper around the DynamoDBClient that makes it easier to work with documents
          const ddbDocClient = DynamoDBDocumentClient.from(dbClient);

          // If the table name does not contain the string 'Test', do not delete (just to be safe)
          if (!tableName.includes("Test")) {
            throw new Error(
              "Table name does not contain 'Test', we will not delete it!",
            );
          }

          // Get PKs of all items
          const scanPKs = await ddbDocClient.send(
            new ScanCommand({
              TableName: tableName,
              AttributesToGet: ["PK", "SK"],
            }),
          );

          // If there are no items to delete, return
          if (scanPKs.Items === undefined) {
            console.log("No items to delete in table.");
            return null;
          }

          // Delete all items
          // Note: because our table is small, it should be fine to just send out many requests like this
          for (const item of scanPKs.Items) {
            console.log(item, "ITEM");
            const deleteCommand = new DeleteCommand({
              TableName: tableName,
              Key: {
                PK: item.PK as string,
                SK: item.SK as string,
              },
            });

            void ddbDocClient.send(deleteCommand).then((res) => {
              console.log("Deleted item", res);
            });
          }

          return null;
        },
      });
    },
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
  },
});

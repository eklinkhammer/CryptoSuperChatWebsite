import dynalite from "dynalite";
import { DynamoDBClient, CreateTableCommand, DeleteTableCommand } from "@aws-sdk/client-dynamodb";
const DYNAMO_TABLENAME = "CryptoSuperChatStreamers";
const DYNAMO_REGION = "us-east-1";

const DYNAMO_PORT = 8000;
const DYNAMO_ENDPOINT = `http://localhost:${DYNAMO_PORT}`;
let dynaliteServer: ReturnType<typeof dynalite>;
const client = new DynamoDBClient({ region: DYNAMO_REGION, endpoint: DYNAMO_ENDPOINT });

beforeAll(async () => {
  dynaliteServer = dynalite({ createTableMs: 0 });
  await new Promise<void>((resolve) => dynaliteServer.listen(DYNAMO_PORT, resolve));

  await client.send(
    new CreateTableCommand({
		TableName: DYNAMO_TABLENAME,
		AttributeDefinitions: [
			{ AttributeName: "StreamerId", AttributeType: "S" },
			{ AttributeName: "SortKey", AttributeType: "S" },
		],
		KeySchema: [
			{ AttributeName: "StreamerId", KeyType: "HASH" },
			{ AttributeName: "SortKey", KeyType: "RANGE" },
		],
		ProvisionedThroughput: {
			ReadCapacityUnits: 1,
			WriteCapacityUnits: 1,
		},
    })
  );
});

afterAll(async () => {
  await client.send(new DeleteTableCommand({ TableName: DYNAMO_TABLENAME }));
  await new Promise<void>((resolve) => dynaliteServer.close(resolve));
});


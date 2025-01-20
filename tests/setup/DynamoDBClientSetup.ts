import dynalite from "dynalite";
import { DynamoDBClient, CreateTableCommand, DeleteTableCommand, ListTablesCommand } from "@aws-sdk/client-dynamodb";
const DYNAMO_PORT = 8000;
const DYNAMO_ENDPOINT = `http://localhost:${DYNAMO_PORT}`;
const DYNAMO_TABLENAME = "CryptoSuperChatStreamers";
const DYNAMO_REGION = "us-east-1";

const dynaliteServer = dynalite({ createTableMs: 0 });
export const client = new DynamoDBClient({
	region: DYNAMO_REGION, 
	endpoint: DYNAMO_ENDPOINT,
});

export async function startDynamo() {
	await new Promise<void>((resolve) => {
		dynaliteServer.listen(DYNAMO_PORT, () => {
			resolve();
		});
	});
}

export async function createTable() {
	await client.send(new CreateTableCommand({
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
	}));
}

export async function stopDynamo() {
	// Clean up all tables
	const listTablesCommand = new ListTablesCommand({});
	const { TableNames } = await client.send(listTablesCommand);

	if (TableNames) {
		for (const tableName of TableNames) {
			const deleteTableCommand = new DeleteTableCommand({ TableName: tableName });
			await client.send(deleteTableCommand);
		}
	}

	await new Promise<void>((resolve) => {
		dynaliteServer.close(() => {
			resolve();
		})
	});
}


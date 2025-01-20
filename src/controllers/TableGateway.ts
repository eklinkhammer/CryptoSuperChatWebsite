import { 
	DynamoDBClient,
	GetItemCommand,
	GetItemCommandOutput,
	PutItemCommand,
	AttributeValue,
	QueryCommand,
	QueryCommandOutput,
	DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

export class TableGateway {
	private readonly TABLE_NAME = "CryptoSuperChatStreamers";
	private readonly PARTITION_KEY = "StreamerId";
	private readonly HASH_KEY = "SortKey";

	private client: DynamoDBClient;

	constructor(client: DynamoDBClient) {
		this.client = client;
	}

	private marshallMessage(message: { streamerId: string }, sortKey: string) {
		const marshalledItem = marshall({...message, [this.PARTITION_KEY]: message.streamerId, [this.HASH_KEY]: sortKey});
		delete marshalledItem["streamerId"];

		return marshalledItem;
	}

	private unmarshallMessage(record: Record<string, AttributeValue>) {
		const unmarshalledMessage = unmarshall(record);
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { StreamerId, SortKey, ...rest } = unmarshalledMessage;
		return {
			streamerId: StreamerId,
			...rest
		};
	}

	async get<T>(streamerId: string, sortKey: string): Promise<T | undefined> {
		return await this.client.send(new GetItemCommand({
			TableName: this.TABLE_NAME,
			Key: {
				[this.PARTITION_KEY]: { S: streamerId },
				[this.HASH_KEY]: {S: sortKey},
			},
		})).then((output: GetItemCommandOutput) => {
			if (!output.Item) {
				return undefined;
			}

			return this.unmarshallMessage(output.Item) as T;
		});
	}

	async query<T>(streamerId: string, sortKey: string): Promise<T[]> {
		const params = {
			TableName: this.TABLE_NAME,
			KeyConditionExpression: "StreamerId = :streamerId AND begins_with(SortKey, :sortKey)",
			ExpressionAttributeValues: {
				":streamerId": { S: streamerId },
				":sortKey": { S: sortKey },
			},
		};
		const output: QueryCommandOutput = await this.client.send(new QueryCommand(params));
		if (output.Items) {
			return output.Items.map((item) => this.unmarshallMessage(item) as T);
		} else {
			return [];
		}
	}

	async save(message: { streamerId: string }, sortKey: string) {
		await this.client.send(new PutItemCommand({
			TableName: this.TABLE_NAME,
			Item: this.marshallMessage(message, sortKey),
		}))
	}

	async delete(message: { streamerId: string }, sortKey: string) {
		await this.client.send(new DeleteItemCommand({
			TableName: this.TABLE_NAME,
			Key: {
				[this.PARTITION_KEY]: { S: message.streamerId },
				[this.HASH_KEY]: {S: sortKey},
			},
		}));
	}
}


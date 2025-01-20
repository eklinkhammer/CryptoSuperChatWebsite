import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { StreamerGateway } from "./StreamerGateway";
import { TableGateway } from "./TableGateway";
import { MessageGateway } from "./MessageGateway";
import { InvoiceController } from "./InvoiceController";

const client = new DynamoDBClient({
	region: "us-east-1", 
});
const tableGateway = new TableGateway(client);
export const messageGateway = new MessageGateway(tableGateway);
export const streamerGateway = new StreamerGateway(tableGateway);
export const invoiceController = new InvoiceController(messageGateway, streamerGateway);


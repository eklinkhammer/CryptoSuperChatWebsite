import { UnpaidMessage, PaidMessage } from "../models/Message";
import { TableGateway } from "./TableGateway";

export class MessageGateway {
	private readonly PAID_HASH_KEY_VALUE = "PAID";
	private tableGateway: TableGateway;

	constructor(gateway: TableGateway) {
		this.tableGateway = gateway;
	}

	async getUnpaidMessage(streamerId: string, invoiceId: string): Promise<UnpaidMessage | undefined> {
		return this.tableGateway.get<UnpaidMessage>(streamerId, invoiceId);
	}

	async saveUnpaidMessage(message: UnpaidMessage) {
		const existingMessage = await this.getUnpaidMessage(message.streamerId, message.invoiceId);

		if (existingMessage === undefined) {
			return this.tableGateway.save(message, message.invoiceId);
		}

		// JS equality check lol
		if (message.userId !== existingMessage.userId 
			|| message.amount !== existingMessage.amount
				|| message.userMessage !== existingMessage.userMessage) {
					throw new Error("Conflicting message with same invoiceId");
				}
	}

	async savePaidMessage(message: PaidMessage) {
		this.tableGateway.save(message, `${this.PAID_HASH_KEY_VALUE}-${message.invoiceId}`);
	}

	async getPaidMessages(streamerId: string): Promise<PaidMessage[]> {
		return this.tableGateway.query<PaidMessage>(streamerId, this.PAID_HASH_KEY_VALUE);
	}

	async deleteUnpaidMessage(message: UnpaidMessage) {
		this.tableGateway.delete(message, message.invoiceId);
	}
}

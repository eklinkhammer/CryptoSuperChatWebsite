import { StreamerConfig } from "../models/StreamerConfig";
import { UnpaidMessage, PaidMessage } from "../models/Message";
import { MessageGateway } from "./MessageGateway";
import { StreamerGateway } from "./StreamerGateway";

export enum InvoiceStatus {
	PAID,
	CANCELLED
}

export class InvoiceController {

	private messageGateway: MessageGateway;
	private streamerGateway: StreamerGateway;

	constructor(message: MessageGateway, streamer: StreamerGateway) {
		this.streamerGateway = streamer;
		this.messageGateway = message;
	}

	/**
	 * Searches for an unpaid message with the matching invoiceId. If found,
	 *   marks the message as paid and sets a ttl based on the config. If the
	 *   message was not paid for, just deletes it from the database.
	 *
	 * Changes to state:
	 *   Old unpaid message with invoiceId key is deleted.
	 *   Paid message with config defined ttl in DB
	 *
	 * @param {string} streamerId - Will be used as partition key in table
	 * @param {string} invoiceId - InvoiceId, from BTCPayServer. Used as range key
	 * @param {boolean} isPaid - whether the invoice was paid or cancelled
	 */
	async processInvoice(streamerId: string, invoiceId: string, isPaid: InvoiceStatus) {
		const unpaidMessage: UnpaidMessage | undefined = await this.messageGateway.getUnpaidMessage(streamerId, invoiceId);
		if (!unpaidMessage) {
			throw new Error(`Unable to find superchat for ${invoiceId}`);
		}

		if (isPaid == InvoiceStatus.CANCELLED) {
			console.log(`Invoice for ${invoiceId} is being deleted.`);
			await this.messageGateway.deleteUnpaidMessage(unpaidMessage);
			return;
		}

		const streamerConfig = await this.streamerGateway.getStreamerConfig(streamerId);
		if (!streamerConfig) {
			throw new Error(`Unable to find streamer ${streamerId} for invoice ${invoiceId}`);
		}

		const calculatedTimeout = this.calculateTimeout(streamerConfig, unpaidMessage.amount);
		const currentTimeInSeconds = Math.floor(Date.now() / 1000);

		const paidMessage: PaidMessage = {
			...unpaidMessage,
			ttl: currentTimeInSeconds + calculatedTimeout,
		}
		await this.messageGateway.savePaidMessage(paidMessage);
		await this.messageGateway.deleteUnpaidMessage(unpaidMessage);
	}

	private calculateTimeout(streamerConfig: StreamerConfig, payment: number): number {
		for (const timeoutConfig of streamerConfig.chatTimeout) {
			if (payment > timeoutConfig.amount) {
				return timeoutConfig.timeout;
			}
		}

		return 0;
	}
}


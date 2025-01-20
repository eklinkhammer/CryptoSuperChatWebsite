import { StreamerGateway } from "../../src/controllers/StreamerGateway";
import { InvoiceController, InvoiceStatus } from "../../src/controllers/InvoiceController";
import { MessageGateway } from "../../src/controllers/MessageGateway";
import { TableGateway } from "../../src/controllers/TableGateway";
import { client } from "../setup/DynamoDBClientSetup";
import { defaultStreamerConfig } from "../../src/models/StreamerConfig";
import { UnpaidMessage } from "../../src/models/Message"

describe('InvoiceController API', () => {
	const tableGateway = new TableGateway(client);
	const messageGateway = new MessageGateway(tableGateway);
	const streamerGateway = new StreamerGateway(tableGateway);
	const invoiceController = new InvoiceController(messageGateway, streamerGateway);

	const unpaidMessage: UnpaidMessage = {
		streamerId: defaultStreamerConfig.streamerId,
		invoiceId: "a-random-invoice-id",
		userId: "UserId",
		userMessage: "Hello World",
		amount: 100.0,
		streamer: "Dave",
	}

	describe('processInvoice', () => {
		it('when unpaidMessage and streamer exists given invoiceId then delete and save paidMessage', async () => {
			// WHEN
			await messageGateway.saveUnpaidMessage(unpaidMessage);
			await streamerGateway.saveStreamerConfig(defaultStreamerConfig);

			// GIVEN
			await invoiceController.processInvoice(unpaidMessage.streamerId, unpaidMessage.invoiceId, InvoiceStatus.PAID);

			// THEN
			const paidMessages = await messageGateway.getPaidMessages(unpaidMessage.streamerId);
			expect(paidMessages).toHaveLength(1);
			expect(paidMessages[0]).toBeDefined();
			const { ttl, ...rest } = paidMessages[0];

			expect(ttl - Math.floor(Date.now() / 1000)).toBeLessThan(182);
			expect(ttl - Math.floor(Date.now() / 1000)).toBeGreaterThan(178);
			expect(unpaidMessage).toMatchObject(rest);

			const confirmDeletedUnpaid = await messageGateway.getUnpaidMessage(unpaidMessage.streamerId, unpaidMessage.invoiceId);
			expect(confirmDeletedUnpaid).not.toBeDefined();
		});

		it('when unpaidMessage but streamer does not exist then throw', async () => {
			// WHEN
			const newStreamer = { ...unpaidMessage, streamerId: "NotInDB" }
			await messageGateway.saveUnpaidMessage(newStreamer);

			// THEN
			await expect(invoiceController.processInvoice(unpaidMessage.streamerId, unpaidMessage.invoiceId, InvoiceStatus.PAID)).rejects.toThrow();
		});

		it('when unpaidMessage does not exist given invoiceId then throw', async () => {
			await expect(invoiceController.processInvoice(unpaidMessage.streamerId, unpaidMessage.invoiceId, InvoiceStatus.PAID))
						 .rejects.toThrow();
		});

		it('when unpaidMessage exists given cancel then delete only', async () => {
			// WHEN
			const message = { ...unpaidMessage, invoiceId: "new-invoice-id" };
			await messageGateway.saveUnpaidMessage(message);
			await streamerGateway.saveStreamerConfig(defaultStreamerConfig);

			// GIVEN
			await invoiceController.processInvoice(message.streamerId, message.invoiceId, InvoiceStatus.CANCELLED);

			// THEN
			const paidMessages = await messageGateway.getPaidMessages(message.streamerId);
			for (const m of paidMessages) {
				expect(m.invoiceId).not.toEqual(message.invoiceId);
			}

			const confirmDeletedUnpaid = await messageGateway.getUnpaidMessage(message.streamerId, message.invoiceId);
			expect(confirmDeletedUnpaid).not.toBeDefined();
		});
	});

	describe('processInvoice ttl calc', () => {
		for (const config of defaultStreamerConfig.chatTimeout) {
			it(`${config.amount} bucket with timeout ${config.timeout}`, async () => {
				await runTestWithAmount(config.amount + 1, config.timeout, `streamerId-${config.amount}`)
			});
		}
	});

	async function runTestWithAmount(amount: number, ttlAddition: number, streamerId: string) {
		// WHEN
		const message = {...unpaidMessage, streamerId: streamerId, amount: amount};
		await messageGateway.saveUnpaidMessage(message);
		await streamerGateway.saveStreamerConfig({...defaultStreamerConfig, streamerId: streamerId});

		// GIVEN
		await invoiceController.processInvoice(message.streamerId, message.invoiceId, InvoiceStatus.PAID);

		// THEN
		const paidMessages = await messageGateway.getPaidMessages(message.streamerId);
		expect(paidMessages).toHaveLength(1);
		expect(paidMessages[0]).toBeDefined();
		const { ttl, ...rest } = paidMessages[0];

		expect(ttl - Math.floor(Date.now() / 1000)).toBeLessThan(ttlAddition + 2);
		expect(ttl - Math.floor(Date.now() / 1000)).toBeGreaterThan(ttlAddition -2);
		expect(message).toMatchObject(rest);

		const confirmDeletedUnpaid = await messageGateway.getUnpaidMessage(message.streamerId, message.invoiceId);
		expect(confirmDeletedUnpaid).not.toBeDefined();
	}
});

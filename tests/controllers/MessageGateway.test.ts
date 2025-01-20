import { MessageGateway } from "../../src/controllers/MessageGateway";
import { TableGateway } from "../../src/controllers/TableGateway";
import { client } from "../setup/DynamoDBClientSetup";
import { PaidMessage, UnpaidMessage } from "../../src/models/Message";

describe('MessageGateway API', () => {
	const tableGateway = new TableGateway(client);
	const messageGateway = new MessageGateway(tableGateway);

	describe('saveUnpaidMessage', () => {
		const messageTemplate: UnpaidMessage  = {
			streamerId: "StreamerId-unpaidMessage-new",
			invoiceId: "a-random-invoice-id",
			userId: "UserId",
			userMessage: "UserMessage",
			amount: 10.0,
			streamer: "specificStreamer",
		};

		it('when saving message given no matching invoiceId then message saves', async () => {
			const unpaidMessage = {...messageTemplate, streamerId: "no-matching-invoice"};
			await messageGateway.saveUnpaidMessage(unpaidMessage);

			const savedMessage = await messageGateway.getUnpaidMessage(unpaidMessage.streamerId, unpaidMessage.invoiceId);

			expect(savedMessage).toMatchObject(unpaidMessage);
		});

		it('WHEN saveUnpaidMessage called twice for same item THEN no op', async () => {
			// WHEN
			const unpaidMessage = { ...messageTemplate, streamerId: "save-twice" };
			await messageGateway.saveUnpaidMessage(unpaidMessage);
			await messageGateway.saveUnpaidMessage(unpaidMessage);

			// THEN
			const savedMessage = await messageGateway.getUnpaidMessage(unpaidMessage.streamerId, unpaidMessage.invoiceId);
			expect(savedMessage).toMatchObject(unpaidMessage);
		});

		it('WHEN saveUnpaidMessage called with different fields same keys THEN throw', async () => {
			const unpaidMessage = { ...messageTemplate, streamerId: "conflicting-save" };
			const newMessage = {...unpaidMessage, userMessage: "Some new message" };

			await messageGateway.saveUnpaidMessage(unpaidMessage);
			await expect(messageGateway.saveUnpaidMessage(newMessage)).rejects.toThrow();
		});
	});

	describe('Get Paid Messages', () => {
		const paidMessage: PaidMessage = {
			streamerId: "StreamerId-paidMessage",
			invoiceId: "a-random-invoice-id",
			userId: "UserId",
			userMessage: "UserMessage",
			amount: 10.0,
			streamer: "specificStreamer",
			ttl: Math.floor(Date.now() / 1000) + 1000,
		};

		it('GIVEN one paid message saved WHEN getPaidMessages THEN return one message', async () => {
			// GIVEN
			await messageGateway.savePaidMessage(paidMessage);

			// WHEN
			const messagesActual = await messageGateway.getPaidMessages(paidMessage.streamerId)

			// THEN

			expect(messagesActual).toHaveLength(1);
			expect(messagesActual).toEqual(expect.arrayContaining([paidMessage]));

		});

		it('GIVEN two paid messages saved WHEN getPaidMessages THEN return two messages', async () => {
			// GIVEN
			const messageOne: PaidMessage = { ...paidMessage, invoiceId: "invoice-1", streamerId: "Other" };
			const messageTwo: PaidMessage = { ...paidMessage, invoiceId: "invoice-2", streamerId: "Other" };
			await messageGateway.savePaidMessage(messageOne);
			await messageGateway.savePaidMessage(messageTwo);

			// WHEN
			const messagesActual = await messageGateway.getPaidMessages(messageOne.streamerId);

			// THEN
			expect(messagesActual).toHaveLength(2);
			expect(messagesActual).toEqual(expect.arrayContaining([messageOne, messageTwo]));
		});
	});
});


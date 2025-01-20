import { InvoiceController, InvoiceStatus } from "../controllers/InvoiceController";
import crypto from 'crypto';

export class ApiHandleWebhook {
	private invoiceController: InvoiceController;
	private readonly BTCPAY_SECRET = 'your_shared_secret';


	constructor(
		invoiceController: InvoiceController
	) {
		this.invoiceController = invoiceController;
	}

	async handlePost(req, res) {
		console.log(`Entering /api/handle-webhook. Request: ${req}`);

		const signature = req.headers['btcpay-signature'];
		const payload = JSON.stringify(req.body);

		// Verify signature
		const hash = crypto.createHmac('sha256', this.BTCPAY_SECRET).update(payload).digest('hex');
		if (hash !== signature) {
			console.log("Did not pass crytpo check");
			return res.status(400).send('Invalid signature');
		}

		// Handle the event
		console.log('Webhook received:', req.body);

		const { invoiceId, type, metadata } = req.body;
		console.log(`The invoice: ${invoiceId} has entered status: ${type}`);
		const { streamerId } = metadata;

		if (type === "InvoicePaymentSettled" || type === "InvoiceReceivedPayment") {
			console.log(`[${streamerId}] Payment has been settled for invoice ${invoiceId}.`);
			await this.invoiceController.processInvoice(streamerId, invoiceId, InvoiceStatus.PAID);
		}

		if (type === "InvoiceInvalid" || type === "InvoiceExpired") {
			console.log(`[${streamerId}] Payment has been cancelled. Deleting chat for ${invoiceId}`);
			await this.invoiceController.processInvoice(streamerId, invoiceId, InvoiceStatus.CANCELLED);
		}

		res.status(200).send('Webhook processed');
	}
}

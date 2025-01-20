import { MessageGateway } from "../controllers/MessageGateway";
import validPkg from 'validator';
const { escape } = validPkg;

interface ServerConfig {
	url: string;
	key: string;
	storeId: string;
}

export class ApiCreateInvoice {
	private messageGateway: MessageGateway;
	private readonly config: ServerConfig;

	constructor(
		mGateway: MessageGateway,
	) {
		this.messageGateway = mGateway;
		this.config = getConfig();
	}

	async handlePost(req, res) {
		console.log(`Entering /api/create-invoice. Request: ${req}`)
		const { amount, user, message, streamerId, streamer } = req.body;
		console.log(`[${streamerId}] User ${user} sent ${amount} to ${streamer} with message: ${message}`);

		const headers = {
			'Content-Type': 'application/json',
			Authorization: 'token ' + this.config.key
		};
		const payload = {
			amount: amount,
			currency: 'USD',
			metadata: {
				buyerName: escape(user),
				physical: false,
				streamerId: streamerId,
			},
		};
		const apiEndpoint = `/api/v1/stores/${this.config.storeId}/invoices`
		await fetch(this.config.url + apiEndpoint, {
			method: 'POST',
			headers: headers,

			body: JSON.stringify(payload)
		})
		.then(response => response.json())
		.then(async (data) => {
			console.log(`Fetch of invoice complete: ${data}`);
			await this.messageGateway.saveUnpaidMessage({
				streamerId: escape(streamerId),
				userId: escape(user),
				userMessage: escape(message),
				streamer: escape(streamer),
				amount: amount,
				invoiceId: data.id,
			});
			res.status(200).json({url: data.checkoutLink});
			console.log(`Exiting /api/create-invoice. Response: ${res}`);
		});
	}
}

const serverConfigDemoTestNet: ServerConfig = {
	url:  "https://testnet.demo.btcpayserver.org",
	key: "b21b76a6f0171cf42adcb62a5a1a17706b946f97",
	storeId: "FPZ4gUGkaPADKRkJPjwmwbKkwvKjd2PvWVNjHLPYjRsv",
};

function getConfig(): ServerConfig {
	const maybeUrl = process.env.BTCPAY_URL;
	const maybeKey = process.env.BTCPAY_KEY;
	const maybeStoreId = process.env.BTCPAY_STORE_ID;

	if (maybeUrl && maybeKey && maybeStoreId) {
		return {
			url: maybeUrl,
			key: maybeKey,
			storeId: maybeStoreId
		};
	} else {
		console.warn("Warning, you are in test net");
		return serverConfigDemoTestNet;
	}
};



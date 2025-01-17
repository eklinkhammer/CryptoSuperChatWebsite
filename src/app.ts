import express, { Application, Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import validPkg from 'validator';
const { escape } = validPkg;
// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Application = express(); // Properly declare `app`

const PORT = 5123;

//interface ServerConfig {
	//url: string;
	//key: string;
	//storeId: string;
//};
//
//function getConfig(): ServerConfig {
	//return {
		//url: process.env.BTCPAY_URL!,
		//key: process.env.BTCPAY_KEY!,
		//storeId: process.env.BTCPAY_STORE_ID!,
	//};
//};


// Testnet and mainnet demos
const btcpayServerConfig = {
	demoMain: {
		url: "https://mainnet.demo.btcpayserver.org",
		key: "3cf84657812b388d2be2297692438de34f9039d8",
		storeId: "5o1987WauyEmNdMzToTRDpqmvur4E82Wxbtz8xiKMsev",
	},
	demoTest: {
		url:  "https://testnet.demo.btcpayserver.org",
		key: "b21b76a6f0171cf42adcb62a5a1a17706b946f97",
		storeId: "FPZ4gUGkaPADKRkJPjwmwbKkwvKjd2PvWVNjHLPYjRsv",
	},
};


// Middleware to parse JSON
app.use(express.json());

// Serve static files (e.g., from a React build)
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

app.post("/api/create-invoice", async (req, res) => {
	console.log("Entered /api/create-invoice");
	const { amount, user, message, streamerId, streamer } = req.body;
	console.log(`Before Escaping, user: ${user} and message: ${message}`);
	const validUser = escape(user);
	const validMessage = escape(message);
	// Check that streamer is in set of allowed values for streamerId
	console.log(`[${streamerId}] User ${validUser} sent ${amount} to ${streamer} with message: ${validMessage}`);
					
	const headers = {
		'Content-Type': 'application/json',
		Authorization: 'token ' + btcpayServerConfig.demoTest.key
	};
	const payload = {
		amount: amount,
		currency: 'USD'
	};
	const apiEndpoint = `/api/v1/stores/${btcpayServerConfig.demoTest.storeId}/invoices`
	await fetch(btcpayServerConfig.demoTest.url + apiEndpoint, {
		method: 'POST',
		headers: headers,
		body: JSON.stringify(payload)
	})
	.then(response => response.json())
	.then(data => {
		console.log(data)
		console.log("Fetch complete");
		res.status(200).json({url: data.checkoutLink});
	});
});

// Catch-all route to serve the React app
app.get('*', (req: Request, res: Response) => {
	const filePath = path.join(clientBuildPath, "index.html");

	// Read the HTML file
	fs.readFile(filePath, "utf8", (err: NodeJS.ErrnoException | null, html: string) => {
		if (err) {
			console.error("Failed to read index.html:", err);
			res.status(500).send("Server Error");
			return;
		}

		// Dynamic data to inject
		const strings = ["Dave", "Vince", "Rebecca", "Chris"];
		const injectedScript = `<script>
		window.__INITIAL_DATA__ = ${JSON.stringify(strings)};
		</script>`;

		// Replace the placeholder with the injected script
		const modifiedHtml = html.replace(
			'<script id="initial-data"></script>',
			injectedScript
		);

		res.send(modifiedHtml);
	});
});



// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});


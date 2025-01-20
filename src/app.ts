import express, { Application, Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { apiCreateInvoice, apiHandleWebhook } from "./routes/Routes";

// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Application = express(); // Properly declare `app`

const HOST = '0.0.0.0';
const PORT = 5123;


// Middleware to parse JSON
app.use(express.json());

// Serve static files (e.g., from a React build)
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

app.post("/api/create-invoice", async (req, res) => {
	await apiCreateInvoice.handlePost(req, res);
});

app.post("/api/handle-webhook", async (req, res) => {
	await apiHandleWebhook.handlePost(req, res);
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
app.listen(PORT, HOST, () => {
	console.log(`Server is running on http://${HOST}:${PORT}`);
});


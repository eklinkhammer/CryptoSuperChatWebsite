import express, { Application, Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Application = express(); // Properly declare `app`

const PORT = 5123;

// Middleware to parse JSON
app.use(express.json());

// Serve static files (e.g., from a React build)
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// Example API route
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Hello from the Express API!' });
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
    const strings = ["Hello", "World", "This", "Is", "React"];
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


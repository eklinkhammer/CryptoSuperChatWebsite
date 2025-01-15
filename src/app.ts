import express, { Application, Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Application = express(); // Properly declare `app`

const PORT = 5000;

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
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


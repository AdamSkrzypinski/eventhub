import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { DatabaseConnection } from './config/database.js';
import eventRoutes from './routes/event.routes.js';


dotenv.config();

DatabaseConnection.getInstance();

const app = express();
const PORT = process.env.PORT || 5000

app.use(express.json());

app.use('/api/events', eventRoutes);

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Serwer API dziala na http://localhost:${PORT}`);
});
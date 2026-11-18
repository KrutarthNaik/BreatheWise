import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chatRouter } from './routes/chat.js';
import { advisorRouter } from './routes/advisor.js';
import { assistantRouter } from './routes/assistant.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/chat', chatRouter);
app.use('/api/advisor', advisorRouter);
app.use('/api/assistant', assistantRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'BreatheWise API Server',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`[BreatheWise Server] listening on http://localhost:${PORT}`);
  console.log(
    `[BreatheWise Server] Gemini API Status: ${
      process.env.GEMINI_API_KEY ? `Active (${process.env.GEMINI_MODEL || 'gemini-2.5-flash'})` : 'Grounded Demo Engine (No key configured)'
    }`
  );
});

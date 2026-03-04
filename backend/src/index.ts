import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import usersRouter from './routes/user';      // <- match file name
import gamesRouter from './routes/games';
import sessionsRouter from './routes/session'; // <- match file name
import statsRouter from './routes/stats';

dotenv.config();
export const app = express();

app.use(express.json());
app.use(cors());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/users', usersRouter);
app.use('/games', gamesRouter);
app.use('/sessions', sessionsRouter);
app.use('/stats', statsRouter);

const port = process.env.PORT || 4004;

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
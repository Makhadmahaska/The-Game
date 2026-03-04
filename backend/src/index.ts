import dotenv from 'dotenv';
import express from 'express';

export const app = express();

const port = process.env.PORT || 4004;

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});

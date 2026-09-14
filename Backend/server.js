import dotenv from 'dotenv';

dotenv.config();

import { createApp } from './app.js';

const PORT = process.env.PORT || 8000;

async function start() {
  try {
    const app = await createApp();
    app.listen(PORT, () => {
      console.log(` TripAI API listening on ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error(' Failed to start server:', error);
    process.exit(1);
  }
}

start();

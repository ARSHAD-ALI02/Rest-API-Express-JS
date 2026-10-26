const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Check and load .env with override: true so terminal/system env vars don't block .env
const envLocations = [
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '.env'),
  path.resolve(process.cwd(), '.env'),
];

for (const loc of envLocations) {
  if (fs.existsSync(loc)) {
    dotenv.config({ path: loc, override: true });
  }
}

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      console.error('ERROR: MONGO_URI is not defined in process.env!');
      console.error(`Current working directory: ${process.cwd()}`);
      console.error(`Checked locations for .env: ${envLocations.join(', ')}`);
      process.exit(1);
    }

    // Mask credentials for clean logging
    const maskedURI = mongoURI.replace(/:([^@]+)@/, ':****@');
    console.log(`Connecting to MongoDB: ${maskedURI}`);

    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

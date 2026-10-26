const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Check and load .env with override: true so terminal/system env vars don't block .env
const envLocations = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '.env'),
  path.resolve(process.cwd(), '.env'),
];

for (const loc of envLocations) {
  if (fs.existsSync(loc)) {
    dotenv.config({ path: loc, override: true });
  }
}

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();

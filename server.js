const dotenv = require('dotenv');
const app = require('./app');

process.on ('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  process.exit(1);
})

dotenv.config({ path: './config.env' });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});


process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

const dotenv = require('dotenv');
const mongoose = require('mongoose');

// HANDLING ANY OTHER ASYNC ERRORS
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting Dowm.....');
  console.log(err.name, err.message);
  process.exit(1);
});

// Adding environment variables to the node
dotenv.config({ path: `${__dirname}/config.env` });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to the database');
  });

const server = app.listen(`${process.env.PORT}`, () => {
  console.log(`The server is listening at port:${process.env.PORT}`);
});

// HANDLING PROMISE REJECETION
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥. Shutting Down.');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

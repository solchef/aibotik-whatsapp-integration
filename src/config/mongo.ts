import mongoose from 'mongoose';
import config from './index';

const CONNECTION_URL = `mongodb://${config.db.url}/${config.db.name}`;

mongoose.connect(CONNECTION_URL, {
  //useUnifiedTopology: true,
  //useNewUrlParser: true, // This option is not needed in Mongoose version 5.3.0 and above
});

mongoose.connection.on('connected', () => {
  console.log('Mongo has connected successfully');
});

mongoose.connection.on('reconnected', () => {
  console.log('Mongo has reconnected');
});

mongoose.connection.on('error', (error) => {
  console.log('Mongo connection has an error', error);
  mongoose.disconnect();
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongo connection is disconnected');
});

// Close the Mongoose connection when the Node process is terminated
process.on('SIGINT', () => {
//   mongoose.connection.close(() => {
//     console.log('Mongo connection is disconnected due to application termination');
//     process.exit(0);
//   });
});

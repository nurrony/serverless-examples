const mongoose = require('mongoose');
let isConnected;

module.exports = connectToDatabase = () => {
  if (isConnected) {
    console.log('=> using existing database connection');
    return Promise.resolve();
  }

  console.log('=> using new database connection', process.env.DB_HOST, process.env.DB_NAME);
  const DB_DSN = `${process.env.DB_HOST}/${process.env.DB_NAME}`;
  console.log(DB_DSN);
  return mongoose
    .connect(DB_DSN) // keep the connection string in an env var
    .then(db => {
      isConnected = db.connections[0].readyState;
    });
};

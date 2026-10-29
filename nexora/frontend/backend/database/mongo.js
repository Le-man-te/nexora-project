const { MongoClient } = require('mongodb');
const mongoConfig = require('../config/mongodb');
const { runMigrations } = require('./migrations/run');

let client;
let database;
let connectionPromise;

async function connectMongo() {
  if (database) return database;
  if (connectionPromise) return connectionPromise;

  connectionPromise = (async () => {
    const nextClient = new MongoClient(mongoConfig.uri, {
      appName: 'nexora-backend',
      serverSelectionTimeoutMS: mongoConfig.serverSelectionTimeoutMS,
    });
    try {
      await nextClient.connect();
      const nextDatabase = nextClient.db(mongoConfig.databaseName);
      await runMigrations(nextDatabase);
      client = nextClient;
      database = nextDatabase;
      return database;
    } catch (error) {
      try {
        await nextClient.close();
      } catch (cleanupError) {
        error.message = `${error.message} MongoDB client cleanup also failed: ${cleanupError.message}`;
      }
      throw error;
    }
  })();

  try {
    return await connectionPromise;
  } finally {
    connectionPromise = undefined;
  }
}

function getMongoDatabase() {
  if (!database) throw new Error('MongoDB is not connected. Call connectMongo() first.');
  return database;
}

async function closeMongo() {
  const currentClient = client;
  client = undefined;
  database = undefined;
  connectionPromise = undefined;
  if (currentClient) await currentClient.close();
}

module.exports = {
  connectMongo,
  getMongoDatabase,
  getCollection: (name) => getMongoDatabase().collection(name),
  closeMongo,
};

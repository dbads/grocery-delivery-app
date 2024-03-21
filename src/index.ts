/* index.ts */
// project dependencies
import app from './app';
import { db, redis } from './common/';
const { SERVER_PORT } = process.env;

// connect to db
(async () => { await db.connectToDB();}) ();
(async () => { await redis.connectToRedis();}) ();


// Gracefully close the Redis connection on application shutdown
const shutdown = async () => {
  console.log('Performing necessary cleanup before shuttind down the nodejs process');
  try {
    // Close the Redis connection
    console.log('Redis connection closed gracefully');
    await redis.closeRedisConnection();
    
    await db.closeMongoDBConnection();
    console.log('Mongodb connection closed gracefully');
  } catch (err) {
    console.error('Error closing connections:', err);
  } finally {
    // Ensure the process exits
    console.log('Closing process');
    process.exit(0);
  }
};

// Set up a listener for process events (e.g., SIGINT, SIGTERM)
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);


// app listening
app.listen(SERVER_PORT, () => {
  console.info(`App running on port ${SERVER_PORT}`);
});
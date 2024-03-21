import { createClient, RedisClientType } from 'redis';
console.log(process.env.NODE_ENV, 'node_env');

let redisClient: RedisClientType;
async function connectToRedis() {    
  const url = process.env.REDIS_URL || 'redis://redis:6379';
  // const url = process.env.NODE_ENV === 'local' 
  // ? 'redis://localhost:6379' : process.env.REDIS_URL || 'redis://redis:6379';
  // const url = 'redis://localhost:6379';
  redisClient = createClient({
    url
  });
    
  try {
    redisClient.on('error', err => console.log('Redis Client Error', url, err));
    redisClient.on('connect', function () {
      console.log('Connected to Redis');
    });
        
    (async () => { 
      await redisClient.connect(); 
    })();
  } catch (error) {
    console.log(`Error in redis connection: ${error}`);
  }
}

const closeRedisConnection = async () => {
  await redisClient.quit();
};


export {
  connectToRedis,
  redisClient,
  closeRedisConnection
};
import mongoose from 'mongoose';

// eslint-disable-next-line max-len
const MONGO_URI = process.env.MONGO_URI;

async function connectToDB() {
  try {
    if (!MONGO_URI) throw new Error(`Database uri not defined`);
    await mongoose.connect(MONGO_URI, {});
    mongoose.set('debug', true);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw new Error(`Error in connecting to DB ${error}`);
  }
}


// Event listener for successful MongoDB connection
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

// Event listener for MongoDB connection error
mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

// Function to close the MongoDB connection
const closeMongoDBConnection = async () => {
  await mongoose.connection.close();
};

export { connectToDB, closeMongoDBConnection };
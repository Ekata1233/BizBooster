import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_URI || 'mongodb+srv://ftfltechnology:ftfltechnology@bizboostercluster.o31hnq3.mongodb.net/?retryWrites=true&w=majority&appName=BizBoosterCluster';

let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    console.log('Already connected to MongoDB');
    return;
  }

  try {
    // Connect to MongoDB without deprecated options
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export { connectToDatabase };

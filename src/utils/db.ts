// import Zone from '@/models/Zone';
// import mongoose from 'mongoose';

// const MONGODB_URI = process.env.MONGO_URI || 'mongodb+srv://ftfltechnology:ftfltechnology@bizboostercluster.o31hnq3.mongodb.net/?retryWrites=true&w=majority&appName=BizBoosterCluster';

// let isConnected = false;

// const connectToDatabase = async () => {
//   if (isConnected) {
//     console.log('Already connected to MongoDB');
//     return;
//   }

//   try {
//     // Connect to MongoDB without deprecated options
//     await mongoose.connect(MONGODB_URI, {
//       serverSelectionTimeoutMS: 5000, // fail fast if cannot connect
//       ssl: true, // force TLS
//     });
//     isConnected = true;
//     console.log('Connected to MongoDB');
//     await ensurePanIndiaZone();
//   } catch (error) {
//     console.error('Error connecting to MongoDB:', error);
//     process.exit(1);
//   }
// };

// export { connectToDatabase };
import mongoose from "mongoose";
import Zone from "@/models/Zone";

const MONGODB_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://ftfltechnology:ftfltechnology@bizboostercluster.o31hnq3.mongodb.net/test?retryWrites=true&w=majority&appName=BizBoosterCluster";

// Prevent multiple connections in dev / serverless
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      })
      .then(async (mongooseInstance) => {
        console.log("✅ Connected to MongoDB");

        // Run only after fresh connection
        await ensurePanIndiaZone();

        return mongooseInstance;
      })
      .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}


async function ensurePanIndiaZone() {
  const panIndia = await Zone.findOne({ isPanIndia: true });
  if (!panIndia) {
    // PAN INDIA does not require coordinates
    await Zone.create({
      name: "PAN INDIA",
      coordinates: [],       // empty array, valid for schema
      isPanIndia: true,
      isDeleted: false,
    });
    console.log("🌍 PAN INDIA zone auto-created");
  }
}

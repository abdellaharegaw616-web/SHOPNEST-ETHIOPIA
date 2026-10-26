import mongoose from 'mongoose';
import { env } from '../src/config/env';

export const connectTestDb = async (): Promise<void> => {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(env.TEST_MONGODB_URI, {
        serverSelectionTimeoutMS: 2000,
      });
    } catch {
      // In CI / local environment where local mongod might not be running on port 27017,
      // fallback or proceed with test harness
    }
  }
};

export const clearTestDb = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
      await collections[key].deleteMany({});
    }
  }
};

export const closeTestDb = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

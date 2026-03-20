import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import connectDB from '../config/db.js';
import NGO from '../models/ngo.js';
import { ngos as mockNgos } from '../../client/js/data/ngos.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const toArray = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const toSeedDoc = (ngo) => {
  const { id, focus_areas, services, ...rest } = ngo;

  return {
    ...rest,
    focus_areas: toArray(focus_areas),
    services: toArray(services),
    status: 'approved',
  };
};

const seedNgos = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set. Add it in server/.env or root .env.');
  }

  await connectDB(process.env.MONGO_URI);

  const seedDocs = mockNgos.map(toSeedDoc);

  const operations = seedDocs.map((doc) => ({
    updateOne: {
      filter: { name: doc.name },
      update: { $set: doc },
      upsert: true,
    },
  }));

  const result = await NGO.collection.bulkWrite(operations, { ordered: false });

  console.log('NGO seed complete.');
  console.log(`Total mock records: ${seedDocs.length}`);
  console.log(`Inserted: ${result.upsertedCount}`);
  console.log(`Updated: ${result.modifiedCount}`);
  console.log(`Matched: ${result.matchedCount}`);
};

seedNgos()
  .catch((error) => {
    console.error('Failed to seed NGOs:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

import path from 'path';
import fs from 'fs/promises';
import vm from 'vm';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import connectDB from '../config/db.js';
import Lifestyle from '../models/lifestyle.js';
import slugify from '../utils/slug.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const loadInterventions = async () => {
  const lifestyleDataPath = path.resolve(__dirname, '../../client/js/data/lifestyle.js');
  const source = await fs.readFile(lifestyleDataPath, 'utf8');

  const transformed = source.replace(
    /export\s+const\s+interventions\s*=\s*/,
    'const interventions = '
  );

  const context = {
    module: { exports: {} },
    exports: {},
  };

  vm.runInNewContext(`${transformed}\nmodule.exports = { interventions };`, context, {
    filename: lifestyleDataPath,
  });

  const entries = context.module?.exports?.interventions;
  return Array.isArray(entries) ? entries : [];
};

const toArray = (value) =>
  Array.isArray(value)
    ? value.map((item) => String(item || '').trim()).filter(Boolean)
    : [];

const toTips = (value) =>
  Array.isArray(value)
    ? value
        .map((tip) => ({
          title: String(tip?.title || '').trim(),
          desc: String(tip?.desc || tip?.description || '').trim(),
        }))
        .filter((tip) => tip.title && tip.desc)
    : [];

const toSeedDoc = (item) => {
  const title = String(item?.title || '').trim();
  const category = item?.category === 'medical' ? 'medical' : 'lifestyle';
  const sourceId = String(item?.id || '').trim();
  const slug = sourceId || slugify(title);

  return {
    title,
    slug,
    subtitle: String(item?.subtitle || '').trim(),
    summary: String(item?.summary || '').trim(),
    category,
    foundation: toArray(item?.foundation),
    tips: toTips(item?.tips),
    evidence: toArray(item?.evidence),
    status: 'published',
    published: true,
  };
};

const seedLifestyle = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set. Add it in server/.env or root .env.');
  }

  await connectDB(process.env.MONGO_URI);

  const interventions = await loadInterventions();

  const docs = interventions.map(toSeedDoc).filter((doc) => doc.title && doc.slug && doc.summary);

  const operations = docs.map((doc) => ({
    updateOne: {
      filter: { slug: doc.slug },
      update: { $set: doc },
      upsert: true,
    },
  }));

  const result = await Lifestyle.collection.bulkWrite(operations, { ordered: false });

  console.log('Lifestyle seed complete.');
  console.log(`Total mock records: ${docs.length}`);
  console.log(`Inserted: ${result.upsertedCount}`);
  console.log(`Updated: ${result.modifiedCount}`);
  console.log(`Matched: ${result.matchedCount}`);
};

seedLifestyle()
  .catch((error) => {
    console.error('Failed to seed lifestyle:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

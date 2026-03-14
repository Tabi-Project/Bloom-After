import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import connectDB from "../config/db.js";
import Resource from "../models/resource.js";
import { resources as mockResources } from "../../client/js/data/resources.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const toDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const toStructuredContent = (value) => {
  if (Array.isArray(value)) {
    return { language: "en", blocks: value };
  }

  if (value && typeof value === "object") {
    return { language: "en", ...value };
  }

  return { language: "en" };
};

const toSeedDoc = (resource) => {
  const {
    id,
    content_type,
    image_url,
    read_time,
    cta_label,
    file_url,
    structured_content,
    date,
    ...rest
  } = resource;

  const createdAt = toDate(date);

  return {
    ...rest,
    content_type,
    image_url,
    date,
    read_time,
    cta_label,
    ...(file_url ? { file_url } : {}),
    ...(structured_content !== undefined ? { structured_content } : {}),
    content: resource.summary,
    contentType: content_type,
    imageUrl: image_url,
    readTime: read_time,
    ctaLabel: cta_label,
    structuredContent: toStructuredContent(structured_content),
    sourceUrl: file_url || image_url,
    published: Boolean(resource.published),
    createdAt,
    updatedAt: createdAt,
  };
};

const seedResources = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set. Add it in server/.env or root .env.");
  }

  await connectDB(process.env.MONGO_URI);

  const seedDocs = mockResources.map(toSeedDoc);

  const operations = seedDocs.map((doc) => ({
    updateOne: {
      filter: { title: doc.title },
      update: { $set: doc },
      upsert: true,
    },
  }));

  const result = await Resource.collection.bulkWrite(operations, { ordered: false });

  console.log("Resource seed complete.");
  console.log(`Total mock records: ${seedDocs.length}`);
  console.log(`Inserted: ${result.upsertedCount}`);
  console.log(`Updated: ${result.modifiedCount}`);
  console.log(`Matched: ${result.matchedCount}`);
};

seedResources()
  .catch((error) => {
    console.error("Failed to seed resources:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

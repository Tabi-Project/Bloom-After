import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import connectDB from "../config/db.js";
import AdminUser from "../models/adminUser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const requiredEnv = (key) => {
  const value = process.env[key];
  if (!value || !String(value).trim()) {
    throw new Error(`${key} is required to seed an admin user.`);
  }
  return String(value).trim();
};

const seedAdmin = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set. Add it in server/.env or root .env.");
  }

  const name = "Gracie";
  const email = "olabodegrace1998@gmail.com";
  const password = "oreoluwa2018";
  const isSuperAdmin = true;
  const resetPassword = false;

  await connectDB(process.env.MONGO_URI);

  const existing = await AdminUser.findOne({ email });

  if (existing) {
    existing.name = name;
    existing.isSuperAdmin = isSuperAdmin;
    existing.role = isSuperAdmin ? "superadmin" : "moderator";
    existing.status = "active";

    if (resetPassword) {
      existing.password = password;
    }

    await existing.save();
    console.log("Admin seed updated existing user.");
    return;
  }

  const admin = new AdminUser({
    name,
    email,
    password,
    isSuperAdmin,
    role: isSuperAdmin ? "superadmin" : "moderator",
    status: "active",
  });

  await admin.save();
  console.log("Admin seed created new user.");
};

seedAdmin()
  .catch((error) => {
    console.error("Failed to seed admin:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

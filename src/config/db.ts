import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDb = async () => {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.error("MongoDB URI is not present");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log("Server has connected to the database");
  } catch {
    console.error("Unable to connect to the database");
    process.exit(1);
  }
};

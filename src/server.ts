import app from "./app";
import dotenv from "dotenv";
import { connectDb } from "./config/db";

dotenv.config();

const startServer = async () => {
  const portNumber = process.env.PORT || 8000;
  try {
    await connectDb();
    app.listen(portNumber, () => {
      console.log("Server started at PORT:" + portNumber);
    });
  } catch {
    console.log("Failed to start the server");
    process.exit(1);
  }
};

startServer();

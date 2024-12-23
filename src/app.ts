import express from "express";
import cors from "cors";
import { jwtCheck } from "./config/jwtCheck";
import {
  createContent,
  deleteContent,
  editContent,
  getContent,
} from "./controllers/contentController";
const app = express();

app.use(express.json());
app.use(cors());
app.use(jwtCheck);

app.get("/api/content", getContent);
app.post("/api/content", createContent);
app.put("/api/content/:id", editContent);
app.delete("/api/content/:id", deleteContent);

export default app;

import express from "express";
import cors from "cors";
import { jwtCheck } from "./config/jwtCheck";
import {
  createContent,
  deleteContent,
  editContent,
  getContent,
} from "./controllers/contentController";
import {
  generateLink,
  getLink,
  shareBrainContent,
  toggleLinkStatus,
} from "./controllers/brainShare";
const app = express();

app.use(express.json());
app.use(cors());

app.get("/api/share/brain/:hash", shareBrainContent);
app.use(jwtCheck);

app.get("/api/content", getContent);
app.post("/api/content", createContent);
app.put("/api/content/:id", editContent);
app.delete("/api/content/:id", deleteContent);
app.get("/api/share/brain", getLink);
app.post("/api/share/brain", generateLink);
app.put("/api/share/brain", toggleLinkStatus);

export default app;

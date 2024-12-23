import { model, Schema } from "mongoose";

interface contentInterface {
  sub: string;
  title: string;
  type: "note" | "link" | "image";
  linkURL?: string;
  noteContent?: string;
  imageURL?: string;
  createdAt: Date;
  lastUpdatedAt: Date;
}

const contentSchema = new Schema<contentInterface>({
  sub: { type: String },
  title: { type: String },
  type: { type: String, enum: ["note", "link", "image"] },
  linkURL: {
    type: String,
    required() {
      return this.type == "link";
    },
  },
  noteContent: {
    type: String,
    required() {
      return this.type == "note";
    },
  },
  imageURL: {
    type: String,
    required() {
      return this.type == "image";
    },
  },
  createdAt: { type: Date, default: Date.now },
  lastUpdatedAt: { type: Date, default: Date.now },
});

export const ContentModel = model<contentInterface>("Content", contentSchema);

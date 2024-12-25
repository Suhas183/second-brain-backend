import { model, Schema } from "mongoose";

interface LinkInterface {
  sub: string;
  hash: string;
  active: boolean;
}

const linkSchema = new Schema<LinkInterface>({
  sub: { type: String },
  hash: { type: String },
  active: { type: Boolean },
});

export const LinkModel = model<LinkInterface>("Link", linkSchema);

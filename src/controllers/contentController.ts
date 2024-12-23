import { Request, Response } from "express";
import { ContentModel } from "../models/Content";
import { contentSchema, contentType } from "../utils/validation";
import { ZodError } from "zod";

export const getContent = async (req: Request, res: Response) => {
  const sub = req.auth?.payload.sub;
  try {
    const content = await ContentModel.find({
      sub: sub,
    }).sort({ lastUpdatedAt: -1 });
    res.status(200).json({
      content: content,
    });
  } catch {
    res.status(400).json({
      msg: "Something went wrong",
    });
  }
};

export const createContent = async (
  req: Request,
  res: Response
): Promise<any> => {
  const sub = req.auth?.payload.sub;
  try {
    const parsedInput: contentType = contentSchema.parse(req.body);
    const {
      title,
      type,
      createdAt,
      lastUpdatedAt,
      linkURL,
      imageURL,
      noteContent,
    } = parsedInput;
    const contentData: any = { sub, title, type, createdAt, lastUpdatedAt };
    if (type === "link") contentData.linkURL = linkURL;
    if (type === "note") contentData.noteContent = noteContent;
    if (type === "image") contentData.imageURL = imageURL;

    const content = await ContentModel.create(contentData);
    res.status(201).json({
      content,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ errors: err.errors });
    } else {
      return res.status(400).json({
        message: "Failed to create content",
      });
    }
  }
};

export const editContent = async (
  req: Request,
  res: Response
): Promise<any> => {
  const sub = req.auth?.payload.sub;
  const id = req.params.id;
  try {
    const content = await ContentModel.findById(id);
    if (!content) {
      return res.status(404).json({
        msg: "Content not found",
      });
    }
    if (content.sub != sub) {
      return res.status(403).json({
        msg: "You are not authorized to do this operation",
      });
    }
    const parsedInput: contentType = contentSchema.parse(req.body);
    const {
      title,
      type,
      createdAt,
      lastUpdatedAt,
      linkURL,
      imageURL,
      noteContent,
    } = parsedInput;
    const contentData: any = { sub, title, type, createdAt, lastUpdatedAt };
    if (type === "link") contentData.linkURL = linkURL;
    if (type === "note") contentData.noteContent = noteContent;
    if (type === "image") contentData.imageURL = imageURL;

    const updatedContent = await ContentModel.findByIdAndUpdate(
      id,
      contentData,
      { new: true }
    );
    res.status(200).json({
      content: updatedContent,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ errors: err.errors });
    } else {
      return res.status(400).json({
        message: "Failed to update content",
      });
    }
  }
};

export const deleteContent = async (
  req: Request,
  res: Response
): Promise<any> => {
  const sub = req.auth?.payload.sub;
  const id = req.params.id;
  try {
    const content = await ContentModel.findById(id);
    if (!content) {
      return res.status(404).json({
        msg: "Content not found",
      });
    }
    if (content.sub != sub) {
      return res.status(403).json({
        msg: "You are not authorized to do this operation",
      });
    }

    await ContentModel.findByIdAndDelete(id);
    res.status(200).json({
      msg: "Successfully deleted",
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ errors: err.errors });
    } else {
      return res.status(400).json({
        message: "Failed to delete content",
      });
    }
  }
};

import { Request, Response } from "express";
import { ContentModel } from "../models/Content";
import { contentSchema, contentType } from "../utils/validation";
import { ZodError } from "zod";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import { s3 } from "../config/aws-config";

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

    if (content.imageURL) {
      const bucketName = process.env.S3_BUCKET_NAME as string;
      const key = content.imageURL.split(".amazonaws.com/")[1];
      const params = {
        Bucket: bucketName,
        Key: key,
      };
      const command = new DeleteObjectCommand(params);
      await s3.send(command);
    }
    const parsedInput: contentType = contentSchema.parse(req.body);
    const { title, type, createdAt, lastUpdatedAt, linkURL, noteContent } =
      parsedInput;
    const contentData: any = { sub, title, type, createdAt, lastUpdatedAt };
    const unsetFields: any = {};
    if (type === "link") {
      contentData.linkURL = linkURL;
      unsetFields.noteContent = 1;
      unsetFields.imageURL = 1;
    }
    if (type === "note") {
      contentData.noteContent = noteContent;
      unsetFields.linkURL = 1;
      unsetFields.imageURL = 1;
    }

    const updatedContent = await ContentModel.findByIdAndUpdate(
      id,
      { $set: contentData, $unset: unsetFields },
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

    if (content.imageURL) {
      const bucketName = process.env.S3_BUCKET_NAME as string;
      const key = content.imageURL.split(".amazonaws.com/")[1];
      const params = {
        Bucket: bucketName,
        Key: key,
      };
      const command = new DeleteObjectCommand(params);
      await s3.send(command);
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

export const uploadImages = async (
  req: Request,
  res: Response
): Promise<any> => {
  const sub = req.auth?.payload.sub;
  try {
    const { title, type, createdAt, updatedAt } = req.body;
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded." });
      return;
    }
    const file = req.file;
    const fileExtension = file.mimetype.split("/")[1];
    const fileName = `${nanoid()}.${fileExtension}`;
    const params = {
      Bucket: process.env.S3_BUCKET_NAME as string,
      Key: `uploads/${fileName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    const command = new PutObjectCommand(params);
    await s3.send(command);
    const contentData: any = { sub, title, type, createdAt, updatedAt };
    contentData.imageURL = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/${fileName}`;

    const content = await ContentModel.create(contentData);
    return res.status(201).json({
      content,
    });
  } catch {
    return res
      .status(400)
      .json({ msg: "Failed to upload file. Please try again." });
  }
};

export const editImages = async (req: Request, res: Response): Promise<any> => {
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
    const { title, type, createdAt, updatedAt } = req.body;
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded." });
      return;
    }

    const file = req.file;
    const fileExtension = file.mimetype.split("/")[1];
    const fileName = `${nanoid()}.${fileExtension}`;
    const params = {
      Bucket: process.env.S3_BUCKET_NAME as string,
      Key: `uploads/${fileName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    const command = new PutObjectCommand(params);
    await s3.send(command);
    const contentData: any = { sub, title, type, createdAt, updatedAt };
    contentData.imageURL = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/${fileName}`;
    const unsetFields = {
      noteContent: 1,
      linkURL: 1,
    };
    if (content.imageURL) {
      const bucketName = process.env.S3_BUCKET_NAME as string;
      const key = content.imageURL.split(".amazonaws.com/")[1];
      const params = {
        Bucket: bucketName,
        Key: key,
      };
      const command = new DeleteObjectCommand(params);
      await s3.send(command);
    }
    const updatedContent = await ContentModel.findByIdAndUpdate(
      id,
      { $set: contentData, $unset: unsetFields },
      { new: true }
    );
    res.status(200).json({
      content: updatedContent,
    });
  } catch {
    return res.status(400).json({
      message: "Failed to update content",
    });
  }
};

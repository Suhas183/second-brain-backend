import { Request, Response } from "express";
import { nanoid } from "nanoid";
import { LinkModel } from "../models/Link";
import { ContentModel } from "../models/Content";

export const getLink = async (req: Request, res: Response): Promise<any> => {
  const sub = req.auth?.payload.sub;
  try {
    const link = await LinkModel.findOne({
      sub,
    });
    if (!link) {
      return res.status(404).json({
        msg: "Link not found",
      });
    }
    return res.status(200).json({
      active: link.active,
      hash: link.hash,
    });
  } catch (err) {
    res.status(400).json({
      msg: "Something went wrong",
    });
  }
};

export const generateLink = async (
  req: Request,
  res: Response
): Promise<any> => {
  const sub = req.auth?.payload.sub;
  try {
    const linkPresent = await LinkModel.findOne({
      sub,
    });
    if (linkPresent) {
      return res.status(400).json({
        msg: "Link is already present",
      });
    }

    const hash = nanoid();
    const newLink = await LinkModel.create({
      sub,
      hash,
      active: false,
    });
    res.status(200).json({
      hash: newLink.hash,
      active: newLink.active,
    });
  } catch (err) {
    res.status(400).json({
      msg: "Something went wrong",
    });
  }
};

export const toggleLinkStatus = async (
  req: Request,
  res: Response
): Promise<any> => {
  const sub = req.auth?.payload.sub;
  try {
    const link = await LinkModel.findOne({ sub });
    if (!link) {
      return res.status(404).json({
        msg: "Link not found",
      });
    }
    const updatedLink = await LinkModel.findOneAndUpdate(
      { sub },
      { $set: { active: !link.active } },
      { new: true }
    );
    if (!updatedLink) {
      return res.status(404).json({
        msg: "Link not found",
      });
    }
    return res.status(200).json({
      active: updatedLink.active,
      hash: updatedLink.hash,
    });
  } catch (err) {
    res.status(400).json({
      msg: "Something went wrong",
    });
  }
};

export const shareBrainContent = async (
  req: Request,
  res: Response
): Promise<any> => {
  const hash = req.params.hash;
  try {
    const linkContent = await LinkModel.findOne({
      hash,
      active: true,
    });
    if (!linkContent) {
      return res.status(404).json({
        msg: "Hash not found",
      });
    }

    const sub = linkContent.sub;
    const content = await ContentModel.find({
      sub,
    }).sort({ lastUpdatedAt: -1 });
    res.status(200).json({
      content,
    });
  } catch (err) {
    res.status(400).json({
      msg: "Something went wrong",
    });
  }
};

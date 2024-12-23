import { z } from "zod";

export const contentSchema = z
  .object({
    title: z.string(),
    type: z.enum(["note", "link", "image"]),
    linkURL: z.string().url().optional(),
    noteContent: z.string().optional(),
    imageURL: z.string().url().optional(),
    createdAt: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }) // Ensure it's a valid ISO string
      .transform((val) => new Date(val)),
    lastUpdatedAt: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }) // Ensure it's a valid ISO string
      .transform((val) => new Date(val)),
  })
  .refine(
    (data) => {
      if (data.type === "link" && !data.linkURL) return false; // Require linkURL for 'link'
      if (data.type === "note" && !data.noteContent) return false; // Require noteContent for 'note'
      if (data.type === "image" && !data.imageURL) return false; // Require imageURL for 'image'
      return true;
    },
    {
      message:
        "Invalid content: Ensure required fields are provided based on the content type.",
    }
  );

export type contentType = z.infer<typeof contentSchema>;

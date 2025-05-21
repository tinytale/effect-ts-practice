import { z } from "zod";
import InvalidRequestParameter400 from "@/core/400.js";
import { BlogObject } from "../object.js";

export const InputSchema = z.object({
  content: BlogObject.shape.content.trim().meta({
    examples: ["吾輩は猫である。名前はまだない"],
    title: "コンテンツ",
    description: "コンテンツ",
  }),
  tags: BlogObject.shape.tags
    .optional()
    .default([])
    .meta({
      examples: [["#急上昇", "#トレンド"]],
      title: "タグ",
      description: "タグ",
    }),
});

export type InputSchemaType = z.infer<typeof InputSchema>;

export const ResponseSchema = z.object({
  201: BlogObject,
  400: z.discriminatedUnion("code", [
    InvalidRequestParameter400,
    z.object({
      code: z.literal("ALREADY_USED_BLOG_NUMBER"),
      message: z.string(),
    }),
  ]),
});

export type ResponseSchema = z.infer<typeof ResponseSchema>;

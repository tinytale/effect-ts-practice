import { z } from "zod";
import { BlogObject } from "../object.js";

export const InputSchema = z.object({
  blogId: BlogObject.shape.id,
  tags: BlogObject.shape.tags,
});

export const ResponseSchema = z.object({
  200: BlogObject,
  400: z.discriminatedUnion("code", [
    z.object({
      code: z.literal("INVALID_PARAMETER"),
      message: z.string().meta({
        title: "メッセージ",
        description: "エラーメッセージ",
      }),
    }),
  ]),
  404: z.discriminatedUnion("code", [
    z.object({
      code: z.literal("NOT_FOUND"),
      message: z.string().meta({
        title: "メッセージ",
        description: "エラーメッセージ",
      }),
    }),
  ]),
});

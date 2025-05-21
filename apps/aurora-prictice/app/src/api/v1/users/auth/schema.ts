import { z } from "zod";
import { UserObject } from "../object.js";

export const InputSchema = z.object({
  username: UserObject.shape.name.trim().meta({
    examples: ["@username", "@developer"],
    title: "ユーザ名",
    description: "ユーザ名",
  }),
  password: z.string(),
});

export const ResponseSchema = z.object({
  201: z.object({
    accessToken: z.string().meta({
      examples: ["@username", "@developer"],
      title: "アクセストークン",
      description: "アクセストークン",
    }),
  }),
  400: z.discriminatedUnion("code", [
    z.object({
      code: z.literal("USER_NOT_FOUND"),
      message: z.string(),
    }),
    z.object({
      code: z.literal("PASSWORD_MISS_MATCH"),
      message: z.string(),
    }),
  ]),
});

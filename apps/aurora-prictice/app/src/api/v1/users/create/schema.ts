import { z } from "zod";
import { UserObject } from "../object";

export const InputSchema = z.object({
  name: UserObject.shape.name.min(1).trim(),
  password: UserObject.shape.password.min(1).trim(),
});

export const ResponseSchema = z.object({
  201: UserObject,
  400: z.discriminatedUnion("code", [
    z.object({
      code: z.literal("INVALID_PARAMETER"),
      message: z.string(),
    }),
    z.object({
      code: z.literal("ALREADY_USED_NAME"),
      message: z.string(),
    }),
  ]),
});

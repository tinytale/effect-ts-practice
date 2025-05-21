import z from "zod";

export const UNAUTHORIZED_CODE = "UNAUTHORIZED" as const;

const UnAuthorized401 = z.object({
  code: z.literal(UNAUTHORIZED_CODE).meta({
    example: "UNAUTHORIZED",
    description: "エラーコード",
  }),
  message: z.string().meta({
    example: "Resource Access is denied",
    description: "メッセージ",
  }),
});

export default UnAuthorized401;

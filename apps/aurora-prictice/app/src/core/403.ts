import z from "zod";

export const ACCESS_DENIED_CODE = "ACCESS_DENIED" as const;

const AccessDenied403 = z.object({
  code: z.literal(ACCESS_DENIED_CODE).meta({
    example: "ACCESS_DENIED",
    description: "エラーコード",
  }),
  message: z.string().meta({
    example: "Resource Access is denied",
    description: "メッセージ",
  }),
});

export default AccessDenied403;

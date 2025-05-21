import { z } from "zod";

export const INVALID_REQUEST_PARAMETER_CODE =
  "INVALID_REQUEST_PARAMETER" as const;

const InvalidRequestParameter400 = z.object({
  code: z.literal(INVALID_REQUEST_PARAMETER_CODE).meta({
    example: INVALID_REQUEST_PARAMETER_CODE,
    description: "エラーコード",
  }),
  message: z.string(),
  errors: z
    .object({
      code: z.string().meta({
        description: "エラーコード",
        example: "INVALID_LITERAL",
      }),
      field: z.string().meta({
        description: "エラーが発生したフィールド",
        example: "staffId",
      }),
      message: z.string().meta({
        description: "エラーメッセージ",
        example: "Required",
      }),
    })
    .array(),
});

export default InvalidRequestParameter400;

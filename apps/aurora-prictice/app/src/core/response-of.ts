// import type { z, ZodTypeAny, ZodObject } from "zod";
// import type { TypedResponse } from "hono/types";

// type StatusCode = number;

// type RespondForStatus<
//   S extends ZodTypeAny,
//   U extends StatusCode,
// > = U extends 204
//   ? TypedResponse<null, U, "body">
//   : TypedResponse<z.infer<S>, U   , "json">;

// export type JSONRespondFromZodObject<Z extends ZodObject<any>> = {
//   [K in keyof Z["shape"]]: K extends StatusCode
//     ? RespondForStatus<Z["shape"][K], K>
//     : never;
// }[keyof Z["shape"] & StatusCode];

// Hono ハンドラーの戻り値型として使う
// export type ResponseOfZodObject<Z extends ZodObject<any>> = Promise<
//   JSONRespondFromZodObject<Z>
// >;

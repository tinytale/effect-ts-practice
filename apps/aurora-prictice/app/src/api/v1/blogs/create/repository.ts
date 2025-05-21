import { Context } from "effect";
import type { Effect } from "effect/Effect";
import type { BlogObject } from "@/api/v1/blogs/object";

export interface BlogRepository {
  exec: (i: { userId: string; content: string }) => Effect<BlogObject>;
}

export const BlogRepository = Context.GenericTag<
  "BlogRepository",
  BlogRepository
>("BlogRepository");

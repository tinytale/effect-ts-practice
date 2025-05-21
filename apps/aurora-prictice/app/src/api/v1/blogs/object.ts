import { BlogEntity } from "@prisma/models/blog.entity";
import { z } from "zod";

export const BlogObject = z.object({
  id: z.uuidv7().meta({
    title: "ID",
    description: "ID",
  }),
  userId: BlogEntity.shape.userId.meta({
    title: "UserId",
    description: "UserId",
  }),
  content: BlogEntity.shape.content.meta({
    title: "コンテンツ",
    description: "コンテンツ",
  }),
  tags: BlogEntity.shape.tags.meta({
    examples: [["#急上昇", "#トレンド"]],
    title: "タグ",
    description: "タグ",
  }),
  createdAt: z.iso.datetime().meta({
    title: "作成日",
    description: "作成日",
    examples: [new Date().toISOString()],
  }),
  updatedAt: z.iso.datetime().meta({
    title: "更新日",
    description: "更新日",
    examples: [new Date().toISOString()],
  }),
});

export type BlogObject = z.infer<typeof BlogObject>;

import { UserEntity } from "@prisma/models/user.entity";
import { z } from "zod";

export const UserObject = z.object({
  id: z.uuidv7().meta({
    title: "ID",
    description: "ID（uuidv7）",
  }),
  name: UserEntity.shape.name.meta({
    examples: ["username", "developer"],
    title: "username",
    description: "username 英字はじまり 最大文字：20文字 許可記号：+=._- ",
  }),
  password: UserEntity.shape.password.meta({
    title: "パスワード",
    description: "パスワード",
  }),
  createdAt: z.iso.datetime().meta({
    title: "作成日",
    description: "作成日（ISO STRING）",
  }),
  updateAt: z.iso.datetime().meta({
    title: "更新日",
    description: "更新日（ISO STRING）",
  }),
});

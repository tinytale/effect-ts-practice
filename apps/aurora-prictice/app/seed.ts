import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./src/.prisma/client";

const {
  DB_HOST,
  DB_PORT = "5432",
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
} = process.env;

const adapter = new PrismaPg({
  host: "localhost",
  port: Number(DB_PORT ?? 5432),
  user: "dbuser",
  password: "jH9O~6}^|3FnzdZamrCpJW0h7Ag5q>",
  database: "postgres",
  query_timeout: 50000,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const contents = [
    "今日はとてもいい天気ですね。",
    "最近 TypeScript を学び始めました。",
    "React のコンポーネント設計について考えています。",
    "AWS CDK でインフラ構築を自動化しています。",
    "Prisma の migrate は便利ですが注意も必要です。",
    "Hono + Zod の組み合わせが最高です。",
    "Docker マルチステージビルド試してみた。",
    "ECS Exec で DB にアクセスできるようになった！",
    "Makefile で CI/CD の一部を自動化しました。",
    "Slack 通知を SNS 経由で飛ばしてみた。",
  ];

  const prisma = new PrismaClient({
    adapter,
  });

  const data = Array.from({ length: 300000 }).map(() => ({
    userId: "user-123",
    content: contents[Math.floor(Math.random() * contents.length)],
  }));

  await prisma.blog.createMany({
    data,
    skipDuplicates: true,
  });

  await prisma.blog.create({
    data: {
      userId: "user-123",
      content: "好きな食べ物はマカロニです。",
    },
  });

  const result = await prisma.blog.findMany({
    where: {
      userId: "user-123",
      content: {
        contains: "マカロニ",
      },
    },
  });

  console.log(result);
}

main();

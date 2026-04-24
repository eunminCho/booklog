import { PrismaClient, BookStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const user = await prisma.user.upsert({
    where: { email: "tester@booklog.local" },
    update: {},
    create: {
      email: "tester@booklog.local",
      passwordHash: "argon2id$seed$placeholder",
    },
  });

  await prisma.note.deleteMany({ where: { userId: user.id } });
  await prisma.book.deleteMany({ where: { userId: user.id } });

  const [book1, book2, book3] = await Promise.all([
    prisma.book.create({
      data: {
        userId: user.id,
        isbn: "9780132350884",
        title: "Clean Code",
        authors: ["Robert C. Martin"],
        thumbnail: "https://example.com/clean-code.jpg",
        status: BookStatus.READING,
        rating: 5,
      },
    }),
    prisma.book.create({
      data: {
        userId: user.id,
        isbn: "9780137081073",
        title: "Clean Coder",
        authors: ["Robert C. Martin"],
        thumbnail: "https://example.com/clean-coder.jpg",
        status: BookStatus.DONE,
        rating: 4,
      },
    }),
    prisma.book.create({
      data: {
        userId: user.id,
        isbn: "9780134494166",
        title: "Clean Architecture",
        authors: ["Robert C. Martin"],
        thumbnail: "https://example.com/clean-architecture.jpg",
        status: BookStatus.WISHLIST,
      },
    }),
  ]);

  await prisma.note.createMany({
    data: [
      {
        userId: user.id,
        bookId: book1.id,
        content: "챕터 1 정리: 의미 있는 이름은 맥락을 드러낸다.",
      },
      {
        userId: user.id,
        bookId: book2.id,
        content: "실천 포인트: 작은 단위로 배포 가능한 설계 유지.",
      },
    ],
  });

  console.log("Seed completed", {
    userId: user.id,
    bookIds: [book1.id, book2.id, book3.id],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

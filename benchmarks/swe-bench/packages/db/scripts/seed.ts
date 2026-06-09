import { prisma } from "../src/client.js";

async function seed() {
  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      name: "Alice",
      role: "admin",
      balance: 1000,
      profile: { create: { bio: "Admin user" } },
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      name: "Bob",
      balance: 500,
      profile: { create: { bio: "Regular user" } },
    },
  });

  await prisma.post.createMany({
    data: [
      { title: "First Post", content: "Hello world", status: "published", authorId: alice.id },
      { title: "Second Post", content: "Another post", status: "draft", authorId: alice.id },
      { title: "Bob's Post", content: "My thoughts", status: "published", authorId: bob.id },
    ],
  });

  await prisma.benchmark.createMany({
    data: [
      { name: "Speed Test", score: 95.5, tags: "performance" },
      { name: "Memory Test", score: 88.2, tags: "performance" },
      { name: "Accuracy Test", score: 99.1, tags: "quality" },
    ],
  });

  await prisma.organization.createMany({
    data: [
      { name: "Acme Corp" },
      { name: "Globex" },
    ],
  });

  console.log("Database seeded successfully.");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

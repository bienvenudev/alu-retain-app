import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.category.upsert({
    where: { name: 'Uncategorized' },
    update: {},
    create: { name: 'Uncategorized' },
  })
}

main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

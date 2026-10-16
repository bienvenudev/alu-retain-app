import 'dotenv/config'

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// "Uncategorized" is where expenses move when their category is deleted.
const categoryNames = [
  'Uncategorized',
  'Food & Dining',
  'Transport',
  'Housing',
  'Utilities',
  'Entertainment',
  'Health',
  'Shopping',
]

async function main() {
  for (const name of categoryNames) {
    await prisma.category.upsert({
      create: { name },
      update: {},
      where: { name },
    })
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    console.log('ADMIN_EMAIL / ADMIN_PASSWORD not set; skipping admin user.')
    return
  }

  // An existing admin is left untouched so re-seeding never resets a password.
  await prisma.user.upsert({
    create: {
      email,
      name: 'Administrator',
      passwordHash: await bcrypt.hash(password, 12),
      role: 'ADMIN',
    },
    update: {},
    where: { email },
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

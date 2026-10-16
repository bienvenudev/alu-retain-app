import 'dotenv/config'

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

import { demoBudgets, demoExpenses } from './demo-data.js'

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

async function seedAdmin() {
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

// Creates a demo account with sample expenses and budgets, but only if it does
// not exist yet, so re-seeding never duplicates data or overwrites changes.
async function seedDemoUser() {
  const email = process.env.DEMO_EMAIL?.trim().toLowerCase()
  const password = process.env.DEMO_PASSWORD

  if (!email || !password) {
    console.log('DEMO_EMAIL / DEMO_PASSWORD not set; skipping demo user.')
    return
  }

  if (await prisma.user.findUnique({ where: { email } })) {
    console.log('Demo user already exists; leaving it unchanged.')
    return
  }

  const categories = await prisma.category.findMany()
  const categoryId = new Map(categories.map((category) => [category.name, category.id]))
  const now = new Date()
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())

  await prisma.user.create({
    data: {
      budgets: {
        create: demoBudgets.map(({ amount, monthsAgo }) => {
          const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo, 1))

          return { amount, month: month.getUTCMonth() + 1, year: month.getUTCFullYear() }
        }),
      },
      email,
      expenses: {
        create: demoExpenses.map(({ category, daysAgo, ...expense }) => {
          const id = categoryId.get(category)

          if (!id) {
            throw new Error(`Seed category "${category}" is missing.`)
          }

          return {
            ...expense,
            categoryId: id,
            expenseDate: new Date(today - daysAgo * 24 * 60 * 60 * 1000),
          }
        }),
      },
      name: 'Demo User',
      passwordHash: await bcrypt.hash(password, 12),
    },
  })
  console.log(`Created demo user ${email} with sample data.`)
}

async function main() {
  for (const name of categoryNames) {
    await prisma.category.upsert({
      create: { name },
      update: {},
      where: { name },
    })
  }

  await seedAdmin()
  await seedDemoUser()
}

main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

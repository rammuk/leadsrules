const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Hash the admin password
  const hashedPassword = await bcrypt.hash('admin123', 12)

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@leadsrules.com' },
    update: {},
    create: {
      email: 'admin@leadsrules.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    },
  })

  console.log('Admin user created:', admin)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
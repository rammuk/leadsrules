const { PrismaClient } = require('@prisma/client')

// Local database connection
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL // Local database
    }
  }
})

// Production database connection
const productionPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://fea2646b084682099ce36883962fda370744d8caae643ee50e13618e56fe294f:sk_hOtByPsz68q2L4Vz4eHlX@db.prisma.io:5432/?sslmode=require"
    }
  }
})

async function syncData() {
  try {
    console.log('🔄 Starting data sync from local to production...')

    // Sync Users
    console.log('📊 Syncing users...')
    const users = await localPrisma.user.findMany()
    for (const user of users) {
      await productionPrisma.user.upsert({
        where: { email: user.email },
        update: user,
        create: user
      })
    }
    console.log(`✅ Synced ${users.length} users`)

    // Sync Websites
    console.log('📊 Syncing websites...')
    const websites = await localPrisma.website.findMany()
    for (const website of websites) {
      await productionPrisma.website.upsert({
        where: { id: website.id },
        update: website,
        create: website
      })
    }
    console.log(`✅ Synced ${websites.length} websites`)

    // Sync Question Banks
    console.log('📊 Syncing question banks...')
    const questionBanks = await localPrisma.questionBank.findMany()
    for (const questionBank of questionBanks) {
      await productionPrisma.questionBank.upsert({
        where: { id: questionBank.id },
        update: questionBank,
        create: questionBank
      })
    }
    console.log(`✅ Synced ${questionBanks.length} question banks`)

    // Sync Question Options
    console.log('📊 Syncing question options...')
    const questionOptions = await localPrisma.questionOption.findMany()
    for (const option of questionOptions) {
      await productionPrisma.questionOption.upsert({
        where: { id: option.id },
        update: option,
        create: option
      })
    }
    console.log(`✅ Synced ${questionOptions.length} question options`)

    // Sync Questionnaires
    console.log('📊 Syncing questionnaires...')
    const questionnaires = await localPrisma.questionnaire.findMany()
    for (const questionnaire of questionnaires) {
      await productionPrisma.questionnaire.upsert({
        where: { id: questionnaire.id },
        update: questionnaire,
        create: questionnaire
      })
    }
    console.log(`✅ Synced ${questionnaires.length} questionnaires`)

    // Sync Steps
    console.log('📊 Syncing steps...')
    const steps = await localPrisma.questionnaireStep.findMany()
    for (const step of steps) {
      await productionPrisma.questionnaireStep.upsert({
        where: { id: step.id },
        update: step,
        create: step
      })
    }
    console.log(`✅ Synced ${steps.length} steps`)

    // Sync Step Questions
    console.log('📊 Syncing step questions...')
    const stepQuestions = await localPrisma.stepQuestion.findMany()
    for (const stepQuestion of stepQuestions) {
      await productionPrisma.stepQuestion.upsert({
        where: { id: stepQuestion.id },
        update: stepQuestion,
        create: stepQuestion
      })
    }
    console.log(`✅ Synced ${stepQuestions.length} step questions`)

    // Sync Step Question Options
    console.log('📊 Syncing step question options...')
    const stepQuestionOptions = await localPrisma.stepQuestionOption.findMany()
    for (const option of stepQuestionOptions) {
      await productionPrisma.stepQuestionOption.upsert({
        where: { id: option.id },
        update: option,
        create: option
      })
    }
    console.log(`✅ Synced ${stepQuestionOptions.length} step question options`)

    // Sync Responses
    console.log('📊 Syncing responses...')
    const responses = await localPrisma.response.findMany()
    for (const response of responses) {
      await productionPrisma.response.upsert({
        where: { id: response.id },
        update: response,
        create: response
      })
    }
    console.log(`✅ Synced ${responses.length} responses`)

    console.log('🎉 Data sync completed successfully!')
    console.log('🌐 Your production database is now synced with local data')

  } catch (error) {
    console.error('❌ Error during sync:', error)
    process.exit(1)
  } finally {
    await localPrisma.$disconnect()
    await productionPrisma.$disconnect()
  }
}

syncData() 
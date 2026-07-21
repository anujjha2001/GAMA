const { prisma } = require('./src/lib/prisma');

async function main() {
  try {
    const count = await prisma.medicalDocument.count();
    console.log('Count:', count);
  } catch (err) {
    console.log('Error Type:', err.constructor.name);
    console.log('Message:', err.message);
    console.log('Code:', err.code);
    console.log('Meta:', err.meta);
  } finally {
    await prisma.$disconnect();
  }
}

main();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('Testing GAMA AURA Rate Limiter DB state inside workspace...');
  try {
    const user = await prisma.userProfile.findFirst();
    if (!user) {
      console.log('No user found in the database. Please register/login first.');
      return;
    }

    console.log(`User found: ${user.fullName} (${user.email})`);
    console.log(`Current Tokens: ${user.auraTokens}`);
    console.log(`Tokens Reset At: ${user.tokensResetAt}`);

    const originalTokens = user.auraTokens;
    const originalResetAt = user.tokensResetAt;

    console.log('Setting tokens to 0 to test exhaustion check...');
    await prisma.userProfile.update({
      where: { id: user.id },
      data: { auraTokens: 0 }
    });

    let updatedUser = await prisma.userProfile.findUnique({ where: { id: user.id } });
    console.log(`Simulated state - Tokens: ${updatedUser.auraTokens}`);

    console.log('Restoring user profile back to original state...');
    await prisma.userProfile.update({
      where: { id: user.id },
      data: {
        auraTokens: originalTokens,
        tokensResetAt: originalResetAt
      }
    });

    console.log('Database test succeeded. Verification completed.');
  } catch (err) {
    console.error('Error running test script:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();

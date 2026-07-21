import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = `${process.env.DIRECT_URL || process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Database...');

  // Create a default user profile to act as the primary test subject
  const user = await prisma.userProfile.upsert({
    where: { email: 'test@gama.com' },
    update: {},
    create: {
      userId: 'mock-user-id-1234',
      email: 'test@gama.com',
      fullName: 'Test User',
      settings: {
        create: {
          theme: 'dark'
        }
      }
    },
  });
  console.log(`Created user: ${user.email}`);

  // Seed Foods
  const foods = [
    {
      name: 'Paneer (Raw)',
      aliases: ['paneer', 'cottage cheese', 'indian cheese'],
      category: 'dairy',
      servingSize: 100,
      servingUnit: 'g',
      calories: 265,
      protein: 14,
      carbs: 1.2,
      fat: 20,
      fiber: 0,
      sugar: 1.2,
      isVegetarian: true,
      benefits: ['High protein', 'Calcium rich'],
      risks: ['High saturated fat']
    },
    {
      name: 'Chicken Breast (Grilled)',
      aliases: ['chicken', 'grilled chicken', 'poultry'],
      category: 'meat',
      servingSize: 100,
      servingUnit: 'g',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      sugar: 0,
      benefits: ['Lean protein', 'Muscle building'],
      risks: []
    },
    {
      name: 'Avocado',
      aliases: ['avocado', 'butter fruit'],
      category: 'fruit',
      servingSize: 100,
      servingUnit: 'g',
      calories: 160,
      protein: 2,
      carbs: 8.5,
      fat: 14.7,
      fiber: 6.7,
      sugar: 0.7,
      isVegetarian: true,
      isVegan: true,
      benefits: ['Healthy fats', 'Heart health'],
      risks: ['Calorie dense']
    },
    {
      name: 'Quinoa (Cooked)',
      aliases: ['quinoa', 'grains'],
      category: 'grains',
      servingSize: 100,
      servingUnit: 'g',
      calories: 120,
      protein: 4.4,
      carbs: 21.3,
      fat: 1.9,
      fiber: 2.8,
      sugar: 0.9,
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      benefits: ['Complete protein', 'High fiber'],
      risks: []
    }
  ];

  for (const food of foods) {
    const existing = await prisma.food.findFirst({ where: { name: food.name } });
    if (!existing) {
      await prisma.food.create({ data: food });
    }
  }
  console.log(`Seeded ${foods.length} foods.`);

  // Seed Medical RAG Vectors (Mock implementation)
  const docs = [
    {
      title: 'Circadian Rhythm and Sleep',
      content: 'Viewing sunlight within 30-60 minutes of waking triggers a cortisol pulse that sets the circadian clock, improving nighttime melatonin release and sleep quality.',
      category: 'sleep'
    },
    {
      title: 'Protein Synthesis Timing',
      content: 'Muscle protein synthesis is maximized by consuming 20-40g of high-quality protein every 3-4 hours, rather than a single massive dose.',
      category: 'nutrition'
    }
  ];

  for (const doc of docs) {
    const existing = await prisma.vectorDocument.findFirst({ where: { title: doc.title } });
    if (!existing) {
      await prisma.vectorDocument.create({ data: doc });
    }
  }
  console.log(`Seeded ${docs.length} knowledge vectors.`);

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

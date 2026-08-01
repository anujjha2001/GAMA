import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Live Order Development Data...');

  // Create Delivery Providers
  const swiggy = await prisma.deliveryProvider.upsert({
    where: { name: 'Swiggy' },
    update: {},
    create: { name: 'Swiggy' },
  });

  const zomato = await prisma.deliveryProvider.upsert({
    where: { name: 'Zomato' },
    update: {},
    create: { name: 'Zomato' },
  });

  // Create Country, State, City
  const india = await prisma.country.upsert({
    where: { code: 'IN' },
    update: {},
    create: { name: 'India', code: 'IN' },
  });

  const karnataka = await prisma.state.upsert({
    where: { name_countryId: { name: 'Karnataka', countryId: india.id } },
    update: {},
    create: { name: 'Karnataka', code: 'KA', countryId: india.id },
  });

  const blr = await prisma.city.upsert({
    where: { name_stateId: { name: 'Bengaluru', stateId: karnataka.id } },
    update: {},
    create: { name: 'Bengaluru', stateId: karnataka.id },
  });

  // Create Cuisine
  const healthyCuisine = await prisma.cuisine.upsert({
    where: { name: 'Healthy Bowls' },
    update: {},
    create: { name: 'Healthy Bowls', description: 'Nutritious and balanced bowls' },
  });

  // Create Restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'Green Olive Deli',
      description: 'Premium organic healthy meals.',
      healthScore: 95,
      healthyMenuPct: 100,
      cuisines: { connect: { id: healthyCuisine.id } },
      branches: {
        create: {
          address: 'Koramangala, Bengaluru',
          lat: 12.9279,
          lng: 77.6271,
          cityId: blr.id,
          availability: {
            create: [
              { providerId: swiggy.id, deliveryFee: 40, etaMin: 15, etaMax: 25 },
              { providerId: zomato.id, deliveryFee: 35, etaMin: 20, etaMax: 30 },
            ]
          }
        }
      }
    }
  });

  // Create Healthy Meal
  const meal = await prisma.healthyMeal.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Garden Fresh Chicken Salad',
      description: 'High lean protein, rich in organic dietary fiber, and low glycemic index.',
      basePrice: 320,
      calories: 320,
      protein: 28,
      carbs: 18,
      fat: 14,
      healthScore: 94,
      cuisines: { connect: { id: healthyCuisine.id } },
      tags: {
        create: [{ name: 'High Protein' }, { name: 'Keto' }]
      },
      nutrition: {
        create: {
          fiber: 6,
          sugar: 4,
          sodium: 340,
          glycemicLoad: 4,
          processedPct: 0.1,
          vitamins: { 'Vitamin A': '15%', 'Vitamin C': '20%' },
          minerals: { 'Iron': '10%', 'Calcium': '5%' }
        }
      },
      aiAnalyses: {
        create: {
          proteinScore: 90,
          recoveryScore: 92,
          muscleGainScore: 85,
          weightLossScore: 95,
          heartHealthScore: 88,
          diabetesFriendly: 92,
          bloodPressureScore: 85,
          gutHealthScore: 94,
          inflammationScore: 90,
          satietyScore: 88,
          hydrationImpact: 80,
          summary: 'Excellent choice for recovery and lean muscle maintenance. High fiber promotes gut health.'
        }
      }
    }
  });

  console.log('Seeding complete. Created meal:', meal.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

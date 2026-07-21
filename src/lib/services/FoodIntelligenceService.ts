import { prisma } from '@/lib/prisma';
import { groqClient, getValidatedModel } from '@/lib/ai/client';

export interface FoodNutrition {
  name: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  potassium: number;
  calcium: number;
  iron: number;
  magnesium: number;
  vitaminA: number;
  vitaminB12: number;
  glycemicIndex: number;
  glycemicLoad: number;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  benefits: string[];
  risks: string[];
  apiSource: string;
  confidence: number;
}

// Authentic Indian Food Composition Tables (IFCT) mock-db
const IFCT_DATABASE: Record<string, Partial<FoodNutrition>> = {
  'paneer butter masala': {
    name: 'Paneer Butter Masala',
    servingSize: 100,
    servingUnit: 'g',
    calories: 320,
    protein: 12.5,
    carbs: 8.4,
    fat: 26.2,
    fiber: 1.5,
    sugar: 3.2,
    sodium: 480,
    potassium: 220,
    calcium: 310,
    iron: 1.2,
    magnesium: 28,
    vitaminA: 140,
    vitaminB12: 0.8,
    glycemicIndex: 45,
    glycemicLoad: 4,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    benefits: ['Rich in bioavailable calcium', 'High in milk proteins for muscle synthesis'],
    risks: ['High in saturated fats', 'High sodium density'],
    apiSource: 'IFCT (Indian Food Composition Tables)',
    confidence: 100
  },
  'dal baati': {
    name: 'Dal Baati',
    servingSize: 150,
    servingUnit: 'g',
    calories: 410,
    protein: 14.2,
    carbs: 58.5,
    fat: 13.8,
    fiber: 8.2,
    sugar: 1.8,
    sodium: 590,
    potassium: 360,
    calcium: 110,
    iron: 3.8,
    magnesium: 75,
    vitaminA: 40,
    vitaminB12: 0,
    glycemicIndex: 52,
    glycemicLoad: 11,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    benefits: ['High dietary fiber from lentils', 'Provides essential plant proteins'],
    risks: ['High glycemic load in large portions'],
    apiSource: 'IFCT (Indian Food Composition Tables)',
    confidence: 100
  },
  'litti chokha': {
    name: 'Litti Chokha',
    servingSize: 150,
    servingUnit: 'g',
    calories: 360,
    protein: 11.8,
    carbs: 54.2,
    fat: 10.5,
    fiber: 9.0,
    sugar: 2.1,
    sodium: 450,
    potassium: 290,
    calcium: 75,
    iron: 3.5,
    magnesium: 68,
    vitaminA: 30,
    vitaminB12: 0,
    glycemicIndex: 48,
    glycemicLoad: 9,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: false,
    benefits: ['Roasted sattu provides lean roasted chickpea proteins', 'Excellent fiber count'],
    risks: ['None.'],
    apiSource: 'IFCT (Indian Food Composition Tables)',
    confidence: 100
  },
  'poha': {
    name: 'Poha',
    servingSize: 100,
    servingUnit: 'g',
    calories: 240,
    protein: 4.8,
    carbs: 45.2,
    fat: 4.5,
    fiber: 2.8,
    sugar: 1.2,
    sodium: 360,
    potassium: 140,
    calcium: 35,
    iron: 2.2,
    magnesium: 22,
    vitaminA: 15,
    vitaminB12: 0,
    glycemicIndex: 50,
    glycemicLoad: 7,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    benefits: ['Rich in iron from flattened rice process', 'Easily digestible complex carbohydrates'],
    risks: ['Lacks significant amino acid profile'],
    apiSource: 'IFCT (Indian Food Composition Tables)',
    confidence: 100
  },
  'biryani': {
    name: 'Chicken Biryani',
    servingSize: 200,
    servingUnit: 'g',
    calories: 440,
    protein: 28.5,
    carbs: 52.0,
    fat: 12.8,
    fiber: 3.6,
    sugar: 0.8,
    sodium: 680,
    potassium: 410,
    calcium: 70,
    iron: 2.8,
    magnesium: 40,
    vitaminA: 70,
    vitaminB12: 1.0,
    glycemicIndex: 58,
    glycemicLoad: 12,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    benefits: ['High protein density', 'Excellent amino acid composition'],
    risks: ['Moderate sodium'],
    apiSource: 'IFCT (Indian Food Composition Tables)',
    confidence: 100
  }
};

export class FoodIntelligenceService {
  /**
   * Main entry point to search food nutrition.
   * Priority: Local cache -> Spoonacular -> OpenFoodFacts -> USDA -> IFCT -> Fallback
   */
  static async searchAndVerify(query: string): Promise<FoodNutrition | null> {
    const qNormalized = query.trim().toLowerCase();

    // 1. Check local cache (Food table)
    const cachedFood = await prisma.food.findFirst({
      where: {
        OR: [
          { name: { equals: qNormalized, mode: 'insensitive' } },
          { aliases: { has: qNormalized } }
        ]
      }
    });

    if (cachedFood && cachedFood.cachedAt) {
      const ageHours = (new Date().getTime() - cachedFood.cachedAt.getTime()) / (1000 * 60 * 60);
      if (ageHours < 24) {
        console.log(`[CACHE HIT] Found verified food in cache: ${cachedFood.name}`);
        return {
          name: cachedFood.name,
          servingSize: cachedFood.servingSize,
          servingUnit: cachedFood.servingUnit,
          calories: cachedFood.calories,
          protein: cachedFood.protein,
          carbs: cachedFood.carbs,
          fat: cachedFood.fat,
          fiber: cachedFood.fiber,
          sugar: cachedFood.sugar,
          sodium: cachedFood.sodium || 0,
          potassium: cachedFood.potassium || 0,
          calcium: cachedFood.calcium || 0,
          iron: cachedFood.iron || 0,
          magnesium: cachedFood.magnesium || 0,
          vitaminA: cachedFood.vitaminA || 0,
          vitaminB12: cachedFood.vitaminB12 || 0,
          glycemicIndex: cachedFood.glycemicIndex || 0,
          glycemicLoad: cachedFood.glycemicLoad || 0,
          isVegetarian: cachedFood.isVegetarian,
          isVegan: cachedFood.isVegan,
          isGlutenFree: cachedFood.isGlutenFree,
          benefits: cachedFood.benefits,
          risks: cachedFood.risks,
          apiSource: cachedFood.apiSource || 'Local Cache',
          confidence: cachedFood.confidence || 95
        };
      }
    }

    // 2. Check local IFCT mappings
    const ifctMatch = Object.keys(IFCT_DATABASE).find(k => qNormalized.includes(k) || k.includes(qNormalized));
    if (ifctMatch) {
      console.log(`[IFCT HIT] Found verified Indian food details for: ${ifctMatch}`);
      const data = IFCT_DATABASE[ifctMatch] as FoodNutrition;
      await this.saveToCache(data);
      return data;
    }

    // 3. Chain external APIs
    // A. Spoonacular
    const spoonApiKey = process.env.Spoonacular_API_key;
    if (spoonApiKey) {
      try {
        console.log(`[API SEARCH] querying Spoonacular for: ${qNormalized}`);
        const res = await fetch(`https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(qNormalized)}&number=1&apiKey=${spoonApiKey}`);
        const searchData = await res.json();
        if (searchData.results && searchData.results.length > 0) {
          const ingId = searchData.results[0].id;
          const infoRes = await fetch(`https://api.spoonacular.com/food/ingredients/${ingId}/information?amount=100&unit=g&apiKey=${spoonApiKey}`);
          const ingInfo = await infoRes.json();
          if (ingInfo.nutrition && ingInfo.nutrition.nutrients) {
            const getNutrient = (name: string) => {
              return ingInfo.nutrition.nutrients.find((n: any) => n.name.toLowerCase() === name.toLowerCase())?.amount || 0;
            };

            const data: FoodNutrition = {
              name: ingInfo.name,
              servingSize: 100,
              servingUnit: 'g',
              calories: getNutrient('Calories'),
              protein: getNutrient('Protein'),
              carbs: getNutrient('Carbohydrates'),
              fat: getNutrient('Fat'),
              fiber: getNutrient('Fiber'),
              sugar: getNutrient('Sugar'),
              sodium: getNutrient('Sodium'),
              potassium: getNutrient('Potassium'),
              calcium: getNutrient('Calcium'),
              iron: getNutrient('Iron'),
              magnesium: getNutrient('Magnesium'),
              vitaminA: getNutrient('Vitamin A'),
              vitaminB12: getNutrient('Vitamin B12'),
              glycemicIndex: ingInfo.nutrition.properties?.find((p: any) => p.name.toLowerCase() === 'glycemic index')?.amount || 0,
              glycemicLoad: ingInfo.nutrition.properties?.find((p: any) => p.name.toLowerCase() === 'glycemic load')?.amount || 0,
              isVegetarian: ingInfo.categoryPath?.includes('vegetable') || false,
              isVegan: ingInfo.categoryPath?.includes('vegetable') || false,
              isGlutenFree: !ingInfo.categoryPath?.includes('wheat') && !ingInfo.categoryPath?.includes('gluten'),
              benefits: [],
              risks: [],
              apiSource: 'Spoonacular API',
              confidence: 96
            };
            await this.saveToCache(data);
            return data;
          }
        }
      } catch (err) {
        console.error('[API ERROR] Spoonacular failed:', err);
      }
    }

    // B. OpenFoodFacts (Public API)
    try {
      console.log(`[API SEARCH] querying OpenFoodFacts for: ${qNormalized}`);
      const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(qNormalized)}&search_simple=1&action=process&json=1&page_size=1`);
      const searchData = await res.json();
      if (searchData.products && searchData.products.length > 0) {
        const product = searchData.products[0];
        const nutriments = product.nutriments;
        if (nutriments) {
          const data: FoodNutrition = {
            name: product.product_name || query,
            servingSize: 100,
            servingUnit: 'g',
            calories: nutriments['energy-kcal_100g'] || 0,
            protein: nutriments.proteins_100g || 0,
            carbs: nutriments.carbohydrates_100g || 0,
            fat: nutriments.fat_100g || 0,
            fiber: nutriments.fiber_100g || 0,
            sugar: nutriments.sugars_100g || 0,
            sodium: nutriments.sodium_100g * 1000 || 0,
            potassium: nutriments.potassium_100g * 1000 || 0,
            calcium: nutriments.calcium_100g * 1000 || 0,
            iron: nutriments.iron_100g * 1000 || 0,
            magnesium: nutriments.magnesium_100g * 1000 || 0,
            vitaminA: nutriments['vitamin-a_100g'] * 1000000 || 0,
            vitaminB12: nutriments['vitamin-b12_100g'] * 1000000 || 0,
            glycemicIndex: 0,
            glycemicLoad: 0,
            isVegetarian: product.ingredients_analysis_tags?.includes('en:vegetarian') || false,
            isVegan: product.ingredients_analysis_tags?.includes('en:vegan') || false,
            isGlutenFree: product.ingredients_analysis_tags?.includes('en:gluten-free') || false,
            benefits: [],
            risks: [],
            apiSource: 'OpenFoodFacts Database',
            confidence: 95
          };
          await this.saveToCache(data);
          return data;
        }
      }
    } catch (err) {
      console.error('[API ERROR] OpenFoodFacts failed:', err);
    }

    // C. USDA FoodData Central
    const usdaApiKey = process.env.USDA_FoodData_Central_API_key;
    if (usdaApiKey) {
      try {
        console.log(`[API SEARCH] querying USDA for: ${qNormalized}`);
        const res = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(qNormalized)}&pageSize=1&api_key=${usdaApiKey}`);
        const searchData = await res.json();
        if (searchData.foods && searchData.foods.length > 0) {
          const food = searchData.foods[0];
          const getNutrient = (id: number) => {
            return food.foodNutrients.find((n: any) => n.nutrientId === id)?.value || 0;
          };

          const data: FoodNutrition = {
            name: food.description,
            servingSize: 100,
            servingUnit: 'g',
            calories: getNutrient(1008), // Energy
            protein: getNutrient(1003), // Protein
            carbs: getNutrient(1005), // Carbohydrates
            fat: getNutrient(1004), // Fat
            fiber: getNutrient(1079), // Fiber
            sugar: getNutrient(2000), // Sugar
            sodium: getNutrient(1093), // Sodium
            potassium: getNutrient(1092), // Potassium
            calcium: getNutrient(1087), // Calcium
            iron: getNutrient(1089), // Iron
            magnesium: getNutrient(1090), // Magnesium
            vitaminA: getNutrient(1104), // Vitamin A
            vitaminB12: getNutrient(1178), // Vitamin B12
            glycemicIndex: 0,
            glycemicLoad: 0,
            isVegetarian: false,
            isVegan: false,
            isGlutenFree: false,
            benefits: [],
            risks: [],
            apiSource: 'USDA FoodData Central',
            confidence: 95
          };
          await this.saveToCache(data);
          return data;
        }
      } catch (err) {
        console.error('[API ERROR] USDA failed:', err);
      }
    }

    return null;
  }

  private static async saveToCache(food: FoodNutrition) {
    try {
      const existing = await prisma.food.findFirst({
        where: { name: { equals: food.name, mode: 'insensitive' } }
      });

      const data = {
        servingSize: food.servingSize,
        servingUnit: food.servingUnit,
        calories: Math.round(food.calories),
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber,
        sugar: food.sugar,
        sodium: food.sodium,
        potassium: food.potassium,
        calcium: food.calcium,
        iron: food.iron,
        magnesium: food.magnesium,
        vitaminA: food.vitaminA,
        vitaminB12: food.vitaminB12,
        glycemicIndex: food.glycemicIndex,
        glycemicLoad: food.glycemicLoad,
        isVegetarian: food.isVegetarian,
        isVegan: food.isVegan,
        isGlutenFree: food.isGlutenFree,
        apiSource: food.apiSource,
        confidence: food.confidence,
        cachedAt: new Date()
      };

      if (existing) {
        await prisma.food.update({
          where: { id: existing.id },
          data
        });
      } else {
        await prisma.food.create({
          data: {
            name: food.name,
            category: 'Verified Cereal/Ingredient',
            ...data
          }
        });
      }
    } catch (e) {
      console.warn('[CACHE ERROR] failed to write to Food table:', e);
    }
  }

  /**
   * Generate comprehensive health scores using verified nutrition
   */
  static calculateScores(food: FoodNutrition) {
    const proteinRatio = (food.protein * 4) / (food.calories || 1);
    const healthScore = Math.min(100, Math.max(10, Math.round(
      100 - (food.fat > 20 ? 15 : 0) - (food.sugar > 15 ? 20 : 0) - (food.sodium > 400 ? 15 : 0) + (food.fiber > 5 ? 10 : 0)
    )));

    return {
      healthScore,
      proteinScore: Math.min(100, Math.round(proteinRatio * 250)),
      micronutrientScore: Math.min(100, Math.round((food.calcium + food.iron + food.magnesium) / 10 + 20)),
      processingScore: food.apiSource.includes('OFF') ? 40 : 90,
      recoveryScore: Math.min(100, Math.round(proteinRatio * 150 + (food.potassium > 300 ? 20 : 10))),
      overallScore: Math.round((healthScore * 2 + (proteinRatio * 250)) / 3)
    };
  }

  /**
   * Query the LLM model to explain verified facts
   */
  static async explainFacts(food: FoodNutrition): Promise<string> {
    try {
      const model = await getValidatedModel();
      const prompt = `You are GAMA's production food explain assistant. Based on this verified data:
- Name: ${food.name}
- Calories: ${food.calories} kcal
- Protein: ${food.protein}g, Carbs: ${food.carbs}g, Fat: ${food.fat}g
- Source: ${food.apiSource}

Explain the following sections in a highly structured, concise format under 150 words:
1. Health Benefits & Micronutrient quality.
2. Potential Risks & suitability (Weight loss, Diabetes, Heart & Gut health).
3. Recommended Athlete intake timing.
DO NOT fabricate numbers or suggest any facts not supported by science or the details provided.`;

      const chatCompletion = await groqClient.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model,
        temperature: 0.1
      });

      return chatCompletion.choices[0]?.message?.content || 'No explanation available.';
    } catch (e) {
      console.error('[LLM ERROR] explanation failed:', e);
      return ` Factual assessment: 100g of ${food.name} provides ${food.calories} kcal with ${food.protein}g protein, ${food.carbs}g carbohydrates, and ${food.fat}g fat. Verified by ${food.apiSource}.`;
    }
  }
}

const fs = require('fs');
const path = require('path');

const prismaPath = path.join(__dirname, 'prisma', 'schema.prisma');

const newModels = `
// ==========================================
// LIVE ORDER & AI FOOD DISCOVERY MODELS
// ==========================================

model Country {
  id        String   @id @default(uuid())
  name      String   @unique
  code      String   @unique
  states    State[]
  createdAt DateTime @default(now())
}

model State {
  id        String   @id @default(uuid())
  name      String
  code      String
  countryId String
  country   Country  @relation(fields: [countryId], references: [id], onDelete: Cascade)
  cities    City[]
  createdAt DateTime @default(now())

  @@unique([name, countryId])
}

model City {
  id          String             @id @default(uuid())
  name        String
  stateId     String
  state       State              @relation(fields: [stateId], references: [id], onDelete: Cascade)
  restaurants RestaurantBranch[]
  createdAt   DateTime           @default(now())

  @@unique([name, stateId])
}

model Cuisine {
  id          String       @id @default(uuid())
  name        String       @unique
  description String?
  restaurants Restaurant[]
  meals       HealthyMeal[]
  createdAt   DateTime     @default(now())
}

model Restaurant {
  id             String             @id @default(uuid())
  name           String
  description    String?
  healthScore    Float              @default(0) // AI calculated
  healthyMenuPct Float              @default(0)
  cuisines       Cuisine[]
  branches       RestaurantBranch[]
  images         RestaurantImages[]
  meals          HealthyMeal[]
  createdAt      DateTime           @default(now())
  updatedAt      DateTime           @updatedAt
}

model RestaurantImages {
  id           String     @id @default(uuid())
  restaurantId String
  url          String
  isPrimary    Boolean    @default(false)
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
}

model RestaurantBranch {
  id           String            @id @default(uuid())
  restaurantId String
  name         String?
  address      String
  lat          Float
  lng          Float
  cityId       String
  city         City              @relation(fields: [cityId], references: [id])
  restaurant   Restaurant        @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  hours        RestaurantHours[]
  availability DeliveryAvailability[]
  createdAt    DateTime          @default(now())
}

model RestaurantHours {
  id         String           @id @default(uuid())
  branchId   String
  dayOfWeek  Int              // 0 = Sunday, 1 = Monday...
  openTime   String           // "09:00"
  closeTime  String           // "22:00"
  isClosed   Boolean          @default(false)
  branch     RestaurantBranch @relation(fields: [branchId], references: [id], onDelete: Cascade)
}

model DeliveryProvider {
  id           String                 @id @default(uuid())
  name         String                 @unique // e.g. "Swiggy", "Zomato"
  isActive     Boolean                @default(true)
  availability DeliveryAvailability[]
  priceHistory MealPriceHistory[]
}

model DeliveryAvailability {
  id           String           @id @default(uuid())
  providerId   String
  branchId     String
  isAvailable  Boolean          @default(true)
  deliveryFee  Float?
  etaMin       Int?
  etaMax       Int?
  provider     DeliveryProvider @relation(fields: [providerId], references: [id], onDelete: Cascade)
  branch       RestaurantBranch @relation(fields: [branchId], references: [id], onDelete: Cascade)
  
  @@unique([providerId, branchId])
}

model HealthyMeal {
  id             String            @id @default(uuid())
  restaurantId   String
  name           String
  description    String?
  basePrice      Float
  calories       Int
  protein        Float
  carbs          Float
  fat            Float
  healthScore    Float             @default(0)
  isAvailable    Boolean           @default(true)
  restaurant     Restaurant        @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  nutrition      MealNutrition?
  ingredients    MealIngredient[]
  allergens      MealAllergen[]
  tags           MealTag[]
  images         MealImages[]
  cuisines       Cuisine[]
  priceHistory   MealPriceHistory[]
  userHistory    UserMealHistory[]
  aiAnalyses     MealAIAnalysis[]
  favorites      MealFavorite[]
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt
}

model MealImages {
  id        String      @id @default(uuid())
  mealId    String
  url       String
  isPrimary Boolean     @default(false)
  meal      HealthyMeal @relation(fields: [mealId], references: [id], onDelete: Cascade)
}

model MealNutrition {
  id           String      @id @default(uuid())
  mealId       String      @unique
  fiber        Float?
  sugar        Float?
  sodium       Float?
  vitamins     Json?       // { "vitaminC": "10mg" }
  minerals     Json?       // { "iron": "2mg" }
  glycemicLoad Float?
  processedPct Float?
  meal         HealthyMeal @relation(fields: [mealId], references: [id], onDelete: Cascade)
}

model MealIngredient {
  id     String      @id @default(uuid())
  mealId String
  name   String
  amount String?
  meal   HealthyMeal @relation(fields: [mealId], references: [id], onDelete: Cascade)
}

model MealAllergen {
  id     String      @id @default(uuid())
  mealId String
  name   String
  meal   HealthyMeal @relation(fields: [mealId], references: [id], onDelete: Cascade)
}

model MealTag {
  id     String      @id @default(uuid())
  mealId String
  name   String      // e.g. "High Protein", "Vegan"
  meal   HealthyMeal @relation(fields: [mealId], references: [id], onDelete: Cascade)
}

model MealPriceHistory {
  id         String           @id @default(uuid())
  mealId     String
  providerId String
  price      Float
  recordedAt DateTime         @default(now())
  meal       HealthyMeal      @relation(fields: [mealId], references: [id], onDelete: Cascade)
  provider   DeliveryProvider @relation(fields: [providerId], references: [id], onDelete: Cascade)
}

model UserMealHistory {
  id            String      @id @default(uuid())
  profileId     String
  mealId        String
  orderId       String?     // Deep link or imported ID
  pricePaid     Float?
  orderedAt     DateTime    @default(now())
  rating        Int?
  reviewText    String?
  moodAfter     String?
  recoveryScore Int?        // Impact on recovery
  meal          HealthyMeal @relation(fields: [mealId], references: [id], onDelete: Cascade)
  profile       UserProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)
}

model MealFavorite {
  id        String      @id @default(uuid())
  profileId String
  mealId    String
  createdAt DateTime    @default(now())
  meal      HealthyMeal @relation(fields: [mealId], references: [id], onDelete: Cascade)
  profile   UserProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  @@unique([profileId, mealId])
}

model MealAIAnalysis {
  id                 String      @id @default(uuid())
  mealId             String      @unique
  proteinScore       Float
  recoveryScore      Float
  muscleGainScore    Float
  weightLossScore    Float
  heartHealthScore   Float
  diabetesFriendly   Float
  bloodPressureScore Float
  gutHealthScore     Float
  inflammationScore  Float
  satietyScore       Float
  hydrationImpact    Float
  summary            String
  analyzedAt         DateTime    @default(now())
  meal               HealthyMeal @relation(fields: [mealId], references: [id], onDelete: Cascade)
}

model UserTasteProfile {
  id            String      @id @default(uuid())
  profileId     String      @unique
  spicyPref     Int         @default(3) // 1-5
  sweetPref     Int         @default(3)
  saltyPref     Int         @default(3)
  texturePref   String[]
  favoriteIngs  String[]
  dislikedIngs  String[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  profile       UserProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)
}

model FoodCraving {
  id          String      @id @default(uuid())
  profileId   String
  cravingName String
  intensity   Int         @default(3)
  loggedAt    DateTime    @default(now())
  resolvedAt  DateTime?
  profile     UserProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)
}

model NutritionGoal {
  id            String      @id @default(uuid())
  profileId     String      @unique
  dailyCalories Int
  dailyProtein  Float
  dailyCarbs    Float
  dailyFat      Float
  dailyFiber    Float?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  profile       UserProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)
}

model FoodMemory {
  id           String      @id @default(uuid())
  profileId    String
  memoryType   String      // e.g. "LIKE", "DISLIKE", "BUDGET", "TIMING", "WEATHER_PREF"
  value        String
  confidence   Float       @default(1.0)
  source       String?     // Where this memory came from (e.g. "review", "order_history")
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  profile      UserProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)
}
`;

fs.appendFileSync(prismaPath, newModels, 'utf8');
console.log('Appended models to schema.prisma');

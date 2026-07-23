// GAMA Workout Studio - Database-driven Workout Catalog

export interface ExerciseDefinition {
  id: string;
  name: string;
  category: 'STRENGTH' | 'CARDIO' | 'MOBILITY' | 'REHAB';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  equipment: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  coachingNotes: string[];
  safetyWarnings: string[];
  imageUrl: string;
  caloriesFormula: (weightKg: number, durationMin: number) => number;
  progression: string;
  regression: string;
  mobilityRequirement: 'Low' | 'Medium' | 'High';
}

export const WORKOUT_CATALOG: ExerciseDefinition[] = [
  {
    id: "ex-goblet-squat",
    name: "Dumbbell Goblet Squat",
    category: "STRENGTH",
    difficulty: "BEGINNER",
    equipment: ["Dumbbell", "Kettlebell"],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    instructions: [
      "Hold a dumbbell vertically by one end against your chest.",
      "Position your feet shoulder-width apart, toes pointed slightly out.",
      "Brace your core and sit your hips back and down as if sitting in a chair.",
      "Descend until your thighs are parallel to the floor or lower, keeping your spine neutral.",
      "Drive back up through the midfoot to the starting position."
    ],
    coachingNotes: [
      "Keep the elbows pointing down to brace the upper back.",
      "Keep your weight distributed in your midfoot.",
      "Keep your chest proud throughout the entire movement."
    ],
    safetyWarnings: [
      "Do not allow your knees to collapse inward.",
      "Avoid rounding your lower back at the bottom of the squat."
    ],
    imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 6.0 * 3.5 * w * d / 200,
    progression: "Double Dumbbell Front Squat",
    regression: "Bodyweight Squat",
    mobilityRequirement: "Medium"
  },
  {
    id: "ex-barbell-squat",
    name: "Barbell Back Squat",
    category: "STRENGTH",
    difficulty: "INTERMEDIATE",
    equipment: ["Barbell", "Squat Rack"],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core", "Lower Back"],
    instructions: [
      "Rest the barbell on your upper back muscles (traps), holding the bar firmly.",
      "Step out of the rack and stand with feet slightly wider than shoulder-width.",
      "Take a deep breath, brace your core, and sit back and down.",
      "Lower your hips below parallel, keeping your knees inline with toes.",
      "Push the floor away to stand back up, exhaling at the top."
    ],
    coachingNotes: [
      "Maintain a neutral gaze and pack your neck.",
      "Pull the bar down into your traps to create stiffness.",
      "Drive your knees outwards on the ascent."
    ],
    safetyWarnings: [
      "Never let your back round under load (butt wink).",
      "Do not squat with heels rising off the floor."
    ],
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 8.0 * 3.5 * w * d / 200,
    progression: "Pause Back Squat",
    regression: "Goblet Squat",
    mobilityRequirement: "High"
  },
  {
    id: "ex-bulgarian-squat",
    name: "Bulgarian Split Squat",
    category: "STRENGTH",
    difficulty: "INTERMEDIATE",
    equipment: ["Dumbbells", "Flat Bench"],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Adductors", "Core"],
    instructions: [
      "Stand about two feet in front of a bench, holding dumbbells at your sides.",
      "Extend your left leg back and rest the top of your foot flat on the bench.",
      "Lower your body until your right thigh is horizontal, keeping your knee in line with your foot.",
      "Drive back up to the starting position using the front heel."
    ],
    coachingNotes: [
      "Lean forward slightly at the hips to load the glutes more.",
      "Focus on keeping your hips square.",
      "Do not push off with the rear foot on the bench."
    ],
    safetyWarnings: [
      "Watch for knee instability or excessive forward slide over the toes.",
      "Maintain core bracing to protect the pelvis."
    ],
    imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 6.5 * 3.5 * w * d / 200,
    progression: "Deficit Bulgarian Split Squat",
    regression: "Bodyweight Lunges",
    mobilityRequirement: "Medium"
  },
  {
    id: "ex-dumbbell-rdl",
    name: "Dumbbell Romanian Deadlift",
    category: "STRENGTH",
    difficulty: "BEGINNER",
    equipment: ["Dumbbells"],
    primaryMuscles: ["Hamstrings", "Glutes"],
    secondaryMuscles: ["Lower Back", "Forearms"],
    instructions: [
      "Stand tall holding dumbbells in front of your thighs, feet hip-width apart.",
      "Slightly bend your knees, then hinge at your hips, pushing your butt back.",
      "Lower the dumbbells close to your shins while maintaining a flat back.",
      "Go down until you feel a deep stretch in your hamstrings.",
      "Squeeze your glutes and push your hips forward to stand up."
    ],
    coachingNotes: [
      "Shave your legs with the weights — keep them close.",
      "Lead the movement by pushing the wall behind you with your hips.",
      "Keep your neck neutral — look 3-5 feet in front of you on the floor."
    ],
    safetyWarnings: [
      "Do not round your spine or look straight up.",
      "Avoid locking out the knees completely during the hinge."
    ],
    imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 5.5 * 3.5 * w * d / 200,
    progression: "Barbell Romanian Deadlift",
    regression: "Bodyweight Hip Hinge",
    mobilityRequirement: "Medium"
  },
  {
    id: "ex-barbell-dl",
    name: "Barbell Conventional Deadlift",
    category: "STRENGTH",
    difficulty: "INTERMEDIATE",
    equipment: ["Barbell", "Weight Plates"],
    primaryMuscles: ["Hamstrings", "Glutes", "Erector Spinae"],
    secondaryMuscles: ["Upper Back", "Traps", "Forearms", "Core"],
    instructions: [
      "Stand with feet hip-width apart, shins about an inch from the bar.",
      "Hinge at the hips, bend your knees, and grip the bar just outside your shins.",
      "Flatten your back, pull your shoulders back and down, and take the slack out of the bar.",
      "Push through the floor, pulling the bar up along your shins and thighs.",
      "Lock out at the top by squeezing your glutes, keeping a neutral spine."
    ],
    coachingNotes: [
      "Pull your shoulder blades into your back pockets.",
      "Imagine pushing the floor away rather than pulling the bar up.",
      "The bar must move in a straight vertical line."
    ],
    safetyWarnings: [
      "Do not round your lower back. Drop the weight if your back rounds.",
      "Do not hyper-extend your back at the top."
    ],
    imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a25f1?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 9.0 * 3.5 * w * d / 200,
    progression: "Deficit Deadlift",
    regression: "Dumbbell Romanian Deadlift",
    mobilityRequirement: "High"
  },
  {
    id: "ex-kettlebell-swing",
    name: "Kettlebell Swing",
    category: "CARDIO",
    difficulty: "BEGINNER",
    equipment: ["Kettlebell"],
    primaryMuscles: ["Hamstrings", "Glutes", "Core"],
    secondaryMuscles: ["Shoulders", "Forearms"],
    instructions: [
      "Stand with feet slightly wider than shoulder-width, kettlebell on the floor in front of you.",
      "Hinge at the hips and grab the kettlebell with both hands.",
      "Pull the kettlebell back between your legs to create momentum.",
      "Drivingly snap your hips forward to swing the bell up to chest height.",
      "Guide the kettlebell back down between your legs and repeat immediately."
    ],
    coachingNotes: [
      "This is a hinge, not a squat. Keep knees soft but minimal forward slide.",
      "Use your hips to throw the weight, not your arms.",
      "Brace your core at the top of the swing like a standing plank."
    ],
    safetyWarnings: [
      "Ensure the lower back remains flat. Do not lean back at the top.",
      "Maintain a secure grip on the kettlebell."
    ],
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 9.5 * 3.5 * w * d / 200,
    progression: "Single-Arm Kettlebell Swing",
    regression: "Dumbbell Hip Hinge",
    mobilityRequirement: "Medium"
  },
  {
    id: "ex-dumbbell-lunge",
    name: "Dumbbell Walking Lunge",
    category: "STRENGTH",
    difficulty: "BEGINNER",
    equipment: ["Dumbbells"],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Calves", "Core"],
    instructions: [
      "Stand tall holding dumbbells at your sides.",
      "Step forward with your right leg, lowering your hips until your rear knee is near the floor.",
      "Keep your torso upright and front knee directly over your ankle.",
      "Push off with your rear foot to step forward into the next lunge."
    ],
    coachingNotes: [
      "Keep your feet on railroad tracks — do not step inline like a tightrope.",
      "Ensure the front knee stays aligned and doesn't collapse inward.",
      "Control the eccentric phase; do not bang your back knee on the floor."
    ],
    safetyWarnings: [
      "Avoid excessive forward lean of the torso.",
      "Ensure knee flexion stays under control."
    ],
    imageUrl: "https://images.unsplash.com/photo-1544033527-b192daee1f5b?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 6.0 * 3.5 * w * d / 200,
    progression: "Barbell Walking Lunges",
    regression: "Reverse Lunges (Stationary)",
    mobilityRequirement: "Medium"
  },
  {
    id: "ex-leg-press",
    name: "Machine Leg Press",
    category: "STRENGTH",
    difficulty: "BEGINNER",
    equipment: ["Leg Press Machine"],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Calves"],
    instructions: [
      "Sit in the machine and place your feet shoulder-width apart on the sled.",
      "Lower the safety locks and control the sled down towards your chest.",
      "Stop when your knees reach approximately a 90-degree angle.",
      "Push the sled away securely by extending your knees, avoiding locking them out."
    ],
    coachingNotes: [
      "Keep your lower back flat against the pad at all times.",
      "Never push against your knees with your hands.",
      "Drive through your heels."
    ],
    safetyWarnings: [
      "Never lock out your knees at the top.",
      "Do not bring the weight down so low that your tailbone curls off the seat."
    ],
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 5.0 * 3.5 * w * d / 200,
    progression: "Single-Leg Press",
    regression: "Bodyweight Squat",
    mobilityRequirement: "Low"
  },
  {
    id: "ex-calf-raise",
    name: "Standing Dumbbell Calf Raise",
    category: "STRENGTH",
    difficulty: "BEGINNER",
    equipment: ["Dumbbells", "Elevation Block"],
    primaryMuscles: ["Gastrocnemius (Calves)"],
    secondaryMuscles: ["Soleus (Calves)"],
    instructions: [
      "Stand with the balls of your feet on a step/block, heels hanging off.",
      "Hold dumbbells in your hands. Maintain balance.",
      "Lower your heels as far as possible to stretch the calves.",
      "Press through the balls of your feet to raise your heels as high as possible."
    ],
    coachingNotes: [
      "Pause for 1-2 seconds at the bottom stretch and top contraction.",
      "Control the descent; do not bounce.",
      "Keep the knees straight but not completely locked."
    ],
    safetyWarnings: [
      "Maintain strict control to avoid ankle sprains on elevation blocks."
    ],
    imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 3.5 * 3.5 * w * d / 200,
    progression: "Single-Leg Calf Raise",
    regression: "Bodyweight Standing Calf Raise",
    mobilityRequirement: "Low"
  },
  {
    id: "ex-leg-curl",
    name: "Lying Leg Curl Machine",
    category: "STRENGTH",
    difficulty: "BEGINNER",
    equipment: ["Leg Curl Machine"],
    primaryMuscles: ["Hamstrings"],
    secondaryMuscles: ["Calves"],
    instructions: [
      "Lie face down on the machine, lining up your knees with the machine pivot point.",
      "Position the leg pad just below your calf muscles.",
      "Pull the pad towards your glutes as far as possible, squeezing the hamstrings.",
      "Control the pad back to the starting position."
    ],
    coachingNotes: [
      "Keep your hips pressed firmly into the bench; do not let your lower back arch.",
      "Flex your toes toward your shins (dorsiflexion) to focus the hamstrings.",
      "Perform the return phase slowly."
    ],
    safetyWarnings: [
      "Avoid hyper-extending the knees on the extension phase."
    ],
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 4.0 * 3.5 * w * d / 200,
    progression: "Slow Negative Leg Curl",
    regression: "Resistance Band Leg Curl",
    mobilityRequirement: "Low"
  },
  {
    id: "ex-leg-ext",
    name: "Leg Extension Machine",
    category: "STRENGTH",
    difficulty: "BEGINNER",
    equipment: ["Leg Extension Machine"],
    primaryMuscles: ["Quadriceps"],
    secondaryMuscles: [],
    instructions: [
      "Sit in the machine, placing the pad against your lower shins.",
      "Hold the handles at your sides to anchor your hips.",
      "Extend your legs fully to lift the weight, squeezing the quads.",
      "Lower the pad back down under control to the start position."
    ],
    coachingNotes: [
      "Keep your toes pointed upward.",
      "Hold the contraction at the top for a split second.",
      "Keep your back supported flat against the seat."
    ],
    safetyWarnings: [
      "Do not kick the weight up violently.",
      "Avoid shearing force if you have knee inflammation."
    ],
    imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 4.0 * 3.5 * w * d / 200,
    progression: "Single-Leg Extension",
    regression: "Bodyweight Wall Sit",
    mobilityRequirement: "Low"
  },
  {
    id: "ex-barbell-hip-thrust",
    name: "Barbell Hip Thrust",
    category: "STRENGTH",
    difficulty: "INTERMEDIATE",
    equipment: ["Barbell", "Flat Bench", "Barbell Pad"],
    primaryMuscles: ["Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    instructions: [
      "Sit with your upper back resting against a bench, a padded barbell over your hips.",
      "Place your feet flat on the floor, about shoulder-width apart, knees bent.",
      "Drive through your heels to extend your hips vertically, squeezing your glutes.",
      "Lower your hips under control back towards the floor."
    ],
    coachingNotes: [
      "Keep your chin tucked forward to prevent arching the lower back.",
      "At the top, your shins should be vertical.",
      "Squeeze your glutes fully at the lockout."
    ],
    safetyWarnings: [
      "Do not arch your lower back at the top; only lift from hip extension.",
      "Ensure the bench is securely anchored."
    ],
    imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 7.0 * 3.5 * w * d / 200,
    progression: "Single-Leg Hip Thrust",
    regression: "Bodyweight Glute Bridge",
    mobilityRequirement: "Medium"
  },
  {
    id: "ex-db-bench-press",
    name: "Dumbbell Bench Press",
    category: "STRENGTH",
    difficulty: "BEGINNER",
    equipment: ["Dumbbells", "Flat Bench"],
    primaryMuscles: ["Pectoralis Major (Chest)"],
    secondaryMuscles: ["Anterior Deltoids (Shoulders)", "Triceps"],
    instructions: [
      "Lie flat on a bench holding dumbbells at your chest with a 90-degree elbow bend.",
      "Keep your feet flat on the floor and shoulder blades retracted.",
      "Press the weights upward until your arms are straight.",
      "Lower the dumbbells back down slowly to the starting position."
    ],
    coachingNotes: [
      "Keep your elbows tucked at a 45-degree angle to protect your shoulders.",
      "Lower the weights until you feel a comfortable stretch in your chest.",
      "Keep dumbbells stable; do not let them drift."
    ],
    safetyWarnings: [
      "Do not drop the dumbbells to your chest; control the descent.",
      "Keep your wrists straight."
    ],
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 6.0 * 3.5 * w * d / 200,
    progression: "Incline Dumbbell Bench Press",
    regression: "Floor Dumbbell Press",
    mobilityRequirement: "Medium"
  },
  {
    id: "ex-barbell-bench",
    name: "Barbell Bench Press",
    category: "STRENGTH",
    difficulty: "INTERMEDIATE",
    equipment: ["Barbell", "Flat Bench", "Rack"],
    primaryMuscles: ["Pectoralis Major (Chest)"],
    secondaryMuscles: ["Anterior Deltoids", "Triceps"],
    instructions: [
      "Lie flat on the bench, eyes directly under the bar.",
      "Grip the bar slightly wider than shoulder-width, retracting your shoulder blades.",
      "Unrack the bar and lower it slowly to your mid-chest.",
      "Press the bar back up vertically until your elbows lock."
    ],
    coachingNotes: [
      "Keep your feet planted firmly to create leg drive.",
      "Do not flare your elbows out to 90 degrees; aim for 45-60 degrees.",
      "Keep the bar moving in a slightly curved J-path."
    ],
    safetyWarnings: [
      "Ensure you have a spotter or safety bars at appropriate heights.",
      "Avoid bounced reps off your chest."
    ],
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 7.5 * 3.5 * w * d / 200,
    progression: "Pause Barbell Bench Press",
    regression: "Dumbbell Bench Press",
    mobilityRequirement: "Medium"
  },
  {
    id: "ex-incline-db-press",
    name: "Incline Dumbbell Press",
    category: "STRENGTH",
    difficulty: "INTERMEDIATE",
    equipment: ["Dumbbells", "Incline Bench"],
    primaryMuscles: ["Upper Pectoralis Major"],
    secondaryMuscles: ["Anterior Deltoids", "Triceps"],
    instructions: [
      "Set an adjustable bench to a 30-to-45-degree incline.",
      "Sit holding dumbbells, then lie back and press the dumbbells up above your face.",
      "Lower the dumbbells slowly to your upper chest.",
      "Press the dumbbells back up to the starting position."
    ],
    coachingNotes: [
      "Avoid set angles higher than 45 degrees to prevent excessive shoulder strain.",
      "Keep your wrists stacked directly over your elbows.",
      "Retract your scapula."
    ],
    safetyWarnings: [
      "Watch for elbow flare or shoulder discomfort.",
      "Control the descent completely."
    ],
    imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 6.0 * 3.5 * w * d / 200,
    progression: "Incline Barbell Bench Press",
    regression: "Flat Dumbbell Press",
    mobilityRequirement: "Medium"
  },
  {
    id: "ex-pushup",
    name: "Classic Pushup",
    category: "STRENGTH",
    difficulty: "BEGINNER",
    equipment: [],
    primaryMuscles: ["Pectoralis Major", "Triceps"],
    secondaryMuscles: ["Anterior Deltoids", "Core"],
    instructions: [
      "Assume a high plank position, hands slightly wider than shoulders.",
      "Keep your body in a straight line from head to heels, core braced.",
      "Lower your chest to the floor by bending your elbows.",
      "Push through your hands to extend your arms, returning to the plank."
    ],
    coachingNotes: [
      "Squeeze your glutes and brace your core to prevent sagging hips.",
      "Keep your neck neutral — do not crane your neck down.",
      "Push the floor away."
    ],
    safetyWarnings: [
      "Keep your elbows tucked back (arrow shape, not T shape).",
      "If you cannot maintain a flat back, perform the regression."
    ],
    imageUrl: "https://images.unsplash.com/photo-1544033527-b192daee1f5b?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 4.5 * 3.5 * w * d / 200,
    progression: "Decline Pushup",
    regression: "Incline Pushup (Hands on Bench)",
    mobilityRequirement: "Low"
  },
  {
    id: "ex-chest-dips",
    name: "Parallel Bar Chest Dips",
    category: "STRENGTH",
    difficulty: "ADVANCED",
    equipment: ["Dip Bars"],
    primaryMuscles: ["Lower Pectoralis Major", "Triceps"],
    secondaryMuscles: ["Anterior Deltoids", "Core"],
    instructions: [
      "Grip the dip bars and elevate your body, locking your arms.",
      "Lean your torso forward slightly and bend your knees.",
      "Lower your body by bending your elbows until your shoulders are slightly below your elbows.",
      "Push back up to the starting position."
    ],
    coachingNotes: [
      "Maintain a forward tilt to target the chest over the triceps.",
      "Control the descent; do not drop down.",
      "Keep your shoulders depressed; do not shrug."
    ],
    safetyWarnings: [
      "Do not go too deep if you feel shoulder strain.",
      "If you cannot control your weight, use assisted machines."
    ],
    imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 7.0 * 3.5 * w * d / 200,
    progression: "Weighted Parallel Bar Dips",
    regression: "Bench Dips",
    mobilityRequirement: "High"
  },
  {
    id: "ex-cable-crossover",
    name: "Cable Crossover",
    category: "STRENGTH",
    difficulty: "INTERMEDIATE",
    equipment: ["Cable Machine"],
    primaryMuscles: ["Pectoralis Major"],
    secondaryMuscles: ["Anterior Deltoids"],
    instructions: [
      "Set the pulleys to the high position, select the weight, and hold handles.",
      "Step forward between pulleys, leaning your torso forward slightly.",
      "Extend your arms out with a slight bend in the elbows.",
      "Sweep your arms down and inward in an arc, crossing hands in front."
    ],
    coachingNotes: [
      "Squeeze your chest at the peak contraction.",
      "Focus on the stretch at the eccentric phase.",
      "Do not use body momentum to swing the cables."
    ],
    safetyWarnings: [
      "Avoid over-stretching the shoulders at the start."
    ],
    imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a25f1?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 5.0 * 3.5 * w * d / 200,
    progression: "Incline Cable Fly",
    regression: "Resistance Band Chest Fly",
    mobilityRequirement: "Medium"
  },
  {
    id: "ex-pullup",
    name: "Classic Pull-up",
    category: "STRENGTH",
    difficulty: "ADVANCED",
    equipment: ["Pull-up Bar"],
    primaryMuscles: ["Latissimus Dorsi (Lats)", "Upper Back"],
    secondaryMuscles: ["Biceps", "Forearms", "Core"],
    instructions: [
      "Grip the bar with an overhand grip, hands slightly wider than shoulders.",
      "Hang with straight arms (dead hang) and pull your shoulder blades down.",
      "Pull your body up by driving your elbows down toward your ribs.",
      "Raise your chin above the bar, keeping your chest close to it.",
      "Lower under control to a full dead hang."
    ],
    coachingNotes: [
      "Think about pulling the bar to your chest, not pulling your chin to the bar.",
      "Keep your core tight to avoid swinging.",
      "Contract the lats at the top of the lift."
    ],
    safetyWarnings: [
      "Avoid kipping or kicking your legs to get up.",
      "Ensure a full stretch at the bottom without relaxing the shoulders completely."
    ],
    imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 8.0 * 3.5 * w * d / 200,
    progression: "Weighted Pull-up",
    regression: "Assisted Pull-up (Band or Machine)",
    mobilityRequirement: "Medium"
  },
  {
    id: "ex-lat-pulldown",
    name: "Lat Pulldown Machine",
    category: "STRENGTH",
    difficulty: "BEGINNER",
    equipment: ["Lat Pulldown Machine"],
    primaryMuscles: ["Latissimus Dorsi (Lats)"],
    secondaryMuscles: ["Biceps", "Middle/Lower Traps", "Forearms"],
    instructions: [
      "Sit in the pulldown machine and adjust the thigh pad.",
      "Grip the bar with a wide overhand grip.",
      "Pull the bar down toward your upper chest, pulling your elbows down.",
      "Slowly return the bar to the start position, feeling the stretch."
    ],
    coachingNotes: [
      "Keep your chest high and lean back slightly (10-15 degrees).",
      "Do not pull the bar behind your neck.",
      "Focus on driving your elbows down."
    ],
    safetyWarnings: [
      "Do not pull the weight down using momentum from your torso.",
      "Avoid letting the weight stack slam."
    ],
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 5.0 * 3.5 * w * d / 200,
    progression: "Close Grip Pulldown",
    regression: "Resistance Band Lat Pulldown",
    mobilityRequirement: "Medium"
  },
  {
    id: "ex-barbell-row",
    name: "Barbell Bent-Over Row",
    category: "STRENGTH",
    difficulty: "INTERMEDIATE",
    equipment: ["Barbell", "Weight Plates"],
    primaryMuscles: ["Latissimus Dorsi", "Rhomboids", "Middle Traps"],
    secondaryMuscles: ["Erector Spinae", "Biceps", "Forearms"],
    instructions: [
      "Stand holding a barbell with an overhand grip, feet shoulder-width.",
      "Hinge at your hips, keeping your back flat, until your torso is nearly parallel to the floor.",
      "Pull the bar to your lower ribs, squeezing your shoulder blades.",
      "Lower the bar slowly to extend your arms."
    ],
    coachingNotes: [
      "Do not let your back round; lock in your spine.",
      "Row the bar to your belly button.",
      "Keep your neck neutral."
    ],
    safetyWarnings: [
      "Reduce the weight if your torso rises during reps.",
      "Avoid using leg drive to lift the bar."
    ],
    imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a25f1?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 7.0 * 3.5 * w * d / 200,
    progression: "Pendlay Row",
    regression: "Dumbbell Single-Arm Row",
    mobilityRequirement: "High"
  },
  {
    id: "ex-dumbbell-row",
    name: "Single-Arm Dumbbell Row",
    category: "STRENGTH",
    difficulty: "BEGINNER",
    equipment: ["Dumbbell", "Flat Bench"],
    primaryMuscles: ["Latissimus Dorsi", "Rhomboids"],
    secondaryMuscles: ["Biceps", "Rear Deltoids", "Core"],
    instructions: [
      "Place your right knee and right hand flat on a bench for support.",
      "Hold a dumbbell in your left hand with your arm extended.",
      "Row the dumbbell up to your hip, squeezing your upper back.",
      "Lower the weight slowly to full extension."
    ],
    coachingNotes: [
      "Row toward your pocket, not your armpit.",
      "Keep your chest parallel to the bench; do not twist your spine.",
      "Achieve full extension at the bottom."
    ],
    safetyWarnings: [
      "Avoid dropping the shoulder excessively at the bottom."
    ],
    imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 5.5 * 3.5 * w * d / 200,
    progression: "Incline Bench Dumbbell Row",
    regression: "Supported Cable Row",
    mobilityRequirement: "Medium"
  },
  {
    id: "ex-seated-row",
    name: "Seated Cable Row",
    category: "STRENGTH",
    difficulty: "BEGINNER",
    equipment: ["Cable Row Machine"],
    primaryMuscles: ["Rhomboids", "Middle Traps", "Lats"],
    secondaryMuscles: ["Biceps", "Forearms"],
    instructions: [
      "Sit at the machine, place feet on platform, and grip the handle.",
      "Slide your hips back, keeping your knees slightly bent.",
      "Pull the handle to your lower chest, squeezing your shoulder blades.",
      "Extend your arms slowly, leaning forward slightly at the hips."
    ],
    coachingNotes: [
      "Keep your shoulders rolled back and down.",
      "Do not lean back excessively on the pull.",
      "Keep your chest proud."
    ],
    safetyWarnings: [
      "Avoid rapid movement or locking out the knees."
    ],
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 4.5 * 3.5 * w * d / 200,
    progression: "Single-Arm Seated Cable Row",
    regression: "Resistance Band Seated Row",
    mobilityRequirement: "Low"
  },
  {
    id: "ex-face-pull",
    name: "Cable Rope Face Pull",
    category: "REHAB",
    difficulty: "BEGINNER",
    equipment: ["Cable Machine", "Rope Attachment"],
    primaryMuscles: ["Rear Deltoids", "Rotator Cuff", "Traps"],
    secondaryMuscles: ["Upper Back"],
    instructions: [
      "Set the pulley to upper-chest height and hold the rope handles.",
      "Step back to create tension on the cable.",
      "Pull the rope toward your face, splitting the handles near your ears.",
      "Hold the contraction and slowly return the handles forward."
    ],
    coachingNotes: [
      "Lead with your hands and thumbs pointing back (external rotation).",
      "Squeeze your shoulder blades together at the back.",
      "Keep your chest high and stance stable."
    ],
    safetyWarnings: [
      "Do not pull the rope to your neck or nose.",
      "Use light weights to focus on control and form."
    ],
    imageUrl: "https://images.unsplash.com/photo-1544033527-b192daee1f5b?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 3.5 * 3.5 * w * d / 200,
    progression: "Seated Cable Face Pull",
    regression: "Band Pull-Apart",
    mobilityRequirement: "Medium"
  },
  {
    id: "ex-db-ohp",
    name: "Dumbbell Overhead Press",
    category: "STRENGTH",
    difficulty: "BEGINNER",
    equipment: ["Dumbbells", "Utility Bench"],
    primaryMuscles: ["Anterior Deltoids (Shoulders)"],
    secondaryMuscles: ["Lateral Deltoids", "Triceps", "Core"],
    instructions: [
      "Sit or stand holding dumbbells at shoulder level with palms facing forward.",
      "Brace your core, squeeze your glutes, and press the weights straight up.",
      "Lock out your elbows at the top.",
      "Lower the dumbbells slowly to shoulder height."
    ],
    coachingNotes: [
      "Keep your wrists straight and stacked over your elbows.",
      "Do not arch your lower back to press the weights.",
      "Press the weights in a straight vertical path."
    ],
    safetyWarnings: [
      "Avoid shrugging excessively at the top of the lift.",
      "Drop the dumbbells if you feel sudden shoulder pain."
    ],
    imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 6.0 * 3.5 * w * d / 200,
    progression: "Standing Barbell Military Press",
    regression: "Seated Dumbbell Shoulder Press",
    mobilityRequirement: "High"
  },
  {
    id: "ex-barbell-military",
    name: "Barbell Military Press",
    category: "STRENGTH",
    difficulty: "INTERMEDIATE",
    equipment: ["Barbell", "Weight Plates"],
    primaryMuscles: ["Anterior Deltoids", "Lateral Deltoids"],
    secondaryMuscles: ["Triceps", "Upper Chest", "Core"],
    instructions: [
      "Stand holding a barbell at your collarbone with an overhand grip.",
      "Brace your core and legs, then press the bar overhead.",
      "Pull your head slightly forward once the bar clears your forehead.",
      "Lock out at the top, then lower the bar slowly to your chest."
    ],
    coachingNotes: [
      "Squeeze your glutes tightly to stabilize your lower back.",
      "Keep your forearms vertical throughout the lift.",
      "Keep your elbows pointing slightly forward, not flared."
    ],
    safetyWarnings: [
      "Avoid leaning backward to press the bar.",
      "Do not lock out the knees completely."
    ],
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 7.5 * 3.5 * w * d / 200,
    progression: "Push Press",
    regression: "Dumbbell Shoulder Press",
    mobilityRequirement: "High"
  },
  {
    id: "ex-db-lateral-raise",
    name: "Dumbbell Lateral Raise",
    category: "STRENGTH",
    difficulty: "BEGINNER",
    equipment: ["Dumbbells"],
    primaryMuscles: ["Lateral Deltoids (Side Shoulders)"],
    secondaryMuscles: ["Anterior Deltoids", "Upper Traps"],
    instructions: [
      "Stand holding dumbbells at your sides, chest high, feet hip-width apart.",
      "With a slight bend in your elbows, raise the weights out to your sides.",
      "Stop when your arms are parallel to the floor.",
      "Lower the dumbbells under control."
    ],
    coachingNotes: [
      "Lead with your elbows, not your hands.",
      "Do not swing the weights.",
      "Keep your torso still."
    ],
    safetyWarnings: [
      "Avoid lifting weights above shoulder height to prevent impingement."
    ],
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 3.5 * 3.5 * w * d / 200,
    progression: "Cable Lateral Raise",
    regression: "Resistance Band Lateral Raise",
    mobilityRequirement: "Medium"
  },
  {
    id: "ex-cable-lateral-raise",
    name: "Cable Lateral Raise",
    category: "STRENGTH",
    difficulty: "INTERMEDIATE",
    equipment: ["Cable Machine"],
    primaryMuscles: ["Lateral Deltoids"],
    secondaryMuscles: ["Rear Deltoids", "Traps"],
    instructions: [
      "Stand next to a low pulley and grab the handle with the opposite hand.",
      "Raise your arm out to the side until it is parallel to the floor.",
      "Lower the cable under control to the start position."
    ],
    coachingNotes: [
      "Maintain a constant slight bend in the elbow.",
      "Control the eccentric phase; do not let the weight drop.",
      "Step slightly out from the cable machine to load the start."
    ],
    safetyWarnings: [
      "Avoid high speed or snapping at the bottom of the pull."
    ],
    imageUrl: "https://images.unsplash.com/photo-1544033527-b192daee1f5b?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 4.0 * 3.5 * w * d / 200,
    progression: "Behind-the-Back Cable Lateral Raise",
    regression: "Dumbbell Lateral Raise",
    mobilityRequirement: "Medium"
  },
  {
    id: "ex-db-rear-delt-fly",
    name: "Dumbbell Rear Delt Fly",
    category: "STRENGTH",
    difficulty: "BEGINNER",
    equipment: ["Dumbbells", "Incline Bench"],
    primaryMuscles: ["Rear Deltoids (Back Shoulders)"],
    secondaryMuscles: ["Rhomboids", "Middle Traps"],
    instructions: [
      "Lie face down on a bench set to a 30-degree incline.",
      "Hold dumbbells in your hands with arms hanging straight down.",
      "Raise the dumbbells out to the sides, keeping your elbows bent slightly.",
      "Squeeze your upper back, then lower the weights."
    ],
    coachingNotes: [
      "Raise the weights leading with your elbows.",
      "Do not shrug your neck.",
      "Pause for a second at the peak contraction."
    ],
    safetyWarnings: [
      "Avoid using momentum to raise the dumbbells."
    ],
    imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 3.5 * 3.5 * w * d / 200,
    progression: "Seated Cable Rear Delt Fly",
    regression: "Band Pull-Apart",
    mobilityRequirement: "Medium"
  },
  {
    id: "ex-db-shrug",
    name: "Dumbbell Shrug",
    category: "STRENGTH",
    difficulty: "BEGINNER",
    equipment: ["Dumbbells"],
    primaryMuscles: ["Trapezius (Traps)"],
    secondaryMuscles: ["Forearms"],
    instructions: [
      "Stand tall holding heavy dumbbells at your sides.",
      "Shrug your shoulders straight up toward your ears.",
      "Squeeze your traps at the top, then lower the weights."
    ],
    coachingNotes: [
      "Do not roll your shoulders forward or backward.",
      "Focus on a clean vertical motion.",
      "Hold the contraction at the top."
    ],
    safetyWarnings: [
      "Do not crane your head forward during the lift."
    ],
    imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 4.0 * 3.5 * w * d / 200,
    progression: "Barbell Shrug",
    regression: "Bodyweight Shrug",
    mobilityRequirement: "Low"
  },
  {
    id: "ex-db-bicep-curl",
    name: "Dumbbell Bicep Curl",
    category: "STRENGTH",
    difficulty: "BEGINNER",
    equipment: ["Dumbbells"],
    primaryMuscles: ["Biceps Brachii"],
    secondaryMuscles: ["Brachialis", "Forearms"],
    instructions: [
      "Stand tall holding dumbbells at your sides, palms facing forward.",
      "Squeeze your biceps to curl the weights toward your shoulders.",
      "Keep your elbows locked at your sides.",
      "Lower the dumbbells slowly to the starting position."
    ],
    coachingNotes: [
      "Do not swing your body or elbows to raise the weights.",
      "Achieve full extension at the bottom.",
      "Rotate your palms fully upward (supination) at the top."
    ],
    safetyWarnings: [
      "Avoid hyperextending your back to swing the weights."
    ],
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 3.5 * 3.5 * w * d / 200,
    progression: "Incline Dumbbell Curl",
    regression: "Seated Bicep Curl",
    mobilityRequirement: "Low"
  },
  {
    id: "ex-barbell-preacher",
    name: "Barbell Preacher Curl",
    category: "STRENGTH",
    difficulty: "INTERMEDIATE",
    equipment: ["EZ Bar", "Preacher Bench"],
    primaryMuscles: ["Biceps Brachii (Short Head)"],
    secondaryMuscles: ["Brachialis", "Forearms"],
    instructions: [
      "Sit at the preacher bench, placing the back of your arms flat on the pad.",
      "Hold the EZ bar with an underhand grip.",
      "Curl the bar toward your chin while keeping your arms flat on the pad.",
      "Lower the bar slowly to full extension."
    ],
    coachingNotes: [
      "Do not lift your elbows or arms off the pad.",
      "Ensure you control the lower phase; do not bounce at the bottom.",
      "Focus on the contraction."
    ],
    safetyWarnings: [
      "Avoid hyperextending your elbows at the bottom under load."
    ],
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 4.0 * 3.5 * w * d / 200,
    progression: "Dumbbell Preacher Curl",
    regression: "Bicep Machine Curl",
    mobilityRequirement: "Low"
  },
  {
    id: "ex-hammer-curl",
    name: "Dumbbell Hammer Curl",
    category: "STRENGTH",
    difficulty: "BEGINNER",
    equipment: ["Dumbbells"],
    primaryMuscles: ["Brachioradialis (Forearms)", "Brachialis"],
    secondaryMuscles: ["Biceps"],
    instructions: [
      "Stand holding dumbbells with palms facing each other (neutral grip).",
      "Curl the weights toward your shoulders, keeping your elbows locked.",
      "Lower the dumbbells slowly to the starting position."
    ],
    coachingNotes: [
      "Keep your wrists straight and firm.",
      "Keep your shoulders depressed.",
      "Ensure you get a full stretch."
    ],
    safetyWarnings: [
      "Do not swing the weights."
    ],
    imageUrl: "https://images.unsplash.com/photo-1544033527-b192daee1f5b?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 3.5 * 3.5 * w * d / 200,
    progression: "Cable Hammer Curl",
    regression: "Resistance Band Hammer Curl",
    mobilityRequirement: "Low"
  },
  {
    id: "ex-triceps-pushdown",
    name: "Cable Triceps Pushdown",
    category: "STRENGTH",
    difficulty: "BEGINNER",
    equipment: ["Cable Machine", "Rope Attachment"],
    primaryMuscles: ["Triceps Brachii (All Heads)"],
    secondaryMuscles: ["Forearms"],
    instructions: [
      "Grip the rope handles at the pulley machine, standing close.",
      "Bend your elbows to a 90-degree angle, locking them at your sides.",
      "Push the rope down, extending your arms fully.",
      "Separate the rope ends at the bottom of the movement."
    ],
    coachingNotes: [
      "Keep your elbows still; do not let them drift forward.",
      "Lean forward slightly at the hips.",
      "Control the eccentric phase."
    ],
    safetyWarnings: [
      "Ensure you do not let your shoulders shrug up."
    ],
    imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a25f1?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 4.0 * 3.5 * w * d / 200,
    progression: "Single-Arm Cable Triceps Pushdown",
    regression: "Resistance Band Pushdown",
    mobilityRequirement: "Low"
  },
  {
    id: "ex-overhead-tricep",
    name: "Overhead Dumbbell Triceps Extension",
    category: "STRENGTH",
    difficulty: "BEGINNER",
    equipment: ["Dumbbell", "Bench"],
    primaryMuscles: ["Triceps Brachii (Long Head)"],
    secondaryMuscles: ["Core"],
    instructions: [
      "Sit on a bench and hold a dumbbell with both hands overhead.",
      "Lower the dumbbell behind your head by bending your elbows.",
      "Extend your arms to lift the dumbbell back overhead."
    ],
    coachingNotes: [
      "Keep your elbows pointing forward, not flared to the sides.",
      "Keep your core braced to prevent arching the lower back.",
      "Reach deep behind the neck."
    ],
    safetyWarnings: [
      "Maintain a secure grip on the dumbbell."
    ],
    imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 4.5 * 3.5 * w * d / 200,
    progression: "Standing Overhead EZ Bar Extension",
    regression: "Cable Overhead Extension",
    mobilityRequirement: "High"
  },
  {
    id: "ex-skull-crusher",
    name: "Barbell Skull Crusher",
    category: "STRENGTH",
    difficulty: "INTERMEDIATE",
    equipment: ["EZ Bar", "Flat Bench"],
    primaryMuscles: ["Triceps Brachii (Long and Lateral Heads)"],
    secondaryMuscles: ["Forearms"],
    instructions: [
      "Lie flat on a bench holding an EZ bar over your chest.",
      "Lower the bar slowly toward your forehead by bending your elbows.",
      "Keep your upper arms stationary.",
      "Extend your arms back to the starting position."
    ],
    coachingNotes: [
      "Angle your upper arms slightly back (15 degrees) to keep constant tension.",
      "Do not flare your elbows.",
      "Control the descent."
    ],
    safetyWarnings: [
      "Avoid dropping the bar toward your face."
    ],
    imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 5.0 * 3.5 * w * d / 200,
    progression: "Decline Skull Crusher",
    regression: "Dumbbell Floor Press",
    mobilityRequirement: "Medium"
  },
  {
    id: "ex-plank",
    name: "Classic Forearm Plank",
    category: "STRENGTH",
    difficulty: "BEGINNER",
    equipment: [],
    primaryMuscles: ["Rectus Abdominis (Abs)", "Transverse Abdominis"],
    secondaryMuscles: ["Shoulders", "Glutes", "Quads"],
    instructions: [
      "Place your forearms on the floor, elbows aligned under shoulders.",
      "Extend your legs back, resting on your toes.",
      "Keep your body in a straight line from head to heels.",
      "Hold this position, breathing steadily."
    ],
    coachingNotes: [
      "Squeeze your glutes and pull your belly button toward your spine.",
      "Do not let your hips sag or rise.",
      "Push up through your shoulders to prevent winging."
    ],
    safetyWarnings: [
      "If you feel lower back pain, drop knees to the floor."
    ],
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 4.0 * 3.5 * w * d / 200,
    progression: "Plank with Shoulder Taps",
    regression: "Knee Plank",
    mobilityRequirement: "Low"
  },
  {
    id: "ex-leg-raise",
    name: "Hanging Leg Raise",
    category: "STRENGTH",
    difficulty: "ADVANCED",
    equipment: ["Pull-up Bar"],
    primaryMuscles: ["Rectus Abdominis", "Hip Flexors"],
    secondaryMuscles: ["Obliques", "Forearms"],
    instructions: [
      "Hang from a bar with a wide overhand grip.",
      "Raise your legs horizontally, keeping them straight.",
      "Lower your legs slowly back to the starting position."
    ],
    coachingNotes: [
      "Do not swing or use momentum; control the movement.",
      "Exhale as you raise your legs.",
      "Keep your legs straight."
    ],
    safetyWarnings: [
      "Ensure your grip is secure."
    ],
    imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 6.5 * 3.5 * w * d / 200,
    progression: "Hanging Toes to Bar",
    regression: "Hanging Knee Raises",
    mobilityRequirement: "High"
  },
  {
    id: "ex-russian-twist",
    name: "Russian Twist",
    category: "STRENGTH",
    difficulty: "BEGINNER",
    equipment: ["Medicine Ball", "Dumbbell"],
    primaryMuscles: ["Obliques"],
    secondaryMuscles: ["Rectus Abdominis", "Hip Flexors"],
    instructions: [
      "Sit on the floor, bend your knees, and lift your feet off the floor.",
      "Lean back slightly to balance on your tailbone.",
      "Hold a weight and twist your torso to the right, touching the floor.",
      "Twist to the left, repeating the movement."
    ],
    coachingNotes: [
      "Focus on rotating your entire torso, not just moving your arms.",
      "Keep your spine neutral.",
      "Maintain balance."
    ],
    safetyWarnings: [
      "Avoid twisting if you have lumbar disc issues."
    ],
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 4.5 * 3.5 * w * d / 200,
    progression: "Declined Russian Twist",
    regression: "Bodyweight Russian Twist",
    mobilityRequirement: "Medium"
  },
  {
    id: "ex-cable-crunch",
    name: "Kneeling Cable Crunch",
    category: "STRENGTH",
    difficulty: "INTERMEDIATE",
    equipment: ["Cable Machine", "Rope Attachment"],
    primaryMuscles: ["Rectus Abdominis"],
    secondaryMuscles: ["Obliques"],
    instructions: [
      "Kneel in front of the cable pulley holding the rope at your head.",
      "Flex at the hips and crunch down, bringing your elbows to your knees.",
      "Contract your abs, then slowly return to the starting position."
    ],
    coachingNotes: [
      "Do not sit down onto your heels; keep your hips high.",
      "Focus on spinal flexion (curling the spine) to isolate the abs.",
      "Exhale on the compression."
    ],
    safetyWarnings: [
      "Avoid pulling with your arms; focus on your core."
    ],
    imageUrl: "https://images.unsplash.com/photo-1544033527-b192daee1f5b?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 5.0 * 3.5 * w * d / 200,
    progression: "Declined Weighted Crunch",
    regression: "Bodyweight Floor Crunch",
    mobilityRequirement: "Medium"
  },
  {
    id: "ex-ab-wheel",
    name: "Ab Wheel Rollout",
    category: "STRENGTH",
    difficulty: "ADVANCED",
    equipment: ["Ab Roller"],
    primaryMuscles: ["Rectus Abdominis", "Transverse Abdominis"],
    secondaryMuscles: ["Lats", "Shoulders", "Lower Back"],
    instructions: [
      "Kneel on the floor, holding the ab wheel below your shoulders.",
      "Roll the wheel forward, extending your body, keeping your core braced.",
      "Go as far as possible without letting your back sag.",
      "Pull yourself back to the starting position."
    ],
    coachingNotes: [
      "Keep a slight rounding in your upper back (posterior pelvic tilt).",
      "Do not let your lower back arch.",
      "Exhale as you roll back."
    ],
    safetyWarnings: [
      "Stop immediately if you feel lower back strain.",
      "Do not go too far if you cannot return."
    ],
    imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a25f1?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 6.5 * 3.5 * w * d / 200,
    progression: "Standing Ab Wheel Rollout",
    regression: "Physio Ball Rollout",
    mobilityRequirement: "Medium"
  },
  {
    id: "ex-turkish-getup",
    name: "Kettlebell Turkish Get-Up",
    category: "STRENGTH",
    difficulty: "ADVANCED",
    equipment: ["Kettlebell"],
    primaryMuscles: ["Core", "Shoulders (Stabilizers)", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Quadriceps"],
    instructions: [
      "Lie on the floor holding a kettlebell vertically with your right hand.",
      "Roll to the left elbow, then press up to the left hand.",
      "Bridge your hips and sweep your left leg under into a lunge posture.",
      "Stand up from the lunge, keeping the kettlebell pressed overhead.",
      "Reverse the steps slowly to return to the floor."
    ],
    coachingNotes: [
      "Keep your eyes locked on the kettlebell at all times.",
      "Ensure shoulder packing in the loaded arm.",
      "Each transition step must be distinct and solid."
    ],
    safetyWarnings: [
      "Use a light weight until the movement path is memorized.",
      "Never lose focus of the bell."
    ],
    imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 8.5 * 3.5 * w * d / 200,
    progression: "Heavy Turkish Get-Up",
    regression: "Bodyweight Turkish Get-Up",
    mobilityRequirement: "High"
  },
  {
    id: "ex-farmers-walk",
    name: "Farmer's Walk",
    category: "STRENGTH",
    difficulty: "BEGINNER",
    equipment: ["Dumbbells", "Kettlebells"],
    primaryMuscles: ["Forearms (Grip)", "Core (Obliques)", "Traps"],
    secondaryMuscles: ["Hamstrings", "Quadriceps"],
    instructions: [
      "Hold heavy dumbbells at your sides and stand tall.",
      "Brace your core, retract your shoulders, and walk forward with short steps.",
      "Maintain a tall posture throughout the walk."
    ],
    coachingNotes: [
      "Do not let your shoulders roll forward; keep them back and down.",
      "Imagine carrying groceries — stay tall.",
      "Step slowly and deliberately."
    ],
    safetyWarnings: [
      "Keep a secure grip; do not drop weights on feet."
    ],
    imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 7.0 * 3.5 * w * d / 200,
    progression: "Heavy Trap Bar Farmer's Walk",
    regression: "Suitcase Carry (Single Arm)",
    mobilityRequirement: "Low"
  },
  {
    id: "ex-dead-bug",
    name: "Dead Bug",
    category: "REHAB",
    difficulty: "BEGINNER",
    equipment: [],
    primaryMuscles: ["Transverse Abdominis (Deep Core)"],
    secondaryMuscles: ["Obliques"],
    instructions: [
      "Lie on your back, arms extended vertically, knees bent at 90 degrees.",
      "Lower your right arm and left leg toward the floor slowly.",
      "Keep your lower back flat against the floor.",
      "Return to the start position, then alternate."
    ],
    coachingNotes: [
      "The most important rule: do not let your back arch off the floor.",
      "Move slowly; control is the goal.",
      "Exhale as you extend your limbs."
    ],
    safetyWarnings: [
      "Ensure core engagement is maintained."
    ],
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 3.0 * 3.5 * w * d / 200,
    progression: "Weighted Dead Bug",
    regression: "Dead Bug (Legs Only)",
    mobilityRequirement: "Low"
  },
  {
    id: "ex-bird-dog",
    name: "Bird Dog",
    category: "REHAB",
    difficulty: "BEGINNER",
    equipment: [],
    primaryMuscles: ["Glutes", "Erector Spinae", "Core"],
    secondaryMuscles: ["Shoulders"],
    instructions: [
      "Assume a tabletop position on hands and knees.",
      "Extend your right arm forward and left leg backward slowly.",
      "Keep your hips square to the floor.",
      "Return to start and alternate."
    ],
    coachingNotes: [
      "Keep your head and neck neutral; look at the floor.",
      "Focus on reaching out rather than lifting high.",
      "Keep your pelvis level."
    ],
    safetyWarnings: [
      "Do not arch the lower back at the top extension."
    ],
    imageUrl: "https://images.unsplash.com/photo-1544033527-b192daee1f5b?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 3.0 * 3.5 * w * d / 200,
    progression: "Bird Dog on Bosu Ball",
    regression: "Single Arm/Leg Extensions",
    mobilityRequirement: "Low"
  },
  {
    id: "ex-clean-press",
    name: "Barbell Clean and Press",
    category: "STRENGTH",
    difficulty: "ADVANCED",
    equipment: ["Barbell", "Weight Plates"],
    primaryMuscles: ["Hamstrings", "Glutes", "Deltoids", "Core"],
    secondaryMuscles: ["Traps", "Triceps", "Forearms"],
    instructions: [
      "Pull the barbell from the floor, extending hips rapidly (clean).",
      "Catch the barbell on your shoulders in a front rack position.",
      "Stand up, brace your core, and press the bar overhead.",
      "Lower the bar to your chest, then return to the floor."
    ],
    coachingNotes: [
      "Keep the bar path close to your body.",
      "Catch the bar on a strong front rack.",
      "Lock out overhead."
    ],
    safetyWarnings: [
      "Requires advanced clean technique. Do not drop on collarbone.",
      "Keep back straight."
    ],
    imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a25f1?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 10.0 * 3.5 * w * d / 200,
    progression: "Barbell Clean and Jerk",
    regression: "Dumbbell Clean and Press",
    mobilityRequirement: "High"
  },
  {
    id: "ex-burpee",
    name: "Classic Burpee",
    category: "CARDIO",
    difficulty: "INTERMEDIATE",
    equipment: [],
    primaryMuscles: ["Quadriceps", "Chest", "Cardio System"],
    secondaryMuscles: ["Core", "Glutes", "Shoulders"],
    instructions: [
      "Stand tall, then drop into a squat and place hands on the floor.",
      "Jump your feet back into a pushup position.",
      "Perform a pushup, then jump your feet forward into a squat.",
      "Jump up explosively from the squat, reaching arms overhead."
    ],
    coachingNotes: [
      "Land with soft knees on the jump.",
      "Keep your core engaged in the plank.",
      "Maintain high speed but clean form."
    ],
    safetyWarnings: [
      "Ensure you land flat-footed on the return jump."
    ],
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 11.0 * 3.5 * w * d / 200,
    progression: "Burpee with Pull-up",
    regression: "Step-back Burpee (No Jump)",
    mobilityRequirement: "Medium"
  },
  {
    id: "ex-kb-snatch",
    name: "Kettlebell Snatch",
    category: "CARDIO",
    difficulty: "ADVANCED",
    equipment: ["Kettlebell"],
    primaryMuscles: ["Hamstrings", "Glutes", "Shoulders"],
    secondaryMuscles: ["Core", "Forearms"],
    instructions: [
      "Swing the kettlebell back between your legs.",
      "Drive hips forward, pulling the kettlebell up vertically.",
      "Punch your hand up through the handle, catching the bell overhead.",
      "Drop the kettlebell back down into the swing path and repeat."
    ],
    coachingNotes: [
      "Keep the kettlebell close to your face; do not swing it out wide.",
      "Tuck your elbow at the bottom swing.",
      "Lock out."
    ],
    safetyWarnings: [
      "Ensure correct wrist alignment at the top lockout.",
      "Watch for forearm bruising."
    ],
    imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 10.5 * 3.5 * w * d / 200,
    progression: "Double Kettlebell Snatch",
    regression: "Kettlebell High Pull",
    mobilityRequirement: "High"
  },
  {
    id: "ex-battle-ropes",
    name: "Battle Ropes Waves",
    category: "CARDIO",
    difficulty: "BEGINNER",
    equipment: ["Battle Ropes"],
    primaryMuscles: ["Shoulders", "Core", "Cardio System"],
    secondaryMuscles: ["Forearms", "Glutes"],
    instructions: [
      "Stand in a half-squat stance, holding the battle rope ends.",
      "Alternate waving your arms up and down rapidly.",
      "Maintain a solid core, keeping the waves moving down the ropes."
    ],
    coachingNotes: [
      "Do not stand up straight; maintain the athletic half-squat.",
      "Focus on speed.",
      "Keep breathing."
    ],
    safetyWarnings: [
      "Keep knees aligned; do not allow knees to cave in."
    ],
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 8.0 * 3.5 * w * d / 200,
    progression: "Double Arm Battle Ropes Slam",
    regression: "Light Battle Rope Waves",
    mobilityRequirement: "Medium"
  },
  {
    id: "ex-thread-needle",
    name: "Thread the Needle",
    category: "MOBILITY",
    difficulty: "BEGINNER",
    equipment: [],
    primaryMuscles: ["Thoracic Spine (T-Spine)", "Shoulders"],
    secondaryMuscles: ["Neck", "Core"],
    instructions: [
      "Start in a tabletop position on hands and knees.",
      "Reach your right arm straight up toward the ceiling, twisting your chest open.",
      "Slide your right arm underneath your left arm, resting your right shoulder on the floor.",
      "Hold the stretch, breathing deep into your upper back."
    ],
    coachingNotes: [
      "Focus the stretch on your middle back, not your lower back.",
      "Keep your hips square.",
      "Relax your neck."
    ],
    safetyWarnings: [
      "Do not compress your neck; back off if you feel pain."
    ],
    imageUrl: "https://images.unsplash.com/photo-1544033527-b192daee1f5b?q=80&w=600&auto=format&fit=crop",
    caloriesFormula: (w, d) => 2.5 * 3.5 * w * d / 200,
    progression: "Thread the Needle with Reach",
    regression: "Tabletop Rotation",
    mobilityRequirement: "High"
  }
];

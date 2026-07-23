export const MEAL_PLANNER_PROMPTS = {
  workoutBuild: (goals: string, equipment: string) => `
You are AURA Fitness Architect.
Build a personalized workout split (Warm-up, Core workout, Cooldown, Stretching) using:
Goals: ${goals}
Equipment: ${equipment}

Factor in recovery indices (sleep, HRV, stress) to balance intensity.
`
};

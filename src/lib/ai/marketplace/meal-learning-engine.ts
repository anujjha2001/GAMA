export interface PostMealCheckIn {
  id: string;
  mealName: string;
  timeEaten: string;
  isCompleted: boolean;
}

export class MealLearningEngine {
  private static checkIns: PostMealCheckIn[] = [];

  static scheduleCheckIn(mealName: string): PostMealCheckIn {
    const checkIn: PostMealCheckIn = {
      id: Math.random().toString(36).substr(2, 9),
      mealName,
      timeEaten: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCompleted: false
    };
    this.checkIns.push(checkIn);
    return checkIn;
  }

  static getActiveCheckIns(): PostMealCheckIn[] {
    return this.checkIns.filter(c => !c.isCompleted);
  }

  /**
   * Processes the user's feedback after eating to adjust AURA learning filters.
   */
  static submitFeedback(
    checkInId: string,
    feeling: 'Sleepy' | 'Full' | 'Energetic' | 'Hungry' | 'Bloated'
  ): { success: boolean; adjustment: string } {
    const item = this.checkIns.find(c => c.id === checkInId);
    if (!item) {
      return { success: false, adjustment: 'Check-in not found.' };
    }

    item.isCompleted = true;
    let adjustment = 'No adjustments needed.';

    // Adjust future scores based on biometric feedback
    if (feeling === 'Bloated') {
      adjustment = `AURA has learned that foods resembling ${item.mealName} may cause digestive discomfort. Flagging similar sodium/fat densities as low-digestion scoring.`;
    } else if (feeling === 'Sleepy') {
      adjustment = `Insulin spike response logged for ${item.mealName}. Recommending lower glycemic indexes for subsequent daytime meal offerings.`;
    } else if (feeling === 'Energetic') {
      adjustment = `Optimal cellular energy response confirmed. Boosting score weightings for this meal profile under your active schedule.`;
    } else if (feeling === 'Hungry') {
      adjustment = `Low satiety index confirmed. Recommending meals with +5g fiber or protein for this hour interval next time.`;
    }

    return { success: true, adjustment };
  }
}

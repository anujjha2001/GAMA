import { TwinMood } from './world-state';

export interface CharacterAnimation {
  name: string;
  description: string;
  durationMs: number;
}

export class CharacterAI {
  private static animationMap: Record<TwinMood, CharacterAnimation[]> = {
    HAPPY: [
      { name: 'SMILE_GENTLY', description: 'Character smiles towards the campfire', durationMs: 4000 },
      { name: 'FEED_BIRDS', description: 'Character throws breadcrumbs to small sparrows', durationMs: 8000 },
      { name: 'PLAY_WITH_LEAVES', description: 'Character catches falling leaves in hand', durationMs: 6000 }
    ],
    MOTIVATED: [
      { name: 'STRETCH_ARMS', description: 'Character stretches arms towards the sky', durationMs: 5000 },
      { name: 'READ_BOOK', description: 'Character reads an ancient leather handbook', durationMs: 12000 },
      { name: 'DRINK_WATER', description: 'Character takes a refreshing sip from their flask', durationMs: 5000 }
    ],
    FOCUSED: [
      { name: 'FOCUS_BREATHING', description: 'Character sits straight and practices box breathing', durationMs: 8000 },
      { name: 'WRITE_JOURNAL', description: 'Character takes notes on a digital tablet', durationMs: 10000 }
    ],
    RELAXED: [
      { name: 'SWING_GENTLY', description: 'Character slowly sways on their wooden swing', durationMs: 10000 },
      { name: 'WATCH_FIRE', description: 'Character looks thoughtfully at campfire sparks', durationMs: 8000 },
      { name: 'MEDITATE', description: 'Character closes eyes and takes deep calming breaths', durationMs: 15000 }
    ],
    CURIOUS: [
      { name: 'LOOK_AT_STARS', description: 'Character points up at constellations in sky', durationMs: 7000 },
      { name: 'LOOK_AT_CURSOR', description: 'Character eyes trace the cursor movement', durationMs: 3000 }
    ],
    TIRED: [
      { name: 'YAWN_DEEPLY', description: 'Character covers mouth and yawns', durationMs: 5000 },
      { name: 'LOOK_EXHAUSTED', description: 'Character leans head back against the swing rope', durationMs: 8000 }
    ],
    SLEEPY: [
      { name: 'SLEEP_UNDER_TREE', description: 'Character slumps asleep under the cozy oak tree', durationMs: 20000 },
      { name: 'WRAP_BLANKET', description: 'Character pulls a woven grey blanket over shoulders', durationMs: 10000 }
    ],
    BURNED_OUT: [
      { name: 'HOLD_KNEES', description: 'Character sits with knees held close to chest', durationMs: 15000 },
      { name: 'SIT_SILENTLY', description: 'Character sits motionless staring downward', durationMs: 12000 }
    ],
    SICK: [
      { name: 'SHIVER_COLD', description: 'Character shivers and rubs arms', durationMs: 6000 },
      { name: 'WRAP_BLANKET_TIGHT', description: 'Character wraps blanket tightly and rests head', durationMs: 15000 }
    ],
    RECOVERING: [
      { name: 'LIGHT_STRETCH', description: 'Character does a simple shoulder stretch', durationMs: 5000 },
      { name: 'DRINK_WATER_RECOVERY', description: 'Character drinks clean water', durationMs: 5000 }
    ]
  };

  static selectNextBehavior(mood: TwinMood, lastAnimationName?: string): CharacterAnimation {
    const list = this.animationMap[mood] || this.animationMap['RELAXED'];
    
    // Weighted random selection
    const choices = list.filter(anim => anim.name !== lastAnimationName);
    const pool = choices.length > 0 ? choices : list;
    
    const index = Math.floor(Math.random() * pool.length);
    return pool[index];
  }
}

'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Dumbbell, Award, Flame, Activity, Zap, Play, Check,
  AlertTriangle, Heart, RefreshCw, BarChart2, Shield, Settings,
  MessageSquare, Mic, Volume2, User, ChevronRight, FileText
} from 'lucide-react';
import { useHealthOS, ActivePanel } from '@/hooks/useHealthOS';
import { WorkoutOS } from '@/lib/workout-studio/WorkoutOS';
import {
  RecoveryEngine, NutritionEngine, NutritionPlan,
  InjuryPredictionEngine, InjuryRiskData, AchievementEngine, UserAchievementInfo
} from '@/lib/workout-studio/BackgroundIntelligence';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { toast } from 'sonner';

interface PanelContainerProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const PanelContainer: React.FC<PanelContainerProps> = ({ title, onClose, children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-md p-4 md:p-6"
    onClick={onClose}
  >
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-full max-w-xl h-full bg-[#0c0c0e]/90 border border-white/10 rounded-[32px] shadow-2xl backdrop-blur-3xl overflow-hidden flex flex-col p-6 relative"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
        <h2 className="text-xl font-black text-white tracking-tight uppercase">{title}</h2>
        <button
          onClick={onClose}
          className="p-2 bg-white/5 border border-white/10 hover:border-white/20 text-neutral-400 hover:text-white rounded-full transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto pr-1 space-y-6">
        {children}
      </div>
    </motion.div>
  </motion.div>
);

export const HealthOSPanels: React.FC = () => {
  const store = useHealthOS();
  const [setupWeight, setSetupWeight] = React.useState(20);
  const [setupReps, setSetupReps] = React.useState(10);
  const [setupSets, setSetupSets] = React.useState(3);
  const [coachingStyle, setCoachingStyle] = React.useState<'ATHLETE' | 'MINDFUL' | 'STRICT'>('ATHLETE');
  const [chatMessage, setChatMessage] = React.useState('');
  const [chatHistory, setChatHistory] = React.useState<Array<{ sender: 'USER' | 'AURA'; text: string }>>([
    { sender: 'AURA', text: 'Hello! I am AURA, your personal Health OS Coach. Ask me anything about your current form, fatigue, recovery level, or nutrition plan.' }
  ]);

  if (!store.activePanel) return null;

  const handleStartSet = () => {
    WorkoutOS.startSet(setupWeight, setupReps, setupSets);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    const history = [...chatHistory, { sender: 'USER' as const, text: chatMessage }];
    setChatHistory(history);
    setChatMessage('');

    setTimeout(() => {
      let reply = 'I am analyzing your query with Health OS. Currently, your training readiness is at ' + store.dailyReadiness + '%.';
      if (chatMessage.toLowerCase().includes('sore') || chatMessage.toLowerCase().includes('fatigue')) {
        reply = `Your current average muscle fatigue is ${store.fatigueScore}%. I recommend prioritizing mobility work on ${store.activeExercise.primaryMuscles.join(', ')} today.`;
      } else if (chatMessage.toLowerCase().includes('form') || chatMessage.toLowerCase().includes('accuracy')) {
        reply = `During your sets of ${store.activeExercise.name}, you achieved ${Math.round(store.accuracy * 100)}% form accuracy. Core stability is looking solid.`;
      } else if (chatMessage.toLowerCase().includes('meal') || chatMessage.toLowerCase().includes('protein')) {
        reply = `Based on your workout, you need roughly 25-30g of protein and 50g of carbohydrates to restore glycogen. Greek yogurt or grilled chicken and quinoa would be ideal.`;
      }
      setChatHistory([...history, { sender: 'AURA' as const, text: reply }]);
    }, 1000);
  };

  // Sub-panel rendering
  switch (store.activePanel) {
    case 'DETAIL': {
      return (
        <PanelContainer title="Exercise Detail" onClose={store.closePanel}>
          <div className="space-y-6">
            <div className="relative h-48 rounded-2xl overflow-hidden border border-white/10 bg-black">
              <img src={store.activeExercise.imageUrl} alt={store.activeExercise.name} className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest">{store.activeExercise.category}</span>
                <h3 className="text-xl font-bold text-white">{store.activeExercise.name}</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                <span className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider block">Equipment Required</span>
                <span className="text-sm font-bold text-white mt-1 block">{store.activeExercise.equipment.join(', ')}</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                <span className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider block">Difficulty level</span>
                <span className="text-sm font-bold text-white mt-1 block">{store.activeExercise.difficulty}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs text-neutral-400 font-extrabold uppercase tracking-widest">Muscles Involved</h4>
              <div className="flex flex-wrap gap-2">
                {store.activeExercise.primaryMuscles.map(m => (
                  <span key={m} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-bold">{m} (Primary)</span>
                ))}
                {store.activeExercise.secondaryMuscles.map(m => (
                  <span key={m} className="px-3 py-1 bg-white/5 border border-white/10 text-neutral-300 rounded-full text-xs font-bold">{m} (Secondary)</span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs text-neutral-400 font-extrabold uppercase tracking-widest">Benefits</h4>
              <p className="text-sm text-neutral-300 leading-relaxed">Strengthens core stability, target muscle hypertrophy, and reinforces biomechanical movement symmetry.</p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs text-rose-400 font-extrabold uppercase tracking-widest">Common Mistakes</h4>
              <ul className="list-disc pl-5 text-sm text-rose-300/80 space-y-1">
                {store.activeExercise.safetyWarnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs text-blue-400 font-extrabold uppercase tracking-widest text-center">Progress History</h4>
              <div className="bg-white/3 border border-white/5 p-4 rounded-2xl h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[{ name: 'Week 1', wt: 15 }, { name: 'Week 2', wt: 17.5 }, { name: 'Week 3', wt: 20 }, { name: 'Week 4', wt: 22.5 }]}>
                    <XAxis dataKey="name" stroke="#666" fontSize={10} />
                    <YAxis stroke="#666" fontSize={10} />
                    <Line type="monotone" dataKey="wt" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </PanelContainer>
      );
    }

    case 'BIOMECHANICS': {
      const risk = InjuryPredictionEngine.evaluateRisk(store.symmetry, store.reps, store.stability);
      return (
        <PanelContainer title="AI Biomechanics Analysis" onClose={store.closePanel}>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-center">
                <span className="text-[10px] text-neutral-500 font-extrabold uppercase block">Accuracy score</span>
                <span className="text-3xl font-black text-white mt-1 block">{Math.round(store.accuracy * 100)}%</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-center">
                <span className="text-[10px] text-neutral-500 font-extrabold uppercase block">Symmetry score</span>
                <span className="text-3xl font-black text-white mt-1 block">{store.symmetry}%</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs text-neutral-400 font-extrabold uppercase tracking-widest">Postural Guidelines</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm border-b border-white/5 pb-2">
                  <span className="text-neutral-400">Back Alignment</span>
                  <span className="text-emerald-400 font-bold">Good</span>
                </div>
                <div className="flex items-center justify-between text-sm border-b border-white/5 pb-2">
                  <span className="text-neutral-400">Knee Tracking</span>
                  <span className="text-emerald-400 font-bold">In-line</span>
                </div>
                <div className="flex items-center justify-between text-sm border-b border-white/5 pb-2">
                  <span className="text-neutral-400">Hip Stability</span>
                  <span className={store.stability > 80 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {store.stability > 80 ? 'Stable' : 'Slight Lateral Wobble'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-2xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white uppercase">Injury Risk Matrix</h4>
                  <p className="text-xs text-neutral-400 mt-1">Load Imbalance: {risk.loadImbalanceRatio * 100}% | Status: <span className="text-rose-400 font-bold">{risk.riskLevel}</span></p>
                  <p className="text-xs text-neutral-300 mt-2">Predicted Path: {risk.predictedRisk}</p>
                </div>
              </div>
            </div>
          </div>
        </PanelContainer>
      );
    }

    case 'SESSION_SETUP': {
      return (
        <PanelContainer title="Start New Set" onClose={store.closePanel}>
          <div className="space-y-6">
            <div>
              <label className="text-xs text-neutral-400 font-extrabold uppercase tracking-wider block mb-2">Weight load (kg)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="120"
                  value={setupWeight}
                  onChange={(e) => setSetupWeight(Number(e.target.value))}
                  className="flex-1 accent-white"
                />
                <span className="text-lg font-black text-white w-16 text-right">{setupWeight} kg</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-neutral-400 font-extrabold uppercase tracking-wider block mb-2">Target Reps</label>
              <div className="flex gap-3">
                {[8, 10, 12, 15].map((r) => (
                  <button
                    key={r}
                    onClick={() => setSetupReps(r)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${setupReps === r ? 'bg-white text-black border-white' : 'bg-white/5 text-white border-white/10 hover:border-white/20'}`}
                  >
                    {r} Reps
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-neutral-400 font-extrabold uppercase tracking-wider block mb-2">Target Sets</label>
              <div className="flex gap-3">
                {[3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSetupSets(s)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${setupSets === s ? 'bg-white text-black border-white' : 'bg-white/5 text-white border-white/10 hover:border-white/20'}`}
                  >
                    {s} Sets
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartSet}
              className="w-full py-4 bg-white text-black font-extrabold text-sm rounded-2xl hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <Play className="w-4 h-4 fill-black" />
              Initialize Interactive Set
            </button>
          </div>
        </PanelContainer>
      );
    }

    case 'SUMMARY': {
      const durationMin = Math.floor(store.activeDuration / 60);
      const durationSec = store.activeDuration % 60;
      return (
        <PanelContainer title="Session Summary" onClose={store.closePanel}>
          <div className="space-y-6">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[24px] text-center">
              <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest block">Workout Completed!</span>
              <h3 className="text-4xl font-black text-white mt-2">Workout Score: 92/100</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                <span className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider">Duration</span>
                <span className="text-xl font-bold text-white mt-1 block">{durationMin}m {durationSec}s</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                <span className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider">Energy Expended</span>
                <span className="text-xl font-bold text-white mt-1 block">{store.caloriesBurned} kcal</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                <span className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider">Sets Logged</span>
                <span className="text-xl font-bold text-white mt-1 block">{store.completedSets.length} Sets</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                <span className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider">Avg Accuracy</span>
                <span className="text-xl font-bold text-white mt-1 block">{Math.round(store.accuracy * 100)}%</span>
              </div>
            </div>

            <button
              onClick={() => {
                store.closePanel();
                toast.success('Workout logged successfully to Health OS database.');
              }}
              className="w-full py-4 bg-white text-black font-extrabold text-sm rounded-2xl hover:bg-neutral-200 transition-all cursor-pointer"
            >
              Log to Dashboard & Close
            </button>
          </div>
        </PanelContainer>
      );
    }

    case 'COACH': {
      return (
        <PanelContainer title="AURA Live Coach" onClose={store.closePanel}>
          <div className="flex flex-col h-full space-y-4">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 overflow-y-auto space-y-3 h-80">
              {chatHistory.map((chat, idx) => (
                <div key={idx} className={`flex ${chat.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${chat.sender === 'USER' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white/10 text-neutral-200 rounded-bl-none'}`}>
                    {chat.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask AURA..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-xs text-white focus:outline-none focus:border-white/20"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-3 bg-white text-black font-bold text-xs rounded-xl hover:bg-neutral-200 transition-all cursor-pointer"
              >
                Send
              </button>
            </div>
          </div>
        </PanelContainer>
      );
    }

    case 'ANALYTICS': {
      const totalRepsCompleted = store.completedSets.reduce((acc, s) => acc + s.repsCompleted, 0) + store.reps;
      return (
        <PanelContainer title="Reps Completed" onClose={store.closePanel}>
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl text-center">
              <span className="text-[10px] text-neutral-400 font-extrabold uppercase block">Active Set Reps</span>
              <span className="text-6xl font-black text-white mt-1 block tracking-tight">{store.reps}</span>
              <span className="text-[10px] text-neutral-500 font-bold block mt-2">Targeting: {store.targetReps} reps in Set {store.currentSetIndex}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                <span className="text-[10px] text-neutral-500 font-extrabold uppercase block">Session Total Reps</span>
                <span className="text-xl font-bold text-white mt-1 block">{totalRepsCompleted}</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                <span className="text-[10px] text-neutral-500 font-extrabold uppercase block">Completed Sets</span>
                <span className="text-xl font-bold text-white mt-1 block">{store.completedSets.length} / {store.targetSets}</span>
              </div>
            </div>

            {store.completedSets.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs text-neutral-400 font-extrabold uppercase tracking-widest">Active Set History</h4>
                <div className="space-y-2">
                  {store.completedSets.map((s, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white/3 border border-white/5 p-3.5 rounded-xl text-xs">
                      <span className="font-bold text-neutral-300">Set {s.setNumber}</span>
                      <span className="text-neutral-400 font-mono">{s.weightKg} kg</span>
                      <span className="font-extrabold text-white">{s.repsCompleted} / {s.repsTarget} Reps</span>
                      <span className="text-blue-400 font-mono">{Math.round(s.avgAccuracy * 100)}% Accuracy</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-xs text-neutral-400 font-extrabold uppercase tracking-widest">Symmetry Progress Chart</h4>
              <div className="bg-white/3 border border-white/5 p-4 rounded-2xl h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[{ name: 'Set 1', sym: store.completedSets[0]?.avgAccuracy * 100 || store.symmetry }, { name: 'Set 2', sym: store.completedSets[1]?.avgAccuracy * 100 || store.symmetry - 2 }, { name: 'Set 3', sym: store.completedSets[2]?.avgAccuracy * 100 || store.symmetry + 1 }]}>
                    <XAxis dataKey="name" stroke="#666" fontSize={9} />
                    <YAxis stroke="#666" fontSize={9} />
                    <Line type="monotone" dataKey="sym" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', radius: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </PanelContainer>
      );
    }

    case 'ANATOMY': {
      return (
        <PanelContainer title="Digital Body Twin" onClose={store.closePanel}>
          <div className="space-y-6 flex flex-col items-center">
            {/* Interactive neon-themed skeletal outline loaded directly from user's upload */}
            <div className="relative w-full max-w-[260px] h-[380px] border border-white/10 rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-lg">
              <img src="/body_structure.jpg" alt="Digital Body Twin Model" className="h-full w-auto object-contain opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e]/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-4 left-4 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] font-black uppercase text-blue-400 tracking-wider">
                Scanning Muscle load
              </div>
            </div>

            <div className="w-full space-y-3">
              <h4 className="text-xs text-neutral-400 font-extrabold uppercase tracking-widest">Active Muscle Load Scores</h4>
              <div className="space-y-2">
                {Object.entries(store.muscleFatigue).map(([muscle, score]) => (
                  <div key={muscle} className="flex justify-between text-xs border-b border-white/5 pb-2.5">
                    <span className="text-neutral-400 font-bold">{muscle}</span>
                    <span className={`font-black ${score > 60 ? 'text-rose-400 animate-pulse' : score > 35 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {Math.round(score)}% Fatigue
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PanelContainer>
      );
    }

    case 'NUTRITION': {
      const mealPlan = NutritionEngine.generatePostWorkoutPlan(store.activeDuration / 60, store.caloriesBurned);
      
      // Calculate live calorie parameters
      const burnRatePerMin = store.activeDuration > 0 
        ? parseFloat(((store.caloriesBurned / store.activeDuration) * 60).toFixed(1)) 
        : 0;
      const predicted30mBurn = Math.round(store.caloriesBurned + (store.activeDuration > 0 ? (store.caloriesBurned / store.activeDuration) * 1800 : 250));

      return (
        <PanelContainer title="Calories Burned" onClose={store.closePanel}>
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center">
              <span className="text-[10px] text-neutral-400 font-extrabold uppercase block">Active Calories Burned</span>
              <span className="text-5xl font-black text-emerald-400 mt-2 block tracking-tight">
                {store.caloriesBurned} <span className="text-base font-normal text-neutral-500">kcal</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/3 border border-white/5 p-4 rounded-xl">
                <span className="text-[9px] text-neutral-500 font-extrabold uppercase block">Live Burn Rate</span>
                <span className="text-lg font-bold text-white mt-1 block">{burnRatePerMin} kcal/min</span>
              </div>
              <div className="bg-white/3 border border-white/5 p-4 rounded-xl">
                <span className="text-[9px] text-neutral-500 font-extrabold uppercase block">Predicted 30m Load</span>
                <span className="text-lg font-bold text-emerald-400 mt-1 block">{predicted30mBurn} kcal</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs text-neutral-400 font-extrabold uppercase tracking-widest">Previous History Logs</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-neutral-400 font-bold">Yesterday</span>
                  <span className="text-neutral-200 font-mono">420 kcal (Squat Practice)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-neutral-400 font-bold">Wednesday, Jul 22</span>
                  <span className="text-neutral-200 font-mono">510 kcal (Split Squats)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-neutral-400 font-bold">Monday, Jul 20</span>
                  <span className="text-neutral-200 font-mono">380 kcal (Kettlebell swings)</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
              <span className="text-[10px] text-neutral-500 font-extrabold uppercase block mb-3">Post-Workout Macro offset</span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/3 p-2.5 rounded-lg">
                  <span className="text-lg font-black text-blue-400 block">{mealPlan.proteinTarget}g</span>
                  <span className="text-[8px] text-neutral-500 uppercase">Protein</span>
                </div>
                <div className="bg-white/3 p-2.5 rounded-lg">
                  <span className="text-lg font-black text-emerald-400 block">{mealPlan.carbsTarget}g</span>
                  <span className="text-[8px] text-neutral-500 uppercase">Carbohydrates</span>
                </div>
                <div className="bg-white/3 p-2.5 rounded-lg">
                  <span className="text-lg font-black text-amber-400 block">{mealPlan.fatTarget}g</span>
                  <span className="text-[8px] text-neutral-500 uppercase">Fats</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs text-neutral-400 font-extrabold uppercase tracking-widest">Suggested Post-Workout Meals</h4>
              <ul className="space-y-2">
                {mealPlan.mealSuggestions.map((m, i) => (
                  <li key={i} className="text-xs text-neutral-300 bg-white/3 border border-white/5 p-3.5 rounded-xl">{m}</li>
                ))}
              </ul>
            </div>
          </div>
        </PanelContainer>
      );
    }

    case 'INJURY': {
      const risk = InjuryPredictionEngine.evaluateRisk(store.symmetry, store.reps, store.stability);
      return (
        <PanelContainer title="Injury Prevention Guard" onClose={store.closePanel}>
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-center">
              <span className="text-[10px] text-neutral-500 font-extrabold uppercase block">Joint Stress Quotient</span>
              <span className="text-3xl font-black text-white mt-1 block">{risk.jointStressScore} / 100</span>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs text-neutral-400 font-extrabold uppercase tracking-widest">Risk Classification</h4>
              <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${risk.riskLevel === 'HIGH' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
                {risk.riskLevel} RISK PROFILE
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs text-neutral-400 font-extrabold uppercase tracking-widest">Safety Action Items</h4>
              <p className="text-xs text-neutral-300 bg-white/3 p-3 rounded-xl">{risk.predictedRisk}</p>
            </div>
          </div>
        </PanelContainer>
      );
    }

    case 'ACHIEVEMENTS': {
      const list = AchievementEngine.checkMilestones(store.reps, store.caloriesBurned);
      return (
        <PanelContainer title="Milestones & Achievements" onClose={store.closePanel}>
          <div className="space-y-4">
            {list.map(ac => (
              <div key={ac.slug} className={`flex items-center gap-4 p-4 border rounded-2xl ${ac.isUnlocked ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/2 border-white/5 opacity-50'}`}>
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-2xl">{ac.badgeUrl}</div>
                <div>
                  <h4 className="text-xs font-bold text-white">{ac.title}</h4>
                  <p className="text-[10px] text-neutral-500 mt-0.5">{ac.description}</p>
                </div>
              </div>
            ))}
          </div>
        </PanelContainer>
      );
    }

    case 'SETTINGS': {
      return (
        <PanelContainer title="Health OS Settings" onClose={store.closePanel}>
          <div className="space-y-6">
            <div>
              <label className="text-xs text-neutral-400 font-extrabold uppercase tracking-wider block mb-2">Coaching Style</label>
              <div className="flex gap-3">
                {(['ATHLETE', 'MINDFUL', 'STRICT'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => {
                      store.setCoachingStyle(style);
                      toast.success(`Coaching style updated to ${style}`);
                    }}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${store.workoutDNA.coachingStyle === style ? 'bg-white text-black border-white' : 'bg-white/5 text-white border-white/10'}`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </PanelContainer>
      );
    }

    default:
      return null;
  }
};

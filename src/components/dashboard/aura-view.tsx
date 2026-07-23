'use client';

import * as React from 'react';
import { Camera, FileUp, Mic, ArrowUp, Sparkles, Send } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  isAnalyzing?: boolean;
  foods?: Array<{
    name: string;
    description: string;
    protein: string;
    calories: string;
    tag: string;
    image: string;
  }>;
}

export function AuraView() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: '1',
      sender: 'user',
      content: 'What should I eat to improve my metabolic efficiency based on my latest labs?',
    },
    {
      id: '2',
      sender: 'assistant',
      content: "Your glycemic variability has been slightly elevated post-meridian. I've curated a few nutrient-dense options that prioritize low-glycemic load and mitochondrial support.",
      foods: [
        {
          name: 'Omega-3 Bio-Bowl',
          description: 'Wild salmon, avocado, spinach & pumpkin seeds.',
          protein: '24g Protein',
          calories: '400 kcal',
          tag: 'Optimal',
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
        },
        {
          name: 'Anti-Inflammatory Roast',
          description: 'Turmeric cauliflower, tahini, & crushed walnuts.',
          protein: '12g Protein',
          calories: '320 kcal',
          tag: 'Crucial',
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
        },
        {
          name: 'Fiber-Rich Fusion',
          description: 'Steel-cut oats, chia, & antioxidant berries.',
          protein: '9g Protein',
          calories: '290 kcal',
          tag: 'Great',
          image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&q=80',
        },
      ],
    },
  ]);

  const [inputValue, setInputValue] = React.useState('');
  const [isPending, setIsPending] = React.useState(false);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMsgId = Math.random().toString();
    const newUserMsg: Message = {
      id: userMsgId,
      sender: 'user',
      content: inputValue,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue('');
    setIsPending(true);

    setTimeout(() => {
      setIsPending(false);
      const assistantMsgId = Math.random().toString();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          sender: 'assistant',
          content: "I've analyzed your telemetry and metabolic data. I recommend focusing on magnesium-rich inputs like dark leafy greens and seeds, alongside 300ml of hydration in the next 30 minutes to buffer muscle recovery.",
        },
      ]);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] justify-between select-none text-[#f3f4f6]">
      
      {/* Message Area */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 pt-2">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-4">
            {/* User message */}
            {msg.sender === 'user' && (
              <div className="flex justify-end">
                <div className="bg-amber-500 text-black text-xs px-5 py-3 rounded-2xl max-w-[500px] shadow-lg font-semibold text-right">
                  {msg.content}
                </div>
              </div>
            )}

            {/* Assistant response */}
            {msg.sender === 'assistant' && (
              <div className="space-y-4 text-left">
                {/* Aura Icon + Text */}
                <div className="flex gap-4 items-start">
                  <div className="h-8 w-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-amber-500 shrink-0">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      AURA AI Analysis
                    </p>
                    <div className="text-xs text-gray-300 leading-relaxed max-w-2xl bg-[#28292c]/40 border border-white/5 px-5 py-3.5 rounded-2xl shadow-xl">
                      {msg.content}
                    </div>
                  </div>
                </div>

                {/* Food recommendation list layout if available */}
                {msg.foods && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-12">
                    {msg.foods.map((food, i) => (
                      <motion.div 
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        key={i} 
                        className="bg-[#28292c]/40 border border-white/5 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between"
                      >
                        <div className="h-32 w-full overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                          <img 
                            src={food.image} 
                            alt={food.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-bold text-sm text-white truncate">
                                {food.name}
                              </h4>
                              <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase shrink-0">
                                {food.tag}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-400 leading-normal line-clamp-2">
                              {food.description}
                            </p>
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 pt-2 border-t border-white/5 uppercase tracking-wider">
                            <span>{food.protein}</span>
                            <span>{food.calories}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isPending && (
          <div className="flex gap-4 items-start animate-pulse">
            <div className="h-8 w-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-amber-500 shrink-0">
              <Sparkles className="h-4 w-4 animate-spin" />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Aura is thinking...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Input Action Panel */}
      <div className="space-y-4 pt-4">
        {/* Attachment Buttons */}
        <div className="flex gap-3 justify-start pl-2">
          <button 
            onClick={() => toast.success('Camera preview opened')}
            className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Camera className="h-4 w-4 text-amber-500" />
            Snap a Photo
          </button>
          <button 
            onClick={() => toast.success('Select document to upload')}
            className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileUp className="h-4 w-4 text-amber-500" />
            Upload Doc
          </button>
        </div>

        {/* Text Input Row */}
        <div className="relative flex items-center bg-[#28292c]/40 border border-white/5 rounded-2xl px-4 py-2">
          <input
            type="text"
            placeholder="Ask Aura anything..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            className="flex-1 bg-transparent border-0 outline-none text-white placeholder:text-gray-500 text-sm focus:ring-0"
          />
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            className="h-10 w-10 bg-white hover:bg-white/90 text-black rounded-full flex items-center justify-center p-0 transition-all shrink-0 ml-2 cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

    </div>
  );
}

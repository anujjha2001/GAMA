'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle, ShieldCheck, Flame, Zap, Droplets, Moon, ArrowRight } from 'lucide-react';
import { Meal } from '@/lib/ai/marketplace/food-provider';
import { useHealthStore } from '@/lib/store';

interface PreOrderChecklistProps {
  meal: Meal;
  onClose: () => void;
  onConfirmRedirect: () => void;
}

export default function PreOrderChecklist({
  meal,
  onClose,
  onConfirmRedirect
}: PreOrderChecklistProps) {
  // Pull daily remaining metrics (from standard health totals or simulated goals)
  const caloriesLimit = 2200;
  const currentLoggedCalories = 1450;
  const remainingCalories = caloriesLimit - currentLoggedCalories;

  const isExceedingCalorie = meal.nutrients.calories > remainingCalories;
  const isHighSodium = meal.nutrients.sodiumMg > 800;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      {/* Click outside to close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-[#0a0807] border border-[#2c1e15] p-6 rounded-[32px] shadow-2xl z-10 space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-500 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div>
          <span className="text-[10px] font-black text-white uppercase tracking-widest block">AURA Pre-Order Health Audit</span>
          <h3 className="text-lg font-black text-white mt-1">Biometrics & Digestion Forecast</h3>
          <p className="text-[11px] text-neutral-400 mt-1">Verifying metabolic compatibility before redirecting to {meal.platform}.</p>
        </div>

        {/* Meal Preview */}
        <div className="flex gap-4 items-center bg-[#14100e] border border-[#2c1e15] p-4 rounded-2xl">
          <img
            src={meal.imageUrl}
            alt={meal.name}
            className="w-16 h-16 rounded-xl object-cover border border-white/5"
          />
          <div>
            <span className="text-xs font-black text-white">{meal.name}</span>
            <span className="text-[9px] text-neutral-500 block uppercase font-bold mt-0.5">{meal.restaurantName}</span>
            <span className="text-[9px] text-neutral-300 font-extrabold mt-1 block">Est. Cost: ₹{meal.price}</span>
          </div>
        </div>

        {/* Warnings / Flags */}
        {(isExceedingCalorie || isHighSodium) && (
          <div className="bg-amber-950/15 border border-amber-900/30 p-4.5 rounded-2xl space-y-2">
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> AURA Biomarker Warnings
            </span>
            <div className="text-[10px] text-neutral-400 space-y-1 pl-1">
              {isExceedingCalorie && (
                <p>⚠ This meal contains <strong className="text-white">{meal.nutrients.calories} kcal</strong>, which exceeds your remaining daily goal allowance of <strong className="text-white">{remainingCalories} kcal</strong>.</p>
              )}
              {isHighSodium && (
                <p>⚠ Elevated sodium levels detected (<strong className="text-white">{meal.nutrients.sodiumMg} mg</strong>). May impact overnight fluid retention and blood pressure sync.</p>
              )}
            </div>
          </div>
        )}

        {/* Physiological Forecast */}
        <div className="space-y-3">
          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Expected Physiological Impact</span>
          
          <div className="grid grid-cols-2 gap-3 text-[10px]">
            <div className="bg-[#1e1714] border border-[#2c1e15] p-3 rounded-xl flex gap-2.5 items-center">
              <Zap className="w-5 h-5 text-neutral-300" />
              <div>
                <span className="text-neutral-500 block">Expected Feeling</span>
                <span className="font-extrabold text-white">{meal.expectedFeeling}</span>
              </div>
            </div>
            <div className="bg-[#1e1714] border border-[#2c1e15] p-3 rounded-xl flex gap-2.5 items-center">
              <Moon className="w-5 h-5 text-indigo-400" />
              <div>
                <span className="text-neutral-500 block">Sleep Quality Impact</span>
                <span className="font-extrabold text-white">Neutral / Good</span>
              </div>
            </div>
            <div className="bg-[#1e1714] border border-[#2c1e15] p-3 rounded-xl flex gap-2.5 items-center">
              <Droplets className="w-5 h-5 text-sky-400" />
              <div>
                <span className="text-neutral-500 block">Hydration Demand</span>
                <span className="font-extrabold text-white">Moderate</span>
              </div>
            </div>
            <div className="bg-[#1e1714] border border-[#2c1e15] p-3 rounded-xl flex gap-2.5 items-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-neutral-500 block">Metabolic Fit Score</span>
                <span className="font-extrabold text-white">{meal.auraScore}/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily remaining details */}
        <div className="bg-[#1e1714] border border-[#2c1e15] p-4.5 rounded-3xl space-y-2 text-[10px]">
          <span className="text-[9px] text-neutral-500 block uppercase font-bold">Estimated Daily Intake Balance</span>
          <div className="flex justify-between">
            <span className="text-neutral-400">Calories Remaining</span>
            <span className="text-white font-extrabold">{remainingCalories - meal.nutrients.calories > 0 ? remainingCalories - meal.nutrients.calories : 0} kcal</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Protein Target Sync</span>
            <span className="text-emerald-400 font-extrabold">+{meal.nutrients.proteinG}g</span>
          </div>
        </div>

        {/* Action Redirection buttons */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={onConfirmRedirect}
            className="w-full py-3 bg-white text-black font-semibold hover:bg-neutral-200 text-black font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            Continue to {meal.platform} App <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#1e1714] border border-[#2c1e15] hover:bg-[#2c1e15] text-white font-bold rounded-2xl text-xs uppercase tracking-wider cursor-pointer transition-colors"
          >
            Cancel and Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}

'use client';

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function HealthOverview() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="w-full flex justify-center mt-2 z-10 relative" style={{ perspective: 1200 }}>
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        animate={{
          y: [0, -15, 0],
        }}
        transition={{
          y: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        className="w-full max-w-5xl rounded-3xl shadow-2xl shadow-indigo-500/10 border border-white/10 cursor-pointer relative"
      >
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-3xl" 
          style={{ transform: "translateZ(30px)" }} 
        />
        
        <img 
          src="/images/devices-hero-clean.png" 
          alt="Health Overview Hero" 
          className="w-full h-auto rounded-3xl object-cover relative z-10"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo.jpg';
          }}
        />
      </motion.div>
    </div>
  );
}

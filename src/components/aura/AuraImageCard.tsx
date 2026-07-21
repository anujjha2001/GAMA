import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export interface ImageCardData {
  title: string;
  imageUrl: string;
  thumbnailUrl: string;
  sourceUrl: string;
  sourceName: string;
  license: string;
  altText: string;
}

interface AuraImageCardProps {
  images: ImageCardData[];
}

export function AuraImageCard({ images }: AuraImageCardProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isLoaded, setIsLoaded] = React.useState(false);

  if (!images || images.length === 0) return null;

  const currentImage = images[activeIndex];

  const handleNext = () => {
    setIsLoaded(false);
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setIsLoaded(false);
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl my-3 max-w-lg group"
    >
      {/* Image Display Area */}
      <div className="relative aspect-video w-full bg-black/40 overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImage.imageUrl}
            src={currentImage.imageUrl}
            alt={currentImage.altText || currentImage.title}
            className={`w-full h-full object-cover transition-all duration-500 ${isLoaded ? 'scale-100 blur-0' : 'scale-105 blur-md'}`}
            onLoad={() => setIsLoaded(true)}
            onError={(e) => {
              console.warn('AuraImageCard image load failed. Using placeholder.');
              setIsLoaded(true);
              e.currentTarget.src = `https://loremflickr.com/800/600/health,wellness?sig=${activeIndex}`;
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        </AnimatePresence>

        {/* Loading Indicator */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-6 h-6 border-2 border-white/20 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Gallery Navigation Overlay */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Source Badge */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] text-neutral-300 font-medium tracking-wide flex items-center gap-1 border border-white/5">
          <ImageIcon className="w-3 h-3 text-neutral-300" />
          <span>{currentImage.sourceName}</span>
        </div>
      </div>

      {/* Info details */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-xs font-bold text-white tracking-wide leading-snug line-clamp-1">
            {currentImage.title}
          </h4>
          <a
            href={currentImage.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-neutral-300 hover:text-white flex items-center gap-1 shrink-0 font-semibold tracking-wider uppercase transition-colors"
          >
            <span>View Source</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>

        <p className="text-[11px] text-neutral-400 leading-normal line-clamp-2">
          {currentImage.altText || 'Visual resource referenced by AURA.'}
        </p>

        {/* Optional Gallery thumbnails row */}
        {images.length > 1 && (
          <div className="flex gap-2 pt-2 overflow-x-auto scrollbar-none">
            {images.map((img, idx) => (
              <button
                key={img.imageUrl}
                onClick={() => {
                  setIsLoaded(false);
                  setActiveIndex(idx);
                }}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                  activeIndex === idx ? 'border-white/20 scale-95' : 'border-white/5 hover:border-white/20'
                }`}
              >
                <img src={img.thumbnailUrl} alt={img.title} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="text-[9px] text-neutral-500/80 pt-1 flex items-center justify-between border-t border-white/5">
          <span>License: {currentImage.license}</span>
          <span>Image {activeIndex + 1} of {images.length}</span>
        </div>
      </div>
    </motion.div>
  );
}

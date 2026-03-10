'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Katakana } from '@/data/katakana';

interface CardProps {
  katakana: Katakana;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
}

export function Card({ katakana, isFlipped, isMatched, onClick }: CardProps) {
  return (
    <motion.div
      className="relative w-full aspect-[3/4] cursor-pointer perspective-1000"
      onClick={onClick}
      whileHover={{ scale: isMatched ? 1 : 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className="absolute inset-0 backface-hidden rounded-xl border-2 border-black/60 shadow-lg overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="w-full h-full bg-gradient-to-br from-black via-[#0a0a0a] to-black relative">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-[#008080]" />
              <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-[#008080]" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-[#008080]" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-[#008080]" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src="/nishi-logo-card.png"
                alt="Nishi Nihongo Gakko"
                width={80}
                height={80}
                className="opacity-90"
                unoptimized
              />
            </div>
            <div className="absolute bottom-3 left-0 right-0 text-center">
              <span className="text-[#008080] text-xs tracking-widest uppercase font-light">
                Nishi
              </span>
            </div>
          </div>
        </div>

        <div
          className="absolute inset-0 backface-hidden rounded-xl border-2 border-[#a04000] shadow-lg flex items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
          }}
        >
          <div className="text-center">
            <motion.span
              className="text-5xl font-bold text-gray-800"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              {katakana.char}
            </motion.span>
            <motion.p
              className="mt-2 text-sm text-gray-500 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {katakana.romaji}
            </motion.p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

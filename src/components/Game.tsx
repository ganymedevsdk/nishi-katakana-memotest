'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import { KATAKANA, DIFFICULTY, Difficulty, Katakana } from '@/data/katakana';

interface CardItem {
  id: number;
  katakana: Katakana;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateCards(difficulty: Difficulty): CardItem[] {
  const { pairs } = DIFFICULTY[difficulty];
  const shuffledKatakana = shuffleArray(KATAKANA);
  const selectedKatakana = shuffledKatakana.slice(0, pairs);
  
  const cards: CardItem[] = [];
  selectedKatakana.forEach((katakana, index) => {
    cards.push({ id: index * 2, katakana });
    cards.push({ id: index * 2 + 1, katakana });
  });
  
  return shuffleArray(cards);
}

export function Game() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedIds, setMatchedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const startNewGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    setCards(generateCards(diff));
    setFlippedCards([]);
    setMatchedIds([]);
    setMoves(0);
    setGameWon(false);
    setIsLocked(false);
    setGameStarted(true);
  }, []);

  useEffect(() => {
    if (gameStarted && matchedIds.length > 0) {
      const { pairs } = DIFFICULTY[difficulty];
      if (matchedIds.length === pairs * 2) {
        setGameWon(true);
      }
    }
  }, [matchedIds, difficulty, gameStarted]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      setIsLocked(true);
      setMoves((prev) => prev + 1);

      const [first, second] = flippedCards;
      const firstCard = cards.find((c) => c.id === first);
      const secondCard = cards.find((c) => c.id === second);

      if (firstCard?.katakana.romaji === secondCard?.katakana.romaji) {
        setMatchedIds((prev) => [...prev, first, second]);
        setFlippedCards([]);
        setIsLocked(false);
      } else {
        setTimeout(() => {
          setFlippedCards([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  }, [flippedCards, cards]);

  const handleCardClick = (id: number) => {
    if (isLocked) return;
    if (flippedCards.includes(id)) return;
    if (matchedIds.includes(id)) return;
    if (flippedCards.length >= 2) return;

    setFlippedCards((prev) => [...prev, id]);
  };

  const { pairs, cols } = DIFFICULTY[difficulty];

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0d0d0d] to-[#1a0505] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-white mb-4 tracking-wider">
              <span className="text-[#ff0000]"> Katakana</span>
              <br />
              <span className="text-[#008080]">Memotest</span>
            </h1>
            <p className="text-gray-400 text-lg">
              西日本語学園 Nishi Nihongo Gakko
            </p>
          </motion.div>

          <div className="space-y-6">
            <p className="text-gray-300 text-center text-lg mb-8">
              難易度を選んでください
              <br />
              <span className="text-sm text-gray-500">Choose difficulty</span>
            </p>

            {(Object.keys(DIFFICULTY) as Difficulty[]).map((diff, index) => (
              <motion.button
                key={diff}
                onClick={() => startNewGame(diff)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="w-full py-4 px-6 rounded-xl border-2 border-[#008080]/50 bg-black/40 text-white text-xl font-medium
                         hover:border-[#008080] hover:bg-[#008080]/20 transition-all duration-300
                         hover:shadow-[0_0_30px_rgba(0,128,128,0.3)]"
              >
                <span className="text-[#008080]">{DIFFICULTY[diff].name}</span>
                <span className="text-gray-500 text-sm ml-3">
                  ({DIFFICULTY[diff].pairs} pairs)
                </span>
              </motion.button>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <p className="text-gray-600 text-sm">
              Inspired by Akira & Sumi-e
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0d0d0d] to-[#1a0505] p-4 md:p-8">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              <span className="text-[#ff0000]">Katakana</span>
              <span className="text-white"> Memory</span>
            </h1>
            <p className="text-gray-500 text-sm">
              {DIFFICULTY[difficulty].name} • {pairs} pairs
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-gray-500 text-xs uppercase tracking-wider">Moves</p>
              <p className="text-2xl font-bold text-[#008080]">{moves}</p>
            </div>
            <button
              onClick={() => startNewGame(difficulty)}
              className="px-4 py-2 rounded-lg bg-[#ff0000]/20 border border-[#ff0000]/50 text-[#ff0000]
                       hover:bg-[#ff0000]/30 transition-colors text-sm font-medium"
            >
              New Game
            </button>
          </div>
        </div>
      </motion.header>

      <main className="max-w-6xl mx-auto">
        <motion.div
          layout
          className="grid gap-3 md:gap-4"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
          <AnimatePresence>
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.02 }}
              >
                <Card
                  katakana={card.katakana}
                  isFlipped={flippedCards.includes(card.id) || matchedIds.includes(card.id)}
                  isMatched={matchedIds.includes(card.id)}
                  onClick={() => handleCardClick(card.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </main>

      <AnimatePresence>
        {gameWon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-2xl p-8 md:p-12 max-w-md w-full text-center border border-[#008080]/30"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <h2 className="text-4xl font-bold text-[#008080] mb-4">
                  お疲れ様!
                </h2>
                <p className="text-gray-400 mb-2">Great job!</p>
              </motion.div>

              <div className="my-8 py-6 border-t border-b border-gray-800">
                <p className="text-gray-500 text-sm uppercase tracking-wider mb-2">Total Moves</p>
                <p className="text-5xl font-bold text-white">{moves}</p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => startNewGame(difficulty)}
                  className="w-full py-3 px-6 rounded-xl bg-[#008080] text-white font-medium
                           hover:bg-[#00a0a0] transition-colors"
                >
                  Play Again
                </button>
                <button
                  onClick={() => setGameStarted(false)}
                  className="w-full py-3 px-6 rounded-xl border border-gray-700 text-gray-400 font-medium
                           hover:border-gray-500 hover:text-white transition-colors"
                >
                  Change Difficulty
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
